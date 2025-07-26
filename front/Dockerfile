# Node.jsベースイメージ
ARG NODE_VERSION=22.17
FROM node:${NODE_VERSION}-bookworm-slim

# 作業ディレクトリ
WORKDIR /front

# 必要パッケージ
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl && \
    rm -rf /var/lib/apt/lists/*

# Corepackを有効化してpnpmを使用可能にする
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack && \
    corepack enable && \
    corepack prepare pnpm@latest --activate && \
    mkdir -p /pnpm/.pnpm-store && \
    pnpm config set store-dir /pnpm/.pnpm-store

# 依存関係を先にインストール（キャッシュ有効化）
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# ソースコードはvolumeでマウントするのでCOPY不要
EXPOSE 5173

# 開発サーバ起動
CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "5173"]