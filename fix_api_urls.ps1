# Fix all hardcoded localhost:8001 URLs to use environment variable
# Run this script from the project root

$files = @(
    "next-gen-app/context/AuthContext.tsx",
    "next-gen-app/components/settings/SettingsModal.tsx",
    "next-gen-app/components/MusicPlayer.tsx",
    "next-gen-app/components/mode-switcher/ModeSwitcher.tsx",
    "next-gen-app/components/MediaEditor.tsx",
    "next-gen-app/components/AITextOptimizer.tsx",
    "next-gen-app/app/reset-password/page.tsx",
    "next-gen-app/app/page.tsx",
    "next-gen-app/app/forgot-password/page.tsx"
)

$pattern = '"http://localhost:8001'
$replacement = '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}'

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing $file..." -ForegroundColor Yellow
        $content = Get-Content $file -Raw
        $newContent = $content -replace $pattern, $replacement
        Set-Content $file $newContent -NoNewline
        Write-Host "  ✓ Fixed!" -ForegroundColor Green
    } else {
        Write-Host "  ✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n✅ All files updated!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. git add ." -ForegroundColor White
Write-Host "  2. git commit -m 'fix: Replace all hardcoded API URLs with environment variable'" -ForegroundColor White
Write-Host "  3. git push" -ForegroundColor White
