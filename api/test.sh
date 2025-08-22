# CSRF=$(curl -s -c cookies.txt http://localhost:3000/csrf | jq -r .csrfToken)
# EMAIL="test@example.com"
# PASSWORD="password"

# # サインインリクエスト
# curl -i -b cookies.txt -c cookies.txt \
#   -X POST http://localhost:3000/users/sign_in \
#   -H "Content-Type: application/x-www-form-urlencoded" \
#   -H "X-CSRF-Token: $CSRF" \
#   -d "user[email]=$EMAIL&user[password]=$PASSWORD"

# AUTH_URL=$(curl -s -L -b cookie.txt -X GET \
# -H "Content-Type: application/x-www-form-urlencoded" \
# -d "response_type=code" \
# -d "client_id=Nea5B3HT2rapVdGQ9pHTFlc4Mh4q8uLAzbjF2UG5UPU" \
# -d "redirect_uri=http://localhost:5173/callback" \
# -d "scope=user" \
# -d "code_challenge=V0L3U-3BpT70SIYfana0ADR4Dk_v6ihhZOzYTZDlGUQ" \
# -d "code_challenge_method=S256" \
# -d "commit=Authorize" \
# http://localhost:3000/oauth/authorize \
# -o /dev/null -w '%{url_effective}\n')

# echo "$AUTH_URL"
# CODE=$(printf '%s' "$AUTH_URL" | sed -n 's/.*[?&]code=\([^&]*\).*/\1/p')
# echo "code: $CODE"

# 2) /oauth/authorize は GET で、クエリ文字列にパラメータを付ける
# CLIENT_ID="Nea5B3HT2rapVdGQ9pHTFlc4Mh4q8uLAzbjF2UG5UPU"
# REDIRECT_URI="http://localhost:5173/callback"
# STATE="abc123"
# SCOPE="public"   # ← Doorkeeperでscope=userを定義していないなら public か 空に
# CHALLENGE="V0L3U-3BpT70SIYfana0ADR4Dk_v6ihhZOzYTZDlGUQ"

# AUTH_RES=$(curl -s -i -b cookies.txt \
#   "http://localhost:3000/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${STATE}&code_challenge=${CHALLENGE}&code_challenge_method=S256")

# # Locationヘッダを表示＆code抽出
# echo "$AUTH_RES" | grep -i '^Location:'
# CODE=$(echo "$AUTH_RES" | sed -n 's/^Location: .*code=\([^&]*\).*/\1/p' | tr -d '\r')
# echo "code: $CODE"

# CLIENT_ID="Nea5B3HT2rapVdGQ9pHTFlc4Mh4q8uLAzbjF2UG5UPU"
# REDIRECT_URI="http://localhost:5173/callback"
# STATE="abc123"
# SCOPE="public"     # か 空にする
# CHALLENGE="V0L3U-3BpT70SIYfana0ADR4Dk_v6ihhZOzYTZDlGUQ"

# AUTH_RES=$(curl -s -i -b cookies.txt \
#   "http://localhost:3000/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${STATE}&code_challenge=${CHALLENGE}&code_challenge_method=S256")

# # ここで 302 が出て Location に code が入っていればOK
# echo "$AUTH_RES" | grep -i '^HTTP/'
# echo "$AUTH_RES" | grep -i '^Location:'
# CODE=$(echo "$AUTH_RES" | sed -n 's/^Location: .*code=\([^&]*\).*/\1/p' | tr -d '\r')
# echo "code=$CODE"

# authorize ページをGETして CSRF取得
CLIENT_ID="Nea5B3HT2rapVdGQ9pHTFlc4Mh4q8uLAzbjF2UG5UPU"
REDIRECT_URI="http://localhost:5173/callback"
STATE="abc123"
SCOPE="public"       # 未定義なら "" に
CHALLENGE="V0L3U-3BpT70SIYfana0ADR4Dk_v6ihhZOzYTZDlGUQ"

AUTH_RES=$(curl -s -i -b cookies.txt \
  "http://localhost:3000/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${STATE}&code_challenge=${CHALLENGE}&code_challenge_method=S256")

echo "$AUTH_RES" | grep -i '^HTTP/'
echo "$AUTH_RES" | grep -i '^Location:'
CODE=$(echo "$AUTH_RES" | sed -n 's/^Location: .*code=\([^&]*\).*/\1/p' | tr -d '\r')
echo "code=$CODE"
