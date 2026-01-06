#!/bin/bash

# Fresh Database Setup Script
# Usage: ./scripts/fresh-setup.sh

set -e  # Exit on error

echo "🚀 Fresh Database Setup"
echo "======================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it first:"
    echo "  export DATABASE_URL=\"your-database-connection-string\""
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Step 1: Push schema
echo "📦 Step 1/4: Pushing schema to database..."
npx prisma db push --skip-generate
echo ""

# Step 2: Generate Prisma Client
echo "🔧 Step 2/4: Generating Prisma Client..."
npx prisma generate
echo ""

# Step 3: Seed database
echo "🌱 Step 3/4: Seeding database with production data..."
npm run db:seed-production
echo ""

# Step 4: Verify
echo "✅ Step 4/4: Verifying setup..."
npm run db:verify
echo ""

echo "🎉 Fresh setup complete!"
echo ""
echo "Next steps:"
echo "  1. Test Prisma Studio: npx prisma studio"
echo "  2. Visit your site: https://academy-lms-zeta.vercel.app/courses"
echo ""
echo "Default admin login:"
echo "  Email: admin@example.com"
echo "  Password: admin123"
echo ""
