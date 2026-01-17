# Fix Firebase-incompatible keys in CV data JSON
# Replace hyphens with underscores in top-level version keys

$json = Get-Content "cv-data-complete.json" -Raw | ConvertFrom-Json

# Create new object with underscore keys
$newData = @{}

# Map old keys to new keys
$keyMapping = @{
    "data-science" = "data_science"
    "fund-accounting" = "fund_accounting"
    "reporting-analyst" = "reporting_analyst"
    "investment-analysis" = "investment_analysis"
    "neutral-finance" = "neutral_finance"
    "fintech" = "fintech"
    "pure-coding" = "pure_coding"
}

foreach ($oldKey in $json.PSObject.Properties.Name) {
    $newKey = if ($keyMapping.ContainsKey($oldKey)) { 
        $keyMapping[$oldKey] 
    } else { 
        $oldKey -replace '-', '_' 
    }
    
    $newData[$newKey] = $json.$oldKey
    Write-Host "Renamed: $oldKey -> $newKey" -ForegroundColor Cyan
}

# Save with proper formatting
$newData | ConvertTo-Json -Depth 20 | Set-Content "cv-data-complete.json" -Encoding UTF8

Write-Host "`nJSON keys fixed! All hyphens replaced with underscores." -ForegroundColor Green
Write-Host "File saved: cv-data-complete.json" -ForegroundColor Green
