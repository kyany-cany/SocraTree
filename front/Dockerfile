# Node.jsベース (軽量版)
FROM node:20-alpine

# 作業ディレクトリ
WORKDIR /front

# 依存ファイルのみ先にコピー（キャッシュ用）
COPY package*.json ./

# 依存インストール
RUN npm install

# ソースコードをマウントするのでCOPY不要

# 開発用ポート
EXPOSE 5173

# 開発用コマンド
CMD ["npm", "run", "dev", "--", "--host"]
