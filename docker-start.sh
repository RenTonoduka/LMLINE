#!/bin/bash

# Docker起動スクリプト for LMLINE

echo "🚀 Starting LMLINE application with Docker..."

# 環境変数ファイルの確認
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one based on .env.example"
    echo "📝 Creating .env.example for reference..."
    cat > .env.example << EOF
# Database
DATABASE_URL="postgresql://postgres:password@db:5432/lmline_db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# Firebase
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
FIREBASE_CLIENT_EMAIL="your-firebase-client-email"

# LINE API
LINE_CHANNEL_ACCESS_TOKEN="your-line-channel-access-token"
LINE_CHANNEL_SECRET="your-line-channel-secret"

# Redis
REDIS_URL="redis://redis:6379"

# Application
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED=1
EOF
    echo "📄 Please copy .env.example to .env and configure your environment variables"
    exit 1
fi

# Docker Composeでサービスを起動
echo "🐳 Building and starting Docker containers..."
docker-compose down --volumes --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# ヘルスチェック
echo "🔍 Waiting for services to be ready..."
sleep 10

# データベースのヘルスチェック
echo "🗄️  Checking database connection..."
docker-compose exec db pg_isready -U postgres

# Redisのヘルスチェック
echo "🔴 Checking Redis connection..."
docker-compose exec redis redis-cli ping

# Prismaマイグレーション実行
echo "🔄 Running database migrations..."
docker-compose exec app npx prisma migrate deploy

echo "✅ LMLINE application is starting up!"
echo "🌐 Application will be available at: http://localhost:3000"
echo "🗄️  Database will be available at: localhost:5432"
echo "🔴 Redis will be available at: localhost:6379"
echo ""
echo "📋 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down" 