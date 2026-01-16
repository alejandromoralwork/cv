# Multi-Version CV System

## Overview

This CV project now supports **multiple tailored versions** for different job applications, each with customizable content, styling, and formalism levels. Switch between versions seamlessly using the built-in version selector.

---

## 🎯 Available CV Versions

### 1. **Fund Accounting** (`fund-accounting`)
- **Formalism**: Professional
- **Focus**: Fund accounting experience, NAV calculations, financial statements
- **Highlighted Skills**: VBA, SQL, Python, R
- **Best For**: Fund accountant positions, accounting firms

### 2. **Neutral Finance** (`neutral-finance`) *[DEFAULT]*
- **Formalism**: Balanced
- **Focus**: Versatile finance professional with broad experience
- **Highlighted Skills**: Python, R, SQL, VBA, JavaScript
- **Best For**: General finance positions, multi-disciplinary roles

### 3. **Investment Analysis** (`investment-analysis`)
- **Formalism**: Professional
- **Focus**: Investment analysis, quantitative finance, trading
- **Highlighted Skills**: Python, R, SQL, JavaScript
- **Best For**: Investment analyst, quantitative analyst positions

### 4. **FinTech Developer** (`fintech`)
- **Formalism**: Modern
- **Focus**: Blockchain, trading systems, financial technology
- **Highlighted Skills**: Python, JavaScript, SQL, C/C++, HTML & CSS
- **Best For**: FinTech companies, blockchain firms, trading technology

### 5. **Software Developer** (`pure-coding`)
- **Formalism**: Modern
- **Focus**: Full-stack development, data engineering, algorithms
- **Highlighted Skills**: Python, JavaScript, C/C++, SQL, HTML & CSS, PowerShell, R
- **Best For**: Pure software engineering roles, tech companies

---

## 🎨 Formalism Levels

### Professional
- **Appearance**: Conservative, traditional design
- **Colors**: Muted, corporate palette
- **Best For**: Traditional finance, accounting, corporate roles
- **Features**: 
  - Simplified layout
  - No particle effects
  - Clean, readable typography
  - Minimal animations

### Balanced
- **Appearance**: Professional yet approachable
- **Colors**: Default theme with moderate accents
- **Best For**: Most general positions
- **Features**:
  - Standard design elements
  - Moderate visual effects
  - Balanced presentation

### Modern
- **Appearance**: Contemporary, tech-forward
- **Colors**: Vibrant blues and cyan accents
- **Best For**: Tech companies, startups, FinTech
- **Features**:
  - Modern color schemes
  - Enhanced animations
  - Interactive elements
  - Tech-oriented aesthetic

---

## 🚀 How to Use

### Method 1: Version Selector (In-Browser)

1. Open your CV in a browser
2. Look for the **Version Selector** panel (top-right corner)
3. Use the **dropdown menu** or **quick action buttons**
4. The CV will instantly update with the selected version

### Method 2: URL Parameters

Access specific versions directly via URL:

```
index.html?version=fund-accounting
index.html?version=neutral-finance
index.html?version=investment-analysis
index.html?version=fintech
index.html?version=pure-coding
```

### Method 3: Download Version-Specific PDFs

1. Select the desired version using the version selector
2. Click the **Download** button (📥)
3. The PDF will be generated with a version-specific filename:
   - `alejandro_moral_aranda_fund_accounting.pdf`
   - `alejandro_moral_aranda_investment_analysis.pdf`
   - etc.

---

## 🔧 Customization

### Editing Version Content

All version configurations are stored in **`cv-versions.json`**. You can customize:

- **Job Title**: Main professional title displayed
- **About Text**: Personalized introduction
- **Experience Order**: Which jobs to highlight and in what order
- **Projects to Show**: Filter which projects appear
- **Highlighted Skills**: Which technical skills to emphasize
- **Formalism Level**: Visual theme (professional/balanced/modern)

#### Example Configuration:

```json
{
  "your-custom-version": {
    "title": "Your Custom Title",
    "jobTitle": "Your Job Title Display",
    "about": "Your custom about text...",
    "highlightedSkills": ["Python", "JavaScript"],
    "experienceOrder": [
      "Job Title 1",
      "Job Title 2"
    ],
    "educationFocus": ["Degree 1", "Degree 2"],
    "projectsToShow": ["Project 1", "Project 2"],
    "formalism": "modern"
  }
}
```

### Adding New Versions

1. Open `cv-versions.json`
2. Add a new entry following the structure above
3. Update the version selector in `index.html`:

```html
<option value="your-custom-version">Your Custom Label</option>
```

4. Optionally add a quick button:

```html
<button class="version-quick-btn" data-version="your-custom-version">
  <i class="fas fa-icon"></i> Label
</button>
```

### Customizing Formalism Themes

Edit **`cv-themes.css`** to modify the appearance of each formalism level:

- `.formalism-professional` - Conservative theme
- `.formalism-balanced` - Default theme
- `.formalism-modern` - Tech-forward theme
- `.formalism-creative` - Vibrant theme (currently unused)

---

## 📁 File Structure

```
cv/
├── index.html                    # Main CV HTML
├── cv-versions.json              # Version configurations
├── cv-version-controller.js      # Version switching logic
├── cv-themes.css                 # Formalism level styles
├── pdf-generator.js              # PDF generation (updated)
├── style.css                     # Base styles
├── t.css                         # Additional styles
├── bc.css                        # Additional styles
├── script.js                     # General scripts
├── bd.js                         # Additional scripts
├── utils.js                      # Utility scripts
└── README_CV_VERSIONS.md         # This file
```

---

## 🎯 Best Practices

### When Applying for Jobs

1. **Identify the job type** (accounting, investment, tech, etc.)
2. **Select the appropriate version** from the list
3. **Review the content** - ensure highlighted experience matches the role
4. **Download the PDF** with the version-specific name
5. **Rename if needed** for the specific company/application

### Maintaining Multiple Versions

- **Keep content in sync**: Update your main `index.html` with new experiences/projects
- **Update JSON**: Add new items to `cv-versions.json` for each version
- **Test regularly**: Check each version after making changes
- **PDF quality**: Always review generated PDFs before sending

---

## 🔍 Technical Details

### How It Works

1. **Version Controller** (`cv-version-controller.js`):
   - Loads version configurations from JSON
   - Manages content visibility and ordering
   - Applies theme classes dynamically
   - Updates PDF filenames

2. **Dynamic Content Filtering**:
   - Experience items are reordered based on `experienceOrder`
   - Projects are filtered using `projectsToShow`
   - Skills are highlighted via `highlightedSkills`

3. **Theme System**:
   - CSS classes applied to `<body>` element
   - Cascading styles override defaults
   - Smooth transitions between themes

4. **PDF Generation**:
   - Version-specific filenames
   - Hides version selector in PDF
   - Preserves current version styling

---

## 🐛 Troubleshooting

### Version Not Switching
- **Check browser console** for errors
- **Verify JSON syntax** in `cv-versions.json`
- **Clear browser cache** and reload

### Content Not Filtering
- **Ensure exact matches**: Titles in JSON must match HTML exactly
- **Check spelling**: Case-sensitive matching
- **Inspect DOM**: Use browser DevTools to verify element visibility

### PDF Issues
- **Allow time for generation**: Large CVs may take 5-10 seconds
- **Check permissions**: Browser may block downloads
- **Disable extensions**: Ad blockers can interfere with PDF generation

### Styling Problems
- **Check theme CSS**: Ensure `cv-themes.css` is loaded
- **Verify formalism value**: Must be "professional", "balanced", or "modern"
- **Browser compatibility**: Use modern browsers (Chrome, Firefox, Edge)

---

## 📊 Quick Reference Table

| Version | Job Title | Formalism | Primary Skills | Target Roles |
|---------|-----------|-----------|----------------|--------------|
| **fund-accounting** | Fund Accounting Specialist | Professional | VBA, SQL, Python | Fund Accountant, Financial Analyst |
| **neutral-finance** | Finance & Data Analytics | Balanced | Python, R, SQL | Finance Professional, Analyst |
| **investment-analysis** | Investment & Quant Analyst | Professional | Python, R, SQL | Investment Analyst, Portfolio Manager |
| **fintech** | FinTech & Blockchain Dev | Modern | Python, JS, C++ | FinTech Developer, Blockchain Engineer |
| **pure-coding** | Full-Stack Developer | Modern | Python, JS, C++, SQL | Software Engineer, Data Engineer |

---

## 🚧 Future Enhancements

Potential improvements to consider:

- [ ] Add more formalism levels (ultra-professional, creative)
- [ ] Language-specific versions (Spanish, French)
- [ ] Industry-specific icons and color schemes
- [ ] A/B testing metrics for version effectiveness
- [ ] Template system for easy duplication
- [ ] Dark mode variants
- [ ] Mobile-optimized PDF layouts
- [ ] Version comparison tool
- [ ] Analytics to track which versions perform best

---

## 📝 License & Credits

- **Author**: Alejandro Moral Aranda
- **Version System**: Custom implementation
- **Libraries Used**: 
  - html2pdf.js (PDF generation)
  - pdf-lib (PDF merging)
  - Font Awesome (Icons)
  - particles.js (Background effects)

---

## 💡 Tips for Success

1. **Tailor each application**: Even with versions, customize the "About" section for each company
2. **Keep it updated**: Add new projects and experiences regularly
3. **Test before sending**: Always preview PDFs before submission
4. **Get feedback**: Ask peers to review different versions
5. **Track results**: Note which versions get the best responses
6. **Stay consistent**: Ensure all versions reflect accurate information
7. **Professional presentation**: Use high-quality images and proper formatting

---

**Last Updated**: January 2026  
**Version**: 2.0  
**Contact**: alejandromoralcontact@gmail.com
