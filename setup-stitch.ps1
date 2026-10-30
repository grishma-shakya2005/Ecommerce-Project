# Google Stitch MCP Setup Script
# This script configures your API key for the MCP server

Write-Host "🔧 Google Stitch MCP Setup" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
$envFile = ".env"
if (Test-Path $envFile) {
    Write-Host "✓ .env file found" -ForegroundColor Green
    $existing = Select-String -Path $envFile -Pattern "STITCH_API_KEY" -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "✓ API key already configured in .env" -ForegroundColor Green
        $proceed = Read-Host "Do you want to update it? (y/n)"
        if ($proceed -ne "y") {
            Write-Host "Setup complete!" -ForegroundColor Green
            exit 0
        }
    }
} else {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
}

# Prompt for API key
Write-Host ""
Write-Host "Enter your Google Stitch API key:" -ForegroundColor Yellow
Write-Host "(You can find this in Google Cloud Console > Stitch API > Credentials)" -ForegroundColor Gray
$apiKey = Read-Host "API Key"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "❌ API key cannot be empty" -ForegroundColor Red
    exit 1
}

# Save to .env file
$envContent = "STITCH_API_KEY=$apiKey"
Set-Content -Path $envFile -Value $envContent -Force
Write-Host "✓ API key saved to .env" -ForegroundColor Green

# Test the connection
Write-Host ""
Write-Host "🧪 Testing MCP server connection..." -ForegroundColor Yellow
$env:STITCH_API_KEY = $apiKey
try {
    $result = & npx.cmd -y @_davideast/stitch-mcp tool list_projects 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Connection successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Your projects:" -ForegroundColor Cyan
        $result | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
    } else {
        Write-Host "⚠ Connection test returned exit code: $LASTEXITCODE" -ForegroundColor Yellow
        Write-Host "Response: $result" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠ Could not test connection (npx may not be installed yet)" -ForegroundColor Yellow
    Write-Host "Error: $_" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Restart VS Code (File > Exit and reopen)"
Write-Host "  2. The MCP server will automatically load with your API key"
Write-Host ""
