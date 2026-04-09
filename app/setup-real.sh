#!/bin/bash
# FACEBOT - Setup for Real Environment

echo "=== FACEBOT Real Setup ==="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    brew install supabase/tap/supabase
fi

# Check if OpenClaw is installed
if ! command -v openclaw &> /dev/null; then
    echo "Installing OpenClaw..."
    npm install -g openclaw@latest
fi

echo ""
echo "=== Configuration Required ==="
echo ""
echo "1. Create Supabase project at https://supabase.com"
echo "2. Get your credentials from Settings > API"
echo "3. Update .env.local with:"
echo ""
echo "   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
echo "   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
echo ""
echo "4. Run database migrations:"
echo "   supabase db push"
echo ""
echo "5. Setup OpenClaw:"
echo "   openclaw onboard --install-daemon"
echo "   openclaw gateway --port 18789 --verbose"
echo ""
echo "6. Add to .env.local:"
echo "   USE_OPENCLAW=true"
echo ""
echo "7. Start the app:"
echo "   npm run dev"
echo ""
