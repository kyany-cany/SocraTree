# syntax=docker/dockerfile:1
ARG RUBY_VERSION=3.4.3
FROM ruby:$RUBY_VERSION-slim

# 作業ディレクトリ（docker-compose.yml でマウント予定）
WORKDIR /app

# パッケージインストール（ビルドツールも含む）
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
        build-essential \
        git \
        libyaml-dev \
        pkg-config \
        curl \
        libjemalloc2 \
        libvips \
        sqlite3 && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# gemキャッシュのためにGemfileだけコピー（初回ビルド用）
COPY Gemfile Gemfile.lock ./
RUN bundle install

# ボリュームでRailsソースをマウントするのでCOPYは不要

# Rails用ポート
EXPOSE 3000

# デフォルトコマンド（docker-compose.yml 側でオーバーライド可）
CMD ["bash", "-c", "rm -f tmp/pids/server.pid && bin/rails s -b 0.0.0.0 -p 3000"]
