#!/bin/bash

# PhonePe Testing Setup Script
# This script helps you set up the PhonePe payment gateway for testing

echo "🚀 Setting up PhonePe Payment Gateway for Testing"
echo "=================================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo "✅ Created .env.local from env.example"
else
    echo "⚠️  .env.local already exists. Please check if it contains PhonePe configuration."
fi

# Check if required environment variables are set
echo ""
echo "🔍 Checking PhonePe environment variables..."

# Source the .env.local file to check variables
if [ -f ".env.local" ]; then
    source .env.local
    
    if [ -z "$PHONEPE_MERCHANT_ID" ]; then
        echo "❌ PHONEPE_MERCHANT_ID is not set"
    else
        echo "✅ PHONEPE_MERCHANT_ID is set"
    fi
    
    if [ -z "$PHONEPE_SALT_KEY" ]; then
        echo "❌ PHONEPE_SALT_KEY is not set"
    else
        echo "✅ PHONEPE_SALT_KEY is set"
    fi
    
    if [ -z "$PHONEPE_BASE_URL" ]; then
        echo "❌ PHONEPE_BASE_URL is not set"
    else
        echo "✅ PHONEPE_BASE_URL is set"
    fi
    
    if [ -z "$NEXT_PUBLIC_SITE_URL" ]; then
        echo "❌ NEXT_PUBLIC_SITE_URL is not set"
    else
        echo "✅ NEXT_PUBLIC_SITE_URL is set"
    fi
else
    echo "❌ .env.local file not found"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Ensure your .env.local file contains the PhonePe configuration"
echo "2. Start your development server: npm run dev"
echo "3. Navigate to a property page and try booking a room"
echo "4. Use the PhonePe testing panel in the admin dashboard"
echo ""
echo "📚 For detailed instructions, see PHONEPE_TESTING.md"
echo ""
echo "🔗 PhonePe Documentation: https://developer.phonepe.com/payment-gateway"
echo ""
echo "✨ Setup complete! Happy testing!"

