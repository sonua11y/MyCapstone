#!/bin/bash

# Usage: ./deploy.sh <environment>
# Example: ./deploy.sh uat

ENV=$1

if [ -z "$ENV" ]; then
    echo "Please specify environment (development/uat/production)"
    exit 1
fi

if [ "$ENV" != "development" ] && [ "$ENV" != "uat" ] && [ "$ENV" != "production" ]; then
    echo "Invalid environment. Use development, uat, or production"
    exit 1
fi

echo "Deploying to $ENV environment..."

# Load environment variables
if [ -f ".env.$ENV" ]; then
    export $(cat .env.$ENV | xargs)
fi

# Backend deployment
cd Backend
echo "Installing backend dependencies..."
npm install

# Set the environment
export NODE_ENV=$ENV

# Frontend deployment
cd ../Frontend
echo "Installing frontend dependencies..."
npm install

# Build frontend
echo "Building frontend..."
npm run build

echo "Deployment to $ENV completed!"

# Additional environment-specific instructions
case $ENV in
    "development")
        echo "Starting development servers..."
        cd ../Backend && npm run dev &
        cd ../Frontend && npm run dev
        ;;
    "uat")
        echo "UAT deployment completed. Please verify at $UAT_FRONTEND_URL"
        ;;
    "production")
        echo "Production deployment completed. Please verify at $PROD_FRONTEND_URL"
        ;;
esac 