Doorkeeper::JWT.configure do
    # RS256 で署名（旧DSL）
    signing_method :rs256
  
    # 秘密鍵ファイル（PEM）
    secret_key_path Rails.root.join("config/jwt/private.pem").to_s
  
    # kid ヘッダが必要になったら token_headers を後で追加すればOK
  
    token_payload do |opts|
      user = User.find(opts[:resource_owner_id])
      {
        iss: "My App",
        iat: Time.current.utc.to_i,
        aud: opts[:application][:uid],
        jti: SecureRandom.uuid,
        sub: user.id.to_s,          # 数値でも動きますが文字列化が無難
        user: { id: user.id, email: user.email }
      }
    end
  
    # use_application_secret は false のままでOK
    use_application_secret false
  end
  