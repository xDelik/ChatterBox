#!/bin/bash
set -e

BASE_URL="http://localhost:5000"
GREEN="\033[0;32m"
RED="\033[0;31m"
NC="\033[0m"

echo "Starting API tests for $BASE_URL"
echo "--------------------------------------"

test_endpoint() {
  local method=$1
  local url=$2
  local data=$3

  echo -e "\n➡️  Testing $method $url"
  if [ "$method" == "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$url")
  else
    response=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" -d "$data" -X "$method" "$BASE_URL$url")
  fi

  body=$(echo "$response" | head -n -1)
  status=$(echo "$response" | tail -n 1)

  if [[ $status =~ ^2 ]]; then
    echo -e "${GREEN}✅ Success ($status)${NC}"
  else
    echo -e "${RED}❌ Failed ($status)${NC}"
  fi
  echo "$body" | jq .
}

# 1. Root route
test_endpoint "GET" "/"

# 2. Get all channels
test_endpoint "GET" "/api/channels"

# 3. Get single channel (1)
test_endpoint "GET" "/api/channels/1"

# 4. Create new channel
test_endpoint "POST" "/api/channels" '{"name":"test","description":"testing channel"}'

# 5. Get messages for channel 1
test_endpoint "GET" "/api/messages/1"

# 6. Send new message
test_endpoint "POST" "/api/messages" '{"channelId":1,"author":"Tester","content":"Hello via curl"}'

echo -e "\n--------------------------------------"
echo -e "${GREEN}All tests executed.${NC}"
