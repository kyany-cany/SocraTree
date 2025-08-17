Rails.application.config.session_store :cookie_store,
  key: "_session",
  secure: Rails.env.production?,     # 本番は必ずtrue（HTTPS前提）
  same_site: :lax                    # 別ドメインなら :none に変更
