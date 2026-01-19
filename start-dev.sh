#!/bin/bash
# Start Netlify dev with environment variables loaded properly

echo "Loading environment variables from .env..."

# Load .env file - properly handle special characters in connection strings
# This exports each variable with proper quoting to handle & characters
set -a
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ "$key" =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue
  # Remove any existing quotes, then add new quotes to handle special chars
  value=$(echo "$value" | sed "s/^['\"]//;s/['\"]$//")
  export "$key"="$value"
done < <(grep -v '^#' .env | grep -v '^$')
set +a

echo "✅ Loaded NETLIFY_DATABASE_URL from .env"
echo ""
echo "Starting Netlify dev server..."
echo "⚠️  Note: 'Failed retrieving addons' error is expected and harmless."
echo "   Functions will use NETLIFY_DATABASE_URL from your .env file."
echo ""
echo "   If you see the error, wait 10-15 seconds then check:"
echo "   - React app: http://localhost:8888"
echo "   - Functions: http://localhost:8888/.netlify/functions/get-settings"
echo ""

# Start Netlify dev - the error about addons won't prevent functions from working
exec npx netlify dev
