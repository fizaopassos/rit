#!/usr/bin/env bash
# Deploy do Rit para a VPS de produção — mesmo esquema do Refix.
#
# O build roda aqui no ti-srv, numa pasta separada do projeto (não toca no
# .next do dev local). O resultado vai pra uma pasta de release nova na VPS e a
# troca é atômica: /root/rit é um symlink pra release ativa. .env e
# credenciais-gcs.json ficam em /root/rit-shared e entram na release por symlink.
#
# Uso:
#   scripts/deploy.sh              build + envio + troca + health check
#   scripts/deploy.sh build        só o build local (não toca na VPS)
#   scripts/deploy.sh releases     lista as releases da VPS
#   scripts/deploy.sh rollback     volta pra release anterior à ativa
#   scripts/deploy.sh rollback <nome-da-release>
#   scripts/deploy.sh setup        conversão única de /root/rit (pasta com git)
#                                  pro layout de releases

set -euo pipefail

VPS=refix-vps
BUILD_DIR=/home/ti/rit-build
RELEASES=/root/rit-releases
SHARED=/root/rit-shared
SHARED_FILES=(.env credenciais-gcs.json)
CURRENT=/root/rit
PM2_APP=rit
PORT=3003
KEEP=3

REPO=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31mERRO: %s\033[0m\n' "$*" >&2; exit 1; }

# nvm não é carregado em shell não interativo
if ! command -v node >/dev/null && [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$HOME/.nvm/nvm.sh"
fi

build() {
  [ "$BUILD_DIR" != "$REPO" ] || die "BUILD_DIR não pode ser a pasta do projeto"

  git -C "$REPO" fetch --quiet origin main
  SHA=$(git -C "$REPO" rev-parse --short HEAD)
  # Produção sempre corresponde a um commit que está no GitHub
  git -C "$REPO" merge-base --is-ancestor HEAD origin/main \
    || die "o commit $SHA não está no origin/main — faça push antes do deploy"
  if [ -n "$(git -C "$REPO" status --porcelain --untracked-files=no)" ]; then
    echo "Aviso: há alterações não commitadas; elas NÃO entram no deploy (build usa só o commit $SHA)."
  fi

  log "Exportando commit $SHA para $BUILD_DIR"
  mkdir -p "$BUILD_DIR"
  local tmp
  tmp=$(mktemp -d)
  git -C "$REPO" archive HEAD | tar -x -C "$tmp"
  # node_modules e .next/cache ficam entre builds pra acelerar
  rsync -a --delete --exclude /node_modules --exclude /.next --exclude /.lock-hash "$tmp"/ "$BUILD_DIR"/
  rm -rf "$tmp"

  cd "$BUILD_DIR"
  local lock_hash
  lock_hash=$(sha256sum package-lock.json | cut -d' ' -f1)
  if [ ! -d node_modules ] || [ "$(cat .lock-hash 2>/dev/null)" != "$lock_hash" ]; then
    log "Instalando dependências (package-lock mudou)"
    npm ci --no-audit --no-fund
    echo "$lock_hash" > .lock-hash
  fi

  log "Gerando Prisma Client e rodando next build"
  npx prisma generate
  npx next build
  echo "$SHA" > REVISION
}

# Aponta o symlink /root/rit pra release dada e reinicia o pm2
switch_to() {
  ssh "$VPS" bash -s -- "$1" "$CURRENT" "$PM2_APP" <<'EOF'
set -euo pipefail
ln -sfn "$1" "$2.new"
mv -Tf "$2.new" "$2"
pm2 restart "$3" >/dev/null
EOF
}

healthy() {
  ssh "$VPS" bash -s -- "$PORT" <<'EOF'
for _ in $(seq 1 45); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$1/login" || true)
  [ "$code" = 200 ] && exit 0
  sleep 1
done
exit 1
EOF
}

link_shared() {
  local rel=$1 f
  for f in "${SHARED_FILES[@]}"; do
    ssh "$VPS" "ln -sfn $SHARED/$f $rel/$f"
  done
}

deploy() {
  build

  ssh "$VPS" "[ -L $CURRENT ]" || die "$CURRENT na VPS não é symlink — rode 'scripts/deploy.sh setup' uma vez antes"
  local prev rel
  prev=$(ssh "$VPS" readlink -f "$CURRENT")
  rel="$RELEASES/$(date +%Y%m%d-%H%M%S)-$SHA"

  log "Enviando para $VPS:$rel"
  # --link-dest: arquivos iguais aos da release ativa viram hard link (não trafegam nem ocupam disco)
  rsync -az --delete --exclude /.next/cache --exclude /.env --exclude /credenciais-gcs.json \
    --link-dest="$prev" "$BUILD_DIR"/ "$VPS:$rel"/
  link_shared "$rel"

  # O Chrome do Puppeteer (comodato/checklist) mora em /root/.cache/puppeteer,
  # fora do node_modules — se a versão do puppeteer mudou, baixa a nova. Idempotente.
  log "Conferindo Chrome do Puppeteer"
  ssh "$VPS" "cd $rel && npx puppeteer browsers install chrome >/dev/null"

  log "Verificando migrations pendentes"
  local status
  status=$(ssh "$VPS" "cd $rel && npx prisma migrate status 2>&1" || true)
  if ! grep -q "Database schema is up to date" <<<"$status"; then
    echo "$status"
    read -r -p "Há migrations pendentes (acima). Aplicar em PRODUÇÃO agora? [s/N] " ans
    [ "$ans" = s ] || die "deploy interrompido antes da troca; produção não foi alterada ($rel ficou na VPS sem uso)"
    ssh "$VPS" "cd $rel && npx prisma migrate deploy"
  fi

  log "Trocando para $rel e reiniciando $PM2_APP"
  switch_to "$rel"

  if ! healthy; then
    echo "Health check falhou — voltando para $prev"
    switch_to "$prev"
    die "deploy revertido. Veja: ssh $VPS pm2 logs $PM2_APP --lines 100"
  fi

  log "Removendo releases antigas (mantém $KEEP)"
  ssh "$VPS" bash -s -- "$RELEASES" "$KEEP" "$(ssh "$VPS" readlink -f "$CURRENT")" <<'EOF'
ls -1d "$1"/*/ | sed 's#/$##' | sort | head -n -"$2" | while read -r old; do
  [ "$old" = "$3" ] || rm -rf -- "$old"
done
EOF

  log "Deploy concluído: $SHA no ar em $rel"
}

rollback() {
  local cur target
  cur=$(ssh "$VPS" readlink -f "$CURRENT")
  if [ -n "${1:-}" ]; then
    target="$RELEASES/$1"
  else
    target=$(ssh "$VPS" "ls -1d $RELEASES/*/ | sed 's#/\$##' | sort" | grep -B1 -Fx "$cur" | head -n1)
    [ "$target" != "$cur" ] || die "não há release anterior à ativa"
  fi
  ssh "$VPS" "[ -d $target ]" || die "release não encontrada: $target"

  log "Rollback: $cur -> $target"
  switch_to "$target"
  healthy || die "a release $target também não respondeu no health check"
  log "Rollback concluído"
}

releases() {
  ssh "$VPS" bash -s -- "$RELEASES" "$CURRENT" <<'EOF'
cur=$(readlink -f "$2")
for r in $(ls -1d "$1"/*/ | sed 's#/$##' | sort); do
  mark=" "; [ "$r" = "$cur" ] && mark="*"
  echo "$mark $(basename "$r")"
done
EOF
}

# Conversão única: /root/rit (clone com git, build feito na VPS) vira a
# primeira release, sem reiniciar nada — o processo do pm2 segue rodando e o
# caminho /root/rit continua válido via symlink.
setup() {
  ssh "$VPS" "[ -d $CURRENT ] && [ ! -L $CURRENT ]" || die "$CURRENT já é symlink (setup já feito) ou não existe"
  read -r -p "Converter $VPS:$CURRENT para o layout de releases? [s/N] " ans
  [ "$ans" = s ] || die "setup cancelado"

  ssh "$VPS" bash -s -- "$CURRENT" "$RELEASES" "$SHARED" "${SHARED_FILES[@]}" <<'EOF'
set -euo pipefail
cur=$1 releases=$2 shared=$3; shift 3
sha=$(git -C "$cur" rev-parse --short HEAD)
rel="$releases/$(date +%Y%m%d-%H%M%S)-$sha"
mkdir -p "$releases" "$shared"
for f in "$@"; do
  [ -e "$shared/$f" ] || cp -a "$cur/$f" "$shared/$f"
done
mv "$cur" "$rel"
for f in "$@"; do
  ln -sfn "$shared/$f" "$rel/$f"
done
ln -s "$rel" "$cur"
echo "Setup concluído: $cur -> $rel"
EOF
  healthy || die "o Rit não respondeu no health check após o setup — verifique: ssh $VPS pm2 logs $PM2_APP"
}

case "${1:-deploy}" in
  deploy)   deploy ;;
  build)    build ;;
  releases) releases ;;
  rollback) rollback "${2:-}" ;;
  setup)    setup ;;
  *) die "comando desconhecido: $1" ;;
esac
