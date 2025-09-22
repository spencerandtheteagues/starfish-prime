#!/bin/bash

API_KEY="rnd_vKob0I2nVrG99ikFj97s3sxKesqT"
REPO_URL="https://github.com/spencerandtheteagues/starfish-prime"

echo "🚀 Deploying Starfish Prime services to Render..."

# API Service
echo "Creating API service..."
curl -X POST "https://api.render.com/v1/services" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "web_service",
    "name": "starfish-prime-api",
    "repo": "'"$REPO_URL"'",
    "branch": "main",
    "runtime": "docker",
    "dockerfilePath": "./services/api/Dockerfile",
    "dockerContext": "./services/api",
    "plan": "starter",
    "region": "oregon",
    "healthCheckPath": "/health",
    "envVars": [
      {"key": "NODE_ENV", "value": "production"},
      {"key": "JWT_SECRET", "value": "starfish-jwt-secret-key-change-in-prod"},
      {"key": "DATABASE_URL", "value": "postgresql://user:pass@localhost:5432/starfish"},
      {"key": "CORS_ORIGINS", "value": "https://starfish-prime-web.onrender.com"}
    ]
  }'

echo -e "\n"

# Web Service
echo "Creating Web service..."
curl -X POST "https://api.render.com/v1/services" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "web_service",
    "name": "starfish-prime-web",
    "repo": "'"$REPO_URL"'",
    "branch": "main",
    "runtime": "docker",
    "dockerfilePath": "./services/web/Dockerfile",
    "dockerContext": "./services/web",
    "plan": "starter",
    "region": "oregon",
    "healthCheckPath": "/health",
    "envVars": [
      {"key": "NODE_ENV", "value": "production"},
      {"key": "NEXT_PUBLIC_API_URL", "value": "https://starfish-prime-api.onrender.com"}
    ]
  }'

echo -e "\n"

# Orchestrator Service
echo "Creating Orchestrator service..."
curl -X POST "https://api.render.com/v1/services" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "private_service",
    "name": "starfish-prime-orchestrator",
    "repo": "'"$REPO_URL"'",
    "branch": "main",
    "runtime": "docker",
    "dockerfilePath": "./services/orchestrator/Dockerfile",
    "dockerContext": "./services/orchestrator",
    "plan": "starter",
    "region": "oregon",
    "healthCheckPath": "/health",
    "envVars": [
      {"key": "NODE_ENV", "value": "production"},
      {"key": "DATABASE_URL", "value": "postgresql://user:pass@localhost:5432/starfish"}
    ]
  }'

echo -e "\n\n✅ Service creation complete!"
echo "🔗 Check status at: https://dashboard.render.com"