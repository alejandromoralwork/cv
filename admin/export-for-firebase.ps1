# Convert CV data to Firebase-compatible format
# Each CV version becomes a separate document in the cv-data collection

$sourceJson = Get-Content "cv-data-complete.json" -Raw | ConvertFrom-Json

# Create individual JSON files for each version (for Firebase import)
$outputDir = "firebase-import"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

foreach ($version in $sourceJson.PSObject.Properties) {
    $versionKey = $version.Name
    $versionData = $version.Value
    
    # Create a wrapper object with metadata
    $firebaseDoc = @{
        "cvData" = ($versionData | ConvertTo-Json -Depth 20 -Compress)
        "version" = $versionKey
        "lastUpdated" = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    }
    
    $filename = "$outputDir/$versionKey.json"
    $firebaseDoc | ConvertTo-Json -Depth 20 | Set-Content $filename -Encoding UTF8
    
    Write-Host "Created: $filename" -ForegroundColor Green
}

Write-Host "`nAll versions exported to $outputDir/" -ForegroundColor Cyan
Write-Host "Upload these individual files to Firebase Firestore collection 'cv-data'" -ForegroundColor Yellow
Write-Host "Each filename (without .json) should be the document ID" -ForegroundColor Yellow
