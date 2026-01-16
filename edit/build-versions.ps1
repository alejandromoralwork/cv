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
    
    # Remove version selector
    $html = $html -replace '(?s)<!-- Version Selector -->.*?</div>\s*</div>', ''
    
    # Set default version in select (though it will be hidden)
    $html = $html -replace "value=`"neutral-finance`" selected", "value=`"$version`" selected"
    
    # Update title
    $html = $html -replace '<title>.*?</title>', "<title>$title</title>"
    
    # Add inline script to auto-load version and hide selector
    $versionScript = @"
<style>
.version-selector-container {
  display: none !important;
}
</style>
<script>
// Auto-load specific version on page load
(function() {
  const targetVersion = '$version';
  
  // Override URL parameter detection
  const originalInit = window.CVVersionController ? window.CVVersionController.prototype.loadVersionFromURL : null;
  
  // Wait for DOM and controller
  window.addEventListener('load', function() {
    if (window.cvController) {
      // Force switch to this version
      setTimeout(function() {
        window.cvController.switchVersion(targetVersion);
      }, 100);
    }
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
    
    Write-Host "  ✓ Created $indexPath" -ForegroundColor Green
}

Write-Host "`n✓ All versions built successfully!" -ForegroundColor Green
Write-Host "`nGenerated directories:" -ForegroundColor Cyan
Write-Host "  /fund-accounting/  - Fund Accounting version"
Write-Host "  /finance/          - Finance Professional version"
Write-Host "  /investment/       - Investment Analysis version"
Write-Host "  /fintech/          - FinTech Developer version"
Write-Host "  /developer/        - Software Developer version"
Write-Host "`nEdit your CV in /edit/ and run this script to rebuild all versions." -ForegroundColor Yellow
