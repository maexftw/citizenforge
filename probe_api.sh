API_KEY="noCe6VhHj97uQva8uxTak2AugdD0cpuO"
BASE_URL="https://starcitizen-api.com"
PATTERNS=(
  "/$API_KEY/v1/live/ships"
  "/$API_KEY/v1/cache/ships"
  "/$API_KEY/live/ships"
  "/v1/live/ships?apikey=$API_KEY"
  "/v1/cache/ships?apikey=$API_KEY"
  "/v1/live/vehicles?apikey=$API_KEY"
)

for p in "${PATTERNS[@]}"; do
  echo "Probing $BASE_URL$p ..."
  curl -s -I "$BASE_URL$p" | head -n 1
done
