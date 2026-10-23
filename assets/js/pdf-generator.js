// PDF Generator for CV - configurable export modes
// Standard mode keeps the visual HTML snapshot.
// Frozen mode adds ATS-friendly PDF metadata and an invisible text layer.

const PDF_EXPORT_DEFAULTS = {
  includeProjects: true,
  mode: 'normal'
};

const ATS_PROFILES = {
  ai_data_engineer: {
    role: 'Senior AI Engineer',
    focus: 'machine learning, data engineering, model deployment, Python, MLOps',
    keywords: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'ML pipelines', 'data engineering', 'APIs', 'cloud']
  },
  backend_systems_architect: {
    role: 'Senior Backend Systems Architect',
    focus: 'distributed systems, microservices, Java, Node.js, APIs, cloud architecture',
    keywords: ['Java', 'Node.js', 'Microservices', 'Distributed systems', 'REST APIs', 'AWS', 'Docker', 'Kubernetes']
  },
  cloud_platform: {
    role: 'Senior Cloud Platform Engineer',
    focus: 'cloud infrastructure, Kubernetes, Docker, CI/CD, platform engineering',
    keywords: ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'platform engineering', 'infrastructure automation', 'observability', 'security']
  },
  pure_coding: {
    role: 'Senior Software Engineer',
    focus: 'full-stack development, clean architecture, TypeScript, React, Node.js',
    keywords: ['TypeScript', 'React', 'Node.js', 'REST APIs', 'software design', 'testing', 'performance', 'clean code']
  },
  finance_data_analyst: {
    role: 'Finance and Data Analyst',
    focus: 'financial data analysis, financial economics, trading, quantitative methods, reporting automation',
    keywords: ['Financial Analysis', 'Data Analysis', 'Financial Econometrics', 'Python', 'SQL', 'R', 'VBA', 'Trading']
  }
};

function normalizePdfOptions(options) {
  if (typeof options === 'boolean') {
    return { ...PDF_EXPORT_DEFAULTS, includeProjects: options };
  }

  if (typeof options === 'string') {
    return { ...PDF_EXPORT_DEFAULTS, mode: options };
  }

  return { ...PDF_EXPORT_DEFAULTS, ...(options || {}) };
}

function getCurrentCvContext() {
  const controller = window.cvController;
  const current = controller && typeof controller.getCurrentVersion === 'function'
    ? controller.getCurrentVersion()
    : null;

  const key = current?.key || window.cvStaticVersion || 'resume';
  const data = current?.data || controller?.cvData || window.cvStaticData || {};

  return { key, data };
}

function getAtsProfile(versionKey, cvData) {
  const normalizedKey = (versionKey || '').replace(/-/g, '_');
  const profile = ATS_PROFILES[normalizedKey] || {};
  const name = cvData?.personal?.name?.trim() || 'Alejandro Moral Aranda';
  const jobTitle = cvData?.personal?.jobTitle?.trim() || profile.role || 'Senior Software Engineer';
  const focus = profile.focus || jobTitle;
  const skills = Array.isArray(cvData?.skills)
    ? cvData.skills.map(skill => skill?.name).filter(Boolean)
    : [];

  return {
    name,
    jobTitle,
    focus,
    keywords: Array.from(new Set([...(profile.keywords || []), ...skills])).slice(0, 16)
  };
}

function buildPdfMetadata(versionKey, cvData, mode) {
  const profile = getAtsProfile(versionKey, cvData);
  const location = cvData?.contact?.location ? `, ${cvData.contact.location}` : '';
  const title = `${profile.name} - ${profile.jobTitle}`;
  const subject = `${profile.jobTitle} CV${location}`;
  const keywords = Array.from(new Set([
    profile.jobTitle,
    profile.focus,
    ...(profile.keywords || []),
    cvData?.personal?.about,
    cvData?.contact?.location,
    mode === 'frozen' ? 'ATS friendly' : 'standard PDF'
  ].filter(Boolean).flatMap(value => String(value).split(/,\s*/))));

  return {
    title,
    subject,
    keywords,
    creator: 'GitHub Copilot CV exporter',
    producer: 'pdf-lib / html2pdf',
    author: profile.name,
    modeLabel: mode === 'frozen' ? 'Frozen ATS PDF' : 'Standard PDF'
  };
}

function buildAtsText(cvData, versionKey) {
  const profile = getAtsProfile(versionKey, cvData);
  const experienceLines = Array.isArray(cvData?.workExperience)
    ? cvData.workExperience.map(work => [work?.title, work?.company, work?.description].filter(Boolean).join(' ')).filter(Boolean)
    : [];
  const educationLines = Array.isArray(cvData?.education)
    ? cvData.education.map(edu => [edu?.degree, edu?.school, edu?.description].filter(Boolean).join(' ')).filter(Boolean)
    : [];

  return [
    `Candidate: ${profile.name}`,
    `Target role: ${profile.jobTitle}`,
    `Professional focus: ${profile.focus}`,
    `Location: ${cvData?.contact?.location || 'Not specified'}`,
    `Summary: ${cvData?.personal?.about || ''}`,
    `Core skills: ${profile.keywords.join(', ')}`,
    `Experience: ${experienceLines.join(' | ')}`,
    `Education: ${educationLines.join(' | ')}`
  ].filter(Boolean).join('\n');
}

function applySnapshotMode(enabled) {
  const styleId = 'pdf-snapshot-mode-style';
  let styleEl = document.getElementById(styleId);

  if (enabled) {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = `
        html.pdf-snapshot-mode *,
        html.pdf-snapshot-mode *::before,
        html.pdf-snapshot-mode *::after {
          animation: none !important;
          animation-delay: 0s !important;
          animation-duration: 0s !important;
          transition: none !important;
          caret-color: transparent !important;
        }
        html.pdf-snapshot-mode {
          scroll-behavior: auto !important;
        }
      `;
      document.head.appendChild(styleEl);
    }

    document.documentElement.classList.add('pdf-snapshot-mode');
    return;
  }

  document.documentElement.classList.remove('pdf-snapshot-mode');
  if (styleEl) {
    styleEl.remove();
  }
}

function applyPdfMetadata(pdfDoc, metadata) {
  if (!pdfDoc || !metadata) return;

  if (typeof pdfDoc.setTitle === 'function') pdfDoc.setTitle(metadata.title);
  if (typeof pdfDoc.setSubject === 'function') pdfDoc.setSubject(metadata.subject);
  if (typeof pdfDoc.setKeywords === 'function') pdfDoc.setKeywords(metadata.keywords);
  if (typeof pdfDoc.setAuthor === 'function') pdfDoc.setAuthor(metadata.author);
  if (typeof pdfDoc.setCreator === 'function') pdfDoc.setCreator(metadata.creator);
  if (typeof pdfDoc.setProducer === 'function') pdfDoc.setProducer(metadata.producer);
  if (typeof pdfDoc.setCreationDate === 'function') pdfDoc.setCreationDate(new Date());
  if (typeof pdfDoc.setModificationDate === 'function') pdfDoc.setModificationDate(new Date());
}

async function generateResumePDF(customFileName = null, options = {}) {
  const { includeProjects, mode } = normalizePdfOptions(options);
  console.log(`Starting PDF generation - ${mode} mode, ${includeProjects ? '2 pages' : '1 page'}...`);
  
  // Ensure GitHub icon is loaded and visible for PDF
  const githubIcon = document.querySelector('.github-social-icon');
  if (githubIcon) {
    // Force Font Awesome to render the icon
    if (window.FontAwesome && window.FontAwesome.config) {
      window.FontAwesome.config.observeMutationsFast = false;
    }
    githubIcon.style.display = 'flex';
    githubIcon.style.visibility = 'visible';
    githubIcon.style.opacity = '1';
    console.log('GitHub icon ensured visible for PDF generation');
  }
  
  // Get current version for filename if not provided
  let fileName = customFileName;
  const cvContext = getCurrentCvContext();
  if (!fileName) {
    fileName = `alejandro_moral_aranda_${cvContext.key.replace(/-/g, '_')}_${mode}${includeProjects ? '_projects' : ''}.pdf`;
  }
  if (!fileName) {
    fileName = 'alejandro_moral_aranda_resume.pdf';
  }
  
  // Hide particles temporarily
  const particlesBg = document.getElementById('particles-background');
  const particlesFg = document.getElementById('particles-foreground');
  const navbar = document.querySelector('.navbar');
  const versionSelector = document.querySelector('.version-selector-container');
  
  const originalStyles = {
    particlesBg: particlesBg ? particlesBg.style.display : null,
    particlesFg: particlesFg ? particlesFg.style.display : null,
    navbar: navbar ? navbar.style.display : null,
    versionSelector: versionSelector ? versionSelector.style.display : null,
    bodyBg: document.body.style.background
  };

  try {
    applySnapshotMode(mode === 'frozen');

    // Hide particles, navbar, and version selector
    if (particlesBg) particlesBg.style.display = 'none';
    if (particlesFg) particlesFg.style.display = 'none';
    if (navbar) navbar.style.display = 'none';
    if (versionSelector) versionSelector.style.display = 'none';
    document.body.style.background = '#ffffff';

    // Get the main resume element (CV content - includes both .base and .func)
    const resumeElement = document.querySelector('.resume');
    const projectsElement = document.querySelector('.projects');
    
    if (!resumeElement) {
      alert('Could not find CV content');
      return;
    }

    // Create a wrapper to center and fit content for PDF
    const A4_WIDTH_PX = 794;  // 210mm at 96dpi
    const A4_HEIGHT_PX = 1123; // 297mm at 96dpi
    const page1Container = document.createElement('div');
    page1Container.id = 'pdf-page-1';
    page1Container.style.background = '#fff'; // Use white for visibility
    page1Container.style.width = 'auto';      // Let content define width
    page1Container.style.minWidth = '900px';  // Ensure enough space for sidebar
    page1Container.style.boxSizing = 'border-box';
    page1Container.style.display = 'flex';
    page1Container.style.justifyContent = 'center';
    page1Container.style.alignItems = 'flex-start';
    page1Container.style.margin = '0 auto';
    page1Container.style.padding = '40px 40px';

    // Clone the resume
    const clonedResume = resumeElement.cloneNode(true);
    clonedResume.style.margin = '0 auto';
    clonedResume.style.boxShadow = '10px 10px #747D8C';
    clonedResume.style.display = 'flex';
    clonedResume.style.position = 'relative';
    clonedResume.style.width = '100%';
    clonedResume.style.maxWidth = '100%';

    // Fix images in CV
    const imgs = clonedResume.querySelectorAll('img');
    imgs.forEach(img => {
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
    });

    const profilePhoto = clonedResume.querySelector('.photo');
    if (profilePhoto) {
      profilePhoto.style.marginTop = '6px';
      profilePhoto.style.marginBottom = '0px';
      profilePhoto.style.setProperty('--photo-size', '158px');
    }

    // move the image down inside the cloned frame (keeps aspect ratio)
    const profileImg = profilePhoto.querySelector('img');
    if (profileImg) {
      profileImg.style.width = '110%';
      profileImg.style.height = 'auto';
      profileImg.style.objectFit = 'cover';
      profileImg.style.objectPosition = 'center 50%';
      profileImg.style.willChange = 'transform';
      profileImg.style.transform = 'translateY(4%)'; // increase/decrease (4%..12%) to tune
      profileImg.style.webkitTransform = 'translateY(8%)';
    }

    page1Container.appendChild(clonedResume);

    // Add page 1 to DOM temporarily to measure
    page1Container.style.position = 'fixed';
    page1Container.style.top = '0';
    page1Container.style.left = '0';
    page1Container.style.zIndex = '99999';
    page1Container.style.visibility = 'hidden';
    document.body.appendChild(page1Container);

    await new Promise(resolve => setTimeout(resolve, 200));

    const page1Width = page1Container.offsetWidth;
    const page1Height = page1Container.offsetHeight;
    console.log(`Page 1 dimensions: ${page1Width}px × ${page1Height}px`);

    page1Container.style.visibility = 'visible';

    // Generate PDF for page 1
    console.log('Generating page 1 (CV)...');
    const opt1 = {
      margin: 0,
      filename: 'temp_page1.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#e6e6e6',
        width: page1Width,
        height: page1Height,
        windowWidth: page1Width
      },
      jsPDF: { 
        unit: 'px',
        format: [page1Width, page1Height],
        orientation: page1Width > page1Height ? 'landscape' : 'portrait',
        compress: true
      }
    };

    const pdf1 = await html2pdf().set(opt1).from(page1Container).outputPdf('blob');
    document.body.removeChild(page1Container);
    console.log('Page 1 generated');

    // MODIFIED: Only handle page 2 (projects) if user requested it
    let pdf2 = null;
    if (includeProjects && projectsElement) {
      const page2Container = document.createElement('div');
      page2Container.id = 'pdf-page-2';
      page2Container.style.background = '#ffffff';
      page2Container.style.padding = '40px 20px';
      page2Container.style.boxSizing = 'border-box';
      page2Container.style.minWidth = page1Width + 'px'; // Match page 1 width
      
      const clonedProjects = projectsElement.cloneNode(true);
      clonedProjects.style.display = 'block';
      
      // Fix project images
      const projectImgs = clonedProjects.querySelectorAll('img');
      projectImgs.forEach(img => {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      });
      
      page2Container.appendChild(clonedProjects);

      // Add to DOM to measure
      page2Container.style.position = 'fixed';
      page2Container.style.top = '0';
      page2Container.style.left = '0';
      page2Container.style.zIndex = '99999';
      page2Container.style.visibility = 'hidden';
      document.body.appendChild(page2Container);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const page2Width = page2Container.offsetWidth;
      const page2Height = page2Container.offsetHeight;
      console.log(`Page 2 dimensions: ${page2Width}px × ${page2Height}px`);
      
      page2Container.style.visibility = 'visible';

      // Generate PDF for page 2
      console.log('Generating page 2 (Projects)...');
      const opt2 = {
        margin: 0,
        filename: 'temp_page2.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: page2Width,
          height: page2Height,
          windowWidth: page2Width
        },
        jsPDF: { 
          unit: 'px',
          format: [page2Width, page2Height],
          orientation: page2Width > page2Height ? 'landscape' : 'portrait',
          compress: true
        }
      };

      pdf2 = await html2pdf().set(opt2).from(page2Container).outputPdf('blob');
      document.body.removeChild(page2Container);
      console.log('Page 2 generated');
    }

    // Merge the PDFs using pdf-lib
    console.log(`Merging into final ${includeProjects ? '2-page' : '1-page'} PDF...`);
    
    // Load pdf-lib from CDN if not already loaded
    if (typeof PDFLib === 'undefined') {
      await loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
    }
    
    const { PDFDocument } = PDFLib;
    
    // Create new PDF and add pages
    const mergedPdf = await PDFDocument.create();
    
    // Add page 1
    const pdf1Doc = await PDFDocument.load(await pdf1.arrayBuffer());
    const [page1] = await mergedPdf.copyPages(pdf1Doc, [0]);
    mergedPdf.addPage(page1);
    
    // Add page 2 if it exists
    if (pdf2) {
      const pdf2Doc = await PDFDocument.load(await pdf2.arrayBuffer());
      const [page2] = await mergedPdf.copyPages(pdf2Doc, [0]);
      mergedPdf.addPage(page2);
    }
    
    // --- BEGIN: Add invisible text layer for extractability & ATS support ---
    function extractTextFromResume() {
      const resume = document.querySelector('.resume');
      if (!resume) return '';

      function getTextNodes(node) {
        let text = '';
        for (const child of node.childNodes) {
          if (child.nodeType === Node.TEXT_NODE) {
            text += child.textContent + ' ';
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            // Only traverse visible elements
            if (getComputedStyle(child).display !== 'none' &&
                getComputedStyle(child).visibility !== 'hidden' &&
                getComputedStyle(child).opacity !== '0') {
              text += getTextNodes(child);
            }
          }
        }
        return text;
      }

      // Clean up the text: normalize spaces, remove excessive newlines
      return getTextNodes(resume)
        .replace(/\s+/g, ' ')
        .replace(/\s*\n\s*/g, ' ')
        .trim();
    }

    const fullText = extractTextFromResume();
    const atsSupplement = buildAtsText(cvContext.data, cvContext.key);
    const textToEmbed = mode === 'frozen'
      ? [fullText, atsSupplement].filter(Boolean).join('\n\n')
      : fullText;

    applyPdfMetadata(mergedPdf, buildPdfMetadata(cvContext.key, cvContext.data, mode));

    if (mode === 'frozen' && textToEmbed && typeof mergedPdf.getPageCount === 'function') {
      const helveticaFont = await mergedPdf.embedFont(PDFLib.StandardFonts.Helvetica);

      for (let i = 0; i < mergedPdf.getPageCount(); i++) {
        const page = mergedPdf.getPage(i);
        
        page.drawText(textToEmbed, {
          x: 12,
          y: page.getHeight() - 28,
          size: 1,
          font: helveticaFont,
          color: PDFLib.rgb(1, 1, 1),
          opacity: 0,
          lineHeight: 1.15,
          maxWidth: page.getWidth() - 30
        });
      }
    }
    // --- END: Invisible text layer for extractability & AI optimization ---

    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`PDF saved successfully - ${mode} mode, ${includeProjects ? '2 pages' : '1 page'}!`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF: ' + error.message);
  } finally {
    applySnapshotMode(false);

    // Restore original styles
    if (particlesBg) particlesBg.style.display = originalStyles.particlesBg || '';
    if (particlesFg) particlesFg.style.display = originalStyles.particlesFg || '';
    if (navbar) navbar.style.display = originalStyles.navbar || '';
    if (versionSelector) versionSelector.style.display = originalStyles.versionSelector || '';
    document.body.style.background = originalStyles.bodyBg || '';
  }
}

window.generateResumePDF = generateResumePDF;
window.generatePDF = function(customFileName = null, options = {}) {
  return generateResumePDF(customFileName, options);
};

// Helper to load external scripts
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Wire up the download button when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const downloadBtn = document.querySelector('.download-btn');
  if (downloadBtn) {
    // Remove the direct file link; the click handler chooses the export mode.
    downloadBtn.removeAttribute('download');
    downloadBtn.removeAttribute('href');

    downloadBtn.addEventListener('click', function(e) {
      e.preventDefault();

      const currentVersion = window.cvController?.getCurrentVersion?.();
      const versionLabel = currentVersion?.data?.personal?.jobTitle || currentVersion?.key || 'current CV';
      const userChoice = prompt(
        `Choose export mode for ${versionLabel}:\n\n` +
        '1 = Standard PDF (1 page)\n' +
        '2 = Standard PDF (CV + Projects)\n' +
        '3 = Frozen ATS PDF (1 page)\n' +
        '4 = Frozen ATS PDF (CV + Projects)',
        '4'
      );

      if (userChoice === null) {
        console.log('PDF generation cancelled by user.');
        return; 
      }

      const choice = userChoice.trim();
      const includeProjects = choice === '2' || choice === '4';
      const mode = choice === '3' || choice === '4' ? 'frozen' : 'normal';
      const exportOptions = { includeProjects, mode };

      // Only switch to CV view if Projects is currently selected
      const projectsSection = document.querySelector('.projects');
      const resumeSection = document.querySelector('.resume');
      
      // If projects is visible and resume is hidden, switch to CV view
      if (projectsSection && resumeSection && projectsSection.style.display !== 'none' && resumeSection.style.display === 'none') {
        const navCV = document.getElementById('nav-cv');
        if (navCV && navCV.querySelector('a')) {
          navCV.querySelector('a').click();
        }
        // Wait for the view to update, then generate PDF
        setTimeout(() => {
          console.log('Download button clicked (after switching to CV)');
          generateResumePDF(null, exportOptions);
        }, 500); // Increased delay for reliable rendering
      } else {
        // Already in CV view, just generate PDF
        console.log(`Download button clicked (CV view, ${mode} mode)`);
        generateResumePDF(null, exportOptions);
      }
    });

    console.log('PDF generator initialized');
  } else {
    console.warn('Download button not found');
  }
});

document.body.classList.add('pdf-export');