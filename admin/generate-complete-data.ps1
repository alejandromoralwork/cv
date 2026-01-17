# Generate Complete CV Data JSON for all versions
# This script creates cv-data-complete.json with all fields for each CV version

$ErrorActionPreference = "Stop"

# Read the cv-versions.json file
$versionsJson = Get-Content -Path "cv-versions.json" -Raw | ConvertFrom-Json

# Base data structure (from neutral-finance version in HTML)
$baseData = @{
    "personal" = @{
        "name" = "Alejandro Moral Aranda"
        "jobTitle" = "Finance-IT Enthusiast"
        "photo" = "yo.png"
        "about" = "Strong interest in finance, programming, and mathematics, with a drive to learn new skills and develop practical projects."
    }
    "contact" = @{
        "phone" = "+34 675949628"
        "location" = "Luxembourg"
        "email" = "alejandromoralcontact@gmail.com"
        "website" = "https://alemxral.github.io/cv/"
        "github" = "https://www.github.com/alejandromoralwork"
        "linkedin" = ""
    }
    "education" = @(
        @{
            "degree" = "Bachelor of Finance and Accounting"
            "school" = "University of Malaga"
            "dates" = "Sep. 2019 - Sep. 2022"
            "description" = "University Program in Value Investing, Degree completion one year ahead of schedule"
            "coursework" = @(
                "Program in Valuation Analysis, Investment Analysis Fundamentals, Assets Valuation Methods, Comparable Analysis, DCF (Afi Business School)",
                "Relevant Coursework: Accounting, Corporate Finance, Statistics, Econometrics, Financial Operations"
            )
        },
        @{
            "degree" = "Master of Science in Financial Economics"
            "school" = "University of Luxembourg"
            "dates" = "Sept. 2023 - Sep. 2024"
            "description" = ""
            "coursework" = @(
                "Relevant Coursework: Econometrics (Causal Inference), Programming in R, Financial Econometrics (Time Series), Economics Research, Well-being Research, Survey Data Analysis (Stata), Microeconomics (Dynamic Programming)"
            )
        },
        @{
            "degree" = "Bachelor in Data Science"
            "school" = "IU International University of Applied Sciences"
            "dates" = "Sept. 2024 - Sep.2027 (In progress)"
            "description" = ""
            "coursework" = @(
                "Relevant Coursework: Calculus and Linear Algebra for Data Science, Mathematical Statistics and Inferential Techniques, Probability Theory with Applications in Stochastic Modeling, Comprehensive Database Management and Optimization Techniques, Foundations of Machine Learning and Algorithmic Design, Predictive Analytics and High-Dimensional Data Visualization"
            )
        },
        @{
            "degree" = "C/C++ Coding Program"
            "school" = "42 Luxembourg"
            "dates" = "May. 2025 - Present (In progress)"
            "description" = ""
            "coursework" = @(
                "Relevant Coursework: C Programming, Algorithms and Data Structures, System Programming, Network Programming, Low-Level Programming, Software Engineering Principles"
            )
        }
    )
    "workExperience" = @(
        @{
            "title" = "PERE Fund Accountant & Automation Specialist"
            "company" = "Arendt Investor Services"
            "dates" = "February 2024 - Current"
            "description" = "Fund Accounting for Private Equity and Real Estate Funds (GLP), responsible for preparing financial statements, NAV calculation, CAS compliance, and managing capital activities such as calls and distributions. Developed automation solutions for repetitive workflows, led data migration projects between accounting systems, created custom reporting tools, and provided technical support for accounting software implementations. Skilled in waterfall calculations, fee structures, complex investor allocations, and fund performance analysis."
        },
        @{
            "title" = "Private Equity Fund Accountant"
            "company" = "Intertrust"
            "dates" = "April 2023 - November 2023 (7 months)"
            "description" = "Fund Accounting for Private Equity Funds, Prepare accounting, financial statements, CAS, capital calls, distributions, equalizations, NAV calculation."
        },
        @{
            "title" = "Private Debt Fund Accountant"
            "company" = "Alter Domus"
            "dates" = "April 2022 - May 2023 (1 Year)"
            "description" = "Fund Accounting for Permira Debt Funds, Subordinated Syndicated Loans, Work with financial instruments: Syndicated Loans, ITLs, Swaps, Preferred Equity, Bonds and FX Forwards, Prepare accounting, financial statements, CAS, capital calls, distributions and debt restructuring."
        },
        @{
            "title" = "Wealth Management Internship"
            "company" = "UBS Europe SE"
            "dates" = "October 2021 - March 2022 (6 Months)"
            "description" = "KYC for physical persons, risk profile analysis, AML and management of bank accounts."
        },
        @{
            "title" = "M&A Analyst Internship"
            "company" = "Empresax"
            "dates" = "June 2021 - August 2021 (3 Months)"
            "description" = "Work in a buy-side mandate in the heating industry, Searching for potential acquisition."
        },
        @{
            "title" = "Individual Investor"
            "company" = ""
            "dates" = "2020 - Present (4 Years)"
            "description" = "Portfolio Management of my own investments in stocks and funds, valuation analysis with comparables."
        }
    )
    "skills" = @(
        @{"name" = "Python"; "percent" = 80; "years" = 4; "tags" = @("Backend", "Data Science")},
        @{"name" = "PowerShell"; "percent" = 30; "years" = 2; "tags" = @("Scripting", "Automation")},
        @{"name" = "R"; "percent" = 75; "years" = 3; "tags" = @("Stats", "Analysis")},
        @{"name" = "JavaScript"; "percent" = 70; "years" = 2; "tags" = @("Frontend", "Node")},
        @{"name" = "C/C++"; "percent" = 60; "years" = 1; "tags" = @("Systems")},
        @{"name" = "HTML & CSS"; "percent" = 70; "years" = 3; "tags" = @("Markup", "Styling")},
        @{"name" = "SQL"; "percent" = 85; "years" = 4; "tags" = @("Databases", "SQL")},
        @{"name" = "VBA"; "percent" = 90; "years" = 5; "tags" = @("Macros", "Reporting")}
    )
    "interests" = @(
        @{"name" = "Chess"; "icon" = "fas fa-chess"},
        @{"name" = "Maths"; "icon" = "fas fa-calculator"},
        @{"name" = "Anime"; "icon" = "fas fa-film"},
        @{"name" = "Coding"; "icon" = "fas fa-code"},
        @{"name" = "Football"; "icon" = "fas fa-futbol"}
    )
    "languages" = @(
        @{"name" = "Spanish (Native)"; "flag" = "spain.png"},
        @{"name" = "English (Fluent)"; "flag" = "uk.png"},
        @{"name" = "French (Medium)"; "flag" = "france.png"},
        @{"name" = "Japanese (Basic)"; "flag" = "japan.png"},
        @{"name" = "Chinese (Basic)"; "flag" = "china.png"}
    )
    "projects" = @(
        @{
            "title" = "Polymarket Trading"
            "description" = "Active trader on Polymarket ranking in the top 2% by profitability (1.3M users). Aggregated trading performance and analytics are available via the reference link below. I also serve as a validator for the UMA Oracle, participating in event resolution and validating on-chain price feeds."
            "image" = "polymarket.png"
            "category" = "Trading / Markets / DeFi"
            "links" = @(
                @{"text" = "Polymarket Account"; "url" = "https://polymarket.com/profile/0xF937dBe9976Ac34157b30DD55BDbf248458F6b43"},
                @{"text" = "View trading analytics (Hashdive)"; "url" = "https://www.hashdive.com/Analyze_User?user_address=0xf937dbe9976ac34157b30dd55bdbf248458f6b43"}
            )
            "filterCategory" = "trading"
        },
        @{
            "title" = "Polymarket / Polygon Trading Client, Utility Library & Terminal"
            "description" = "Built a production-grade client for Polymarket/Polygon: REST + WebSocket utilities, order-book adapters and order management. I also developed a fast execution terminal that supports remote strategy deployment and remote order execution (for automated trading), integrating with a custom Exchange contract to perform atomic swaps between binary outcome tokens and collateral."
            "image" = "PMTerminal.PNG"
            "category" = "Python / Trading / Infrastructure"
            "links" = @(@{"text" = "View Project"; "url" = "https://github.com/alemxral/polytrading"})
            "filterCategory" = "web development"
        },
        @{
            "title" = "Algorithmic Trading"
            "description" = "Trading strategy for predicting market open direction using Leave-One-Out Cross-Validation and k-Nearest Neighbors with asymptotically optimal weights."
            "image" = "KNN.png"
            "category" = "Python/Data Science"
            "links" = @(@{"text" = "View Project"; "url" = "https://github.com/alemxral/trading_algo"})
            "filterCategory" = "web development"
        },
        @{
            "title" = "Research Papers"
            "description" = "A collection of research papers that I have authored on topics related to finance and data science."
            "image" = "research.PNG"
            "category" = "Econometrics/Data Science"
            "links" = @(@{"text" = "View Project"; "url" = "https://github.com/alemxral/Research"})
            "filterCategory" = "web development"
        },
        @{
            "title" = "VBA Automated Reporting Tools"
            "description" = "Three advanced tools in Visual Basic for Applications (VBA) designed for large-scale email and report generation. Automate the creation of custom reports using templates configured in Word, Excel, or email formats to meet diverse reporting needs."
            "image" = "VBA.PNG"
            "category" = "Visual Basic for Applications (VBA)"
            "links" = @(@{"text" = "View Project"; "url" = "https://github.com/alemxral/VBA-Automated-Reporting-tools"})
            "filterCategory" = "web development"
        },
        @{
            "title" = "DAS - Document Automation Software"
            "description" = "Python-based document automation system designed for fund reporting and investor communications. Generate customized reports from templates with support for multiple input formats (Excel, CSV, JSON, SQL databases) and output formats (PDF, Word, Excel, HTML). Features advanced template engine with conditional logic, dynamic data binding, variable substitution, batch processing capabilities, and automated scheduling."
            "image" = "DA.PNG"
            "category" = "Python / Automation / Reporting"
            "links" = @(@{"text" = "View Project"; "url" = "#"})
            "filterCategory" = "automation"
        },
        @{
            "title" = "TareaFlow"
            "description" = "A web-based solution with a simple internal PowerShell server that includes a Team Task Tracker, Team Holidays, and Work From Home management tool - all running locally on your localhost with no installation required."
            "image" = "tareaholidays.PNG"
            "category" = "Powershell/JavaScript"
            "links" = @(@{"text" = "View Project"; "url" = "https://github.com/alemxral/TareaFlow/tree/main/Internal"})
            "filterCategory" = "web development"
        },
        @{
            "title" = "MieMieSocks"
            "description" = "A sleek online shop mockup designed for selling stylish socks, developed using Bootstrap and Node.js."
            "image" = "miemiesocks.PNG"
            "category" = "Node.js/JavaScript"
            "links" = @(@{"text" = "View Project"; "url" = "https://miemiesocks.vercel.app/"})
            "filterCategory" = "web development"
        },
        @{
            "title" = "KanjiList.org"
            "description" = "A nonprofit website dedicated to learning Japanese, focusing on mastering kanji and their readings effectively."
            "image" = "kanjilist.PNG"
            "category" = "Python/WebScraping/Web Dev"
            "links" = @(@{"text" = "View Project"; "url" = "https://kanjilist-git-main-alemxrals-projects.vercel.app/"})
            "filterCategory" = "web design"
        }
    )
}

# Version directory mapping
$versionDirMap = @{
    "neutral-finance" = "finance"
    "fund-accounting" = "fund-accounting"
    "reporting-analyst" = "reporting-analyst"
    "investment-analysis" = "investment"
    "fintech" = "fintech"
    "data-science" = "data-science"
    "pure-coding" = "developer"
}

# Generate complete data for all versions
$completeData = @{}

foreach ($versionKey in $versionsJson.PSObject.Properties.Name) {
    $versionConfig = $versionsJson.$versionKey
    
    Write-Host "Generating complete data for: $versionKey" -ForegroundColor Cyan
    
    # Deep clone base data
    $versionData = $baseData | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    
    # Update personal info
    if ($versionConfig.jobTitle) {
        $versionData.personal.jobTitle = $versionConfig.jobTitle
    }
    if ($versionConfig.about) {
        $versionData.personal.about = $versionConfig.about
    }
    
    # Update website URL
    $dirName = $versionDirMap[$versionKey]
    if ($dirName) {
        $versionData.contact.website = "https://alemxral.github.io/cv/$dirName/"
    }
    
    # Apply work description overrides
    if ($versionConfig.workDescriptionOverrides) {
        foreach ($job in $versionData.workExperience) {
            $jobTitle = $job.title
            if ($versionConfig.workDescriptionOverrides.PSObject.Properties[$jobTitle]) {
                $job.description = $versionConfig.workDescriptionOverrides.$jobTitle
            }
        }
    }
    
    # Apply education description overrides
    if ($versionConfig.educationDescriptionOverrides) {
        foreach ($edu in $versionData.education) {
            $degree = $edu.degree
            if ($versionConfig.educationDescriptionOverrides.PSObject.Properties[$degree]) {
                # Replace the first coursework entry with the override
                $edu.coursework[0] = $versionConfig.educationDescriptionOverrides.$degree
            }
        }
    }
    
    # Filter projects if specified
    if ($versionConfig.projectsToShow -and $versionConfig.projectsToShow -ne "all") {
        $allowedProjects = $versionConfig.projectsToShow
        $versionData.projects = $versionData.projects | Where-Object {
            $projectTitle = $_.title
            $allowedProjects -contains $projectTitle
        }
    }
    
    # Reorder work experience if specified
    if ($versionConfig.experienceOrder) {
        $orderedExperience = @()
        foreach ($title in $versionConfig.experienceOrder) {
            $job = $versionData.workExperience | Where-Object { $_.title -eq $title } | Select-Object -First 1
            if ($job) {
                $orderedExperience += $job
            }
        }
        # Add any jobs not in the order list
        $remainingJobs = $versionData.workExperience | Where-Object {
            $jobTitle = $_.title
            $versionConfig.experienceOrder -notcontains $jobTitle
        }
        $orderedExperience += $remainingJobs
        $versionData.workExperience = $orderedExperience
    }
    
    $completeData[$versionKey] = $versionData
}

# Save to JSON file
$outputPath = "cv-data-complete.json"
$completeData | ConvertTo-Json -Depth 10 | Set-Content -Path $outputPath -Encoding UTF8

Write-Host "`nComplete CV data generated successfully!" -ForegroundColor Green
Write-Host "Output file: $outputPath" -ForegroundColor Green
Write-Host "`nGenerated data for versions:" -ForegroundColor Yellow
$completeData.Keys | ForEach-Object { Write-Host "  - $_" }
Write-Host "`nYou can now upload this JSON to Firebase using the admin panel." -ForegroundColor Cyan
