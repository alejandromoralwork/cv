# Build Script: Generate Static CV Versions
# This script creates standalone HTML files for each CV version

$versions = @{
    "fund-accounting" = @{
        dir = "..\fund-accounting"
        version = "fund-accounting"
        title = "Alejandro Moral Aranda - Fund Accountant"
    }
    "reporting-analyst" = @{
        dir = "..\reporting-analyst"
        version = "reporting-analyst"
        title = "Alejandro Moral Aranda - Reporting Analyst"
    }
    "finance" = @{
        dir = "..\finance"
        version = "neutral-finance"
        title = "Alejandro Moral Aranda - Finance Professional"
    }
    "investment" = @{
        dir = "..\investment"
        version = "investment-analysis"
        title = "Alejandro Moral Aranda - Investment Analyst"
    }
    "fintech" = @{
        dir = "..\fintech"
        version = "fintech"
        title = "Alejandro Moral Aranda - FinTech Developer"
    }
    "data-science" = @{
        dir = "..\data-science"
        version = "data-science"
        title = "Alejandro Moral Aranda - Data Scientist"
    }
    "developer" = @{
        dir = "..\developer"
        version = "pure-coding"
        title = "Alejandro Moral Aranda - Software Developer"
    }
}

Write-Host "Building static CV versions..." -ForegroundColor Cyan

foreach ($key in $versions.Keys) {
    $config = $versions[$key]
    $dir = $config.dir
    $version = $config.version
    $title = $config.title
    
    Write-Host "`nBuilding $key version..." -ForegroundColor Yellow
    
    # Read the base index.html
    $html = Get-Content "index.html" -Raw
    
    # Remove the auto-load script comment section
    $html = $html -replace '(?s)<!-- Auto-load neutral-finance version -->.*?</script>', ''
    
    # Update title
    $html = $html -replace '<title>.*?</title>', "<title>$title</title>"
    
    # Update website URL to match the version directory
    $websiteUrl = "https://alemxral.github.io/cv/$key/"
    $html = $html -replace 'href="https://alemxral\.github\.io/cv/[^"]*"', "href=`"$websiteUrl`""
    $html = $html -replace '\(CV\) https://alemxral\.github\.io/cv/[^<]*', "(CV) $websiteUrl"
    
    # Add inline script to auto-load version
    $versionScript = @"
<script>
// Auto-load specific version on page load
(function() {
  const targetVersion = '$version';
  
  window.addEventListener('DOMContentLoaded', function() {
    if (window.CVVersionController) {
      if (window.CVVersionController.setVersion) {
        window.CVVersionController.setVersion(targetVersion);
      }
    }
    
    setTimeout(function() {
      if (window.cvController && window.cvController.switchVersion) {
        window.cvController.switchVersion(targetVersion);
      }
    }, 200);
  });
})();
</script>
"@
    
    # Insert before closing </head>
    $html = $html -replace '</head>', "$versionScript`n</head>"
    
    # Write to destination
    $indexPath = Join-Path $dir "index.html"
    $html | Out-File -FilePath $indexPath -Encoding UTF8 -Force
    
    # Copy necessary assets
    Copy-Item "*.css" -Destination $dir -Force -ErrorAction SilentlyContinue
    Copy-Item "*.js" -Destination $dir -Force -ErrorAction SilentlyContinue
    Copy-Item "*.json" -Destination $dir -Force -ErrorAction SilentlyContinue
    Copy-Item "*.png" -Destination $dir -Force -ErrorAction SilentlyContinue
    Copy-Item "*.PNG" -Destination $dir -Force -ErrorAction SilentlyContinue
    
    Write-Host "  Created $indexPath" -ForegroundColor Green
}

Write-Host "`nAll versions built successfully!" -ForegroundColor Green
Write-Host "`nGenerated directories:" -ForegroundColor Cyan
Write-Host "  /fund-accounting/   - Fund Accounting version"
Write-Host "  /reporting-analyst/ - Reporting Analyst version"
Write-Host "  /finance/           - Finance Professional version"
Write-Host "  /investment/        - Investment Analysis version"
Write-Host "  /fintech/           - FinTech Developer version"
Write-Host "  /data-science/      - Data Science version"
Write-Host "  /developer/         - Software Developer version"
Write-Host "`nEdit your CV in /edit/ and run this script to rebuild all versions." -ForegroundColor Yellow
