AUTH_URL=$(curl -s -L -b cookie.txt -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "response_type=code" \
  -d "client_id=Nea5B3HT2rapVdGQ9pHTFlc4Mh4q8uLAzbjF2UG5UPU" \
  -d "redirect_uri=http://localhost:5173/callback" \
  -d "scope=user" \
  -d "code_challenge=V0L3U-3BpT70SIYfana0ADR4Dk_v6ihhZOzYTZDlGUQ" \
  -d "code_challenge_method=S256" \
  -d "commit=Authorize" \
  http://localhost:3000/oauth/authorize \
  -o /dev/null -w '%{url_effective}\n')

echo "$AUTH_URL"
CODE=$(printf '%s' "$AUTH_URL" | sed -n 's/.*[?&]code=\([^&]*\).*/\1/p')
echo "code: $CODE"
