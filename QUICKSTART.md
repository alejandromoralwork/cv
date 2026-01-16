# 🚀 Quick Start Guide - Multi-Version CV System

## What Was Added

Your CV now has **5 pre-configured versions** that automatically adjust content and styling for different job types:

1. **Fund Accounting** - Conservative, accounting-focused
2. **Finance Professional** - Balanced, general finance
3. **Investment Analysis** - Professional, quant-focused
4. **FinTech Developer** - Modern, tech + finance
5. **Software Developer** - Modern, pure coding

## How to Use Right Now

### 1️⃣ Open Your CV
Just open `index.html` in your browser as usual.

### 2️⃣ See the Version Selector
Look at the **top-right corner** - you'll see a new panel with:
- A dropdown menu
- Quick action buttons for common versions

### 3️⃣ Switch Versions
Click any version button or use the dropdown. The CV will instantly:
- ✅ Update your job title
- ✅ Rewrite your "About Me" section
- ✅ Reorder your work experience
- ✅ Filter relevant projects
- ✅ Highlight key skills
- ✅ Change the visual theme

### 4️⃣ Download Version-Specific PDFs
1. Select the version you want
2. Click the download button (📥)
3. Get a PDF with a version-specific name

## File Changes Made

### ✨ New Files Created:
- `cv-versions.json` - Configuration for all CV versions
- `cv-version-controller.js` - Logic to switch versions
- `cv-themes.css` - Visual themes for different formalism levels
- `README_CV_VERSIONS.md` - Complete documentation
- `QUICKSTART.md` - This file

### 🔧 Modified Files:
- `index.html` - Added version selector UI + script references
- `pdf-generator.js` - Updated to support version-specific filenames

### 📦 Original Files (Unchanged):
- `style.css`, `t.css`, `bc.css` - Your original styles
- `script.js`, `bd.js`, `utils.js` - Your original scripts
- All image files and other assets

## Customizing Your Versions

### Easy Edits in `cv-versions.json`

Open the file and you'll see something like this:

```json
{
  "fund-accounting": {
    "title": "Fund Accountant",
    "jobTitle": "Fund Accounting Specialist",
    "about": "Your customized intro text...",
    "highlightedSkills": ["VBA", "SQL", "Python"],
    ...
  }
}
```

**You can edit:**
- `jobTitle` - What displays under your name
- `about` - Your professional summary
- `highlightedSkills` - Which skills get visual emphasis
- `experienceOrder` - Which jobs show and in what order
- `projectsToShow` - Which projects to display
- `formalism` - Visual theme: "professional", "balanced", or "modern"

### Adding Experience or Projects

**Important**: When you add new work experience or projects to `index.html`, also update the arrays in `cv-versions.json` to include them in the relevant versions.

Match the exact text from your HTML `<span>` tags:
```html
<span>Your New Job Title</span>
```

Then in JSON:
```json
"experienceOrder": [
  "Your New Job Title",
  "Other jobs..."
]
```

## Visual Themes Explained

### Professional Theme
- **Look**: Conservative, corporate
- **Colors**: Muted, traditional
- **Effects**: Minimal animations, no particles
- **Use For**: Traditional finance, accounting firms

### Balanced Theme (Default)
- **Look**: Professional yet modern
- **Colors**: Standard palette
- **Effects**: Moderate animations
- **Use For**: Most general applications

### Modern Theme
- **Look**: Tech-forward, contemporary
- **Colors**: Bright blues, cyan accents
- **Effects**: Enhanced animations, particles
- **Use For**: Tech companies, startups, FinTech

## Testing Your Setup

### Quick Test:
1. Open `index.html` in your browser
2. Click different version buttons
3. Watch the CV change
4. Try downloading a PDF

### Verify Everything Works:
- ✅ Version selector appears (top-right)
- ✅ Dropdown shows all 5 versions
- ✅ Clicking versions changes content
- ✅ Visual theme changes (colors, effects)
- ✅ PDF downloads with correct filename

## Common Questions

**Q: Can I add more versions?**  
A: Yes! Just add a new entry in `cv-versions.json` and update the `<select>` in `index.html`.

**Q: How do I change which version is the default?**  
A: In the `CVVersionController` constructor (line ~12 of `cv-version-controller.js`), change:
```javascript
this.currentVersion = 'neutral-finance'; // Change this
```

**Q: Can I hide the version selector?**  
A: Yes, add this CSS to `style.css`:
```css
.version-selector-container { display: none; }
```

**Q: What if a version shows the wrong content?**  
A: Check that the titles in `cv-versions.json` exactly match the `<span>` text in your HTML.

**Q: How do I share a specific version via link?**  
A: Add `?version=VERSION_KEY` to the URL:
```
https://yourdomain.com/index.html?version=fintech
```

## Next Steps

### For Immediate Use:
1. ✅ Test all 5 versions to see which looks best
2. ✅ Customize the "about" text for each version
3. ✅ Download PDFs for your target roles
4. ✅ Start applying with tailored CVs!

### For Future Updates:
1. Keep `index.html` updated with new experiences
2. Add new items to `cv-versions.json`
3. Test each version after major changes
4. Consider adding industry-specific versions

## Getting Help

- **Full Documentation**: See `README_CV_VERSIONS.md`
- **Browser Console**: Press F12 to see debug messages
- **File Structure**: All configuration in `cv-versions.json`

---

**You're all set! 🎉**

Your CV now automatically tailors itself for different job applications. No more manual editing - just select, download, and apply!

---

**Need More Help?**  
Check the detailed `README_CV_VERSIONS.md` for advanced customization, troubleshooting, and technical details.
