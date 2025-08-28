# PhonePe Testing Setup Script for Windows
# This script helps you set up the PhonePe payment gateway for testing

Write-Host "🚀 Setting up PhonePe Payment Gateway for Testing" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env.local"
    Write-Host "✅ Created .env.local from env.example" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local already exists. Please check if it contains PhonePe configuration." -ForegroundColor Yellow
}

# Check if required environment variables are set
Write-Host ""
Write-Host "🔍 Checking PhonePe environment variables..." -ForegroundColor Cyan

# Read .env.local file to check variables
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local"
    
    $merchantId = $envContent | Where-Object { $_ -match "^PHONEPE_MERCHANT_ID=" } | ForEach-Object { $_.Split("=", 2)[1] }
    $saltKey = $envContent | Where-Object { $_ -match "^PHONEPE_SALT_KEY=" } | ForEach-Object { $_.Split("=", 2)[1] }
    $baseUrl = $envContent | Where-Object { $_ -match "^PHONEPE_BASE_URL=" } | ForEach-Object { $_.Split("=", 2)[1] }
    $siteUrl = $envContent | Where-Object { $_ -match "^NEXT_PUBLIC_SITE_URL=" } | ForEach-Object { $_.Split("=", 2)[1] }
    
    if (-not $merchantId) {
        Write-Host "❌ PHONEPE_MERCHANT_ID is not set" -ForegroundColor Red
    } else {
        Write-Host "✅ PHONEPE_MERCHANT_ID is set" -ForegroundColor Green
    }
    
    if (-not $saltKey) {
        Write-Host "❌ PHONEPE_SALT_KEY is not set" -ForegroundColor Red
    } else {
        Write-Host "✅ PHONEPE_SALT_KEY is set" -ForegroundColor Green
    }
    
    if (-not $baseUrl) {
        Write-Host "❌ PHONEPE_BASE_URL is not set" -ForegroundColor Red
    } else {
        Write-Host "✅ PHONEPE_BASE_URL is set" -ForegroundColor Green
    }
    
    if (-not $siteUrl) {
        Write-Host "❌ NEXT_PUBLIC_SITE_URL is not set" -ForegroundColor Red
    } else {
        Write-Host "✅ NEXT_PUBLIC_SITE_URL is set" -ForegroundColor Green
    }
} else {
    Write-Host "❌ .env.local file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Ensure your .env.local file contains the PhonePe configuration"
Write-Host "2. Start your development server: npm run dev"
Write-Host "3. Navigate to a property page and try booking a room"
Write-Host "4. Use the PhonePe testing panel in the admin dashboard"
Write-Host ""
Write-Host "📚 For detailed instructions, see PHONEPE_TESTING.md"
Write-Host ""
Write-Host "🔗 PhonePe Documentation: https://developer.phonepe.com/payment-gateway"
Write-Host ""
Write-Host "✨ Setup complete! Happy testing!" -ForegroundColor Green

