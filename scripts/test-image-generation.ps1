# PowerShell script to test image generation
# Usage: .\scripts\test-image-generation.ps1

$body = @{
    prompt = "A simple minimalist logo for a coffee shop called 'Bean There', flat design, warm brown colors"
} | ConvertTo-Json

Write-Host "Testing image generation..."
Write-Host "Sending request to http://localhost:9002/api/test/logo-generation"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:9002/api/test/logo-generation" -Method POST -ContentType "application/json" -Body $body
    
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    
    if ($response.success) {
        Write-Host "`n✅ SUCCESS! Image generated" -ForegroundColor Green
        Write-Host "Image URL: $($response.imageUrl.Substring(0, 50))..." -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ FAILED: $($response.error)" -ForegroundColor Red
        Write-Host "Details: $($response.details)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n❌ REQUEST FAILED" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Yellow
    Write-Host "`nMake sure the dev server is running: npm run dev" -ForegroundColor Cyan
}
