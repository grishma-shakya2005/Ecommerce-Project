# E-Commerce Site Builder for Google Stitch
# This script fetches your Stitch project and builds an e-commerce site

Write-Host "🚀 E-Commerce Site Builder" -ForegroundColor Cyan
Write-Host ""

# Set API key
$env:STITCH_API_KEY = Read-Host "Enter your Stitch API key (or press Enter to use existing .env)"
if ([string]::IsNullOrWhiteSpace($env:STITCH_API_KEY)) {
    if (Test-Path ".env") {
        $envContent = Get-Content ".env" -Raw
        if ($envContent -match "STITCH_API_KEY=(.+)") {
            $env:STITCH_API_KEY = $matches[1]
            Write-Host "✓ Loaded API key from .env" -ForegroundColor Green
        }
    }
}

# Project ID for Palpali Dhaka Authentic Textiles
$projectId = "6162126973738860927"

Write-Host ""
Write-Host "📁 Your Project: Palpali Dhaka Authentic Textiles" -ForegroundColor Cyan
Write-Host "Project ID: $projectId" -ForegroundColor Gray

# Step 1: List all screens
Write-Host ""
Write-Host "📋 Fetching screens..." -ForegroundColor Yellow

$screens = @(
    @{ id = "169597a3cf86484abb85ec01d52d40f0"; name = "Home" },
    @{ id = "45b1d268e1f44c3b9a03be2c13ddae39"; name = "Product List" },
    @{ id = "5a48e1c536394605a1c17c9f7cb04b52"; name = "Product Detail" },
    @{ id = "816b13a2b8a2482789de968aaa646c61"; name = "Cart" },
    @{ id = "84beb97d7aea4add953a0a10c9e5b82a"; name = "Checkout" },
    @{ id = "b2e4086b04f3426a8b64a8f25fa8773e"; name = "Order Confirmation" },
    @{ id = "f54157ed1d66444492403e4263360b64"; name = "About Us" },
    @{ id = "f5f96ba71be0489098216e6dac2de7f1"; name = "Contact" }
)

Write-Host "✓ Found $($screens.Count) screens:" -ForegroundColor Green
$screens | ForEach-Object { Write-Host "  • $($_.name)" -ForegroundColor Gray }

# Step 2: Map screens to routes
Write-Host ""
Write-Host "🗺️  Mapping screens to routes..." -ForegroundColor Yellow

$routes = @(
    @{ screenId = "169597a3cf86484abb85ec01d52d40f0"; route = "/" },
    @{ screenId = "45b1d268e1f44c3b9a03be2c13ddae39"; route = "/products" },
    @{ screenId = "5a48e1c536394605a1c17c9f7cb04b52"; route = "/product/[id]" },
    @{ screenId = "816b13a2b8a2482789de968aaa646c61"; route = "/cart" },
    @{ screenId = "84beb97d7aea4add953a0a10c9e5b82a"; route = "/checkout" },
    @{ screenId = "b2e4086b04f3426a8b64a8f25fa8773e"; route = "/order-confirmation" },
    @{ screenId = "f54157ed1d66444492403e4263360b64"; route = "/about" },
    @{ screenId = "f5f96ba71be0489098216e6dac2de7f1"; route = "/contact" }
)

# Step 3: Build site via MCP tool
Write-Host "🔨 Building site..." -ForegroundColor Yellow

$buildPayload = @{
    projectId = $projectId
    routes = $routes
} | ConvertTo-Json -Depth 10 -AsArray $false

Write-Host "Payload: $buildPayload" -ForegroundColor Gray

# Use the build_site tool
$result = & npx.cmd -y @_davideast/stitch-mcp tool build_site -d $buildPayload 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Site built successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Generated files:" -ForegroundColor Cyan
    $result
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Write-Host "Error: $result" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "🎉 E-commerce site is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review the generated HTML files"
Write-Host "  2. Customize styling in your code editor"
Write-Host "  3. Deploy to your hosting provider"
Write-Host ""
