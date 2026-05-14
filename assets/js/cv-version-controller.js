/**
 * CV Version Controller
 * Manages multiple CV versions with dynamic content loading from Firebase
 */

class CVVersionController {
  constructor() {
    this.preloader = document.getElementById('preloader-overlay');
    this.versionFileMap = {
      ai_data_engineer: 'ai_data_engineer.json',
      backend_systems_architect: 'backend_systems_architect.json',
      cloud_platform: 'cloud_platform.json',
      data_science: 'data_science.json',
      edit: 'edit.json',
      fintech: 'fintech.json',
      fund_accounting: 'fund_accounting.json',
      investment_analysis: 'investment_analysis.json',
      mobile_frontend_architect: 'mobile_frontend_architect.json',
      neutral_finance: 'neutral_finance.json',
      personal_blockchain: 'personal_blockchain.json',
      personal_data_analyst: 'personal_data_analyst.json',
      personal_fintech: 'personal_fintech.json',
      pure_coding: 'pure_coding.json',
      reporting_analyst: 'reporting_analyst.json',
      rust_market_infra: 'rust_market_infra.json'
    };
    // Detect version from URL path or default
    this.currentVersion = this.resolveInitialVersion() || 'data_science';
    this.versions = null;
    this.cvData = null;
    this.firebaseInitialized = false;
    this.allExperiences = null;
    this.allProjects = null;
    this.init();
  }

  resolveInitialVersion() {
    const urlParams = new URLSearchParams(window.location.search);
    const queryVersion = urlParams.get('version');
    if (queryVersion) {
      return this.normalizeVersionKey(queryVersion);
    }

    const bodyVersion = document.body?.dataset?.version || document.documentElement?.dataset?.version;
    if (bodyVersion) {
      return this.normalizeVersionKey(bodyVersion);
    }

    return this.detectVersionFromPath();
  }

  detectVersionFromPath() {
    const path = decodeURIComponent(window.location.pathname);
    const versionMap = {
      'AI&Data Engineer': 'ai_data_engineer',
      'Backend&Systems Architect': 'backend_systems_architect',
      'Cloud&Platform': 'cloud_platform',
      'data-science': 'data_science',
      'edit': 'edit',
      'fintech': 'fintech',
      'fund-accounting': 'fund_accounting',
      'investment': 'investment_analysis',
      'Mobile&Frontend Architect': 'mobile_frontend_architect',
      'neutral-finance': 'neutral_finance',
      'PersonalBlockchain': 'personal_blockchain',
      'PersonalDataAnalyst': 'personal_data_analyst',
      'PersonalFintech': 'personal_fintech',
      'pure-coding': 'pure_coding',
      'reporting-analyst': 'reporting_analyst',
      'Rust&MarketInfra': 'rust_market_infra'
    };

    for (const [pathSegment, versionKey] of Object.entries(versionMap)) {
      if (path.includes('/' + pathSegment + '/') || path.endsWith('/' + pathSegment + '/index.html')) {
        console.log('Detected version from path:', pathSegment, '->', versionKey);
        return versionKey;
      }
    }
    return null;
  }

  normalizeVersionKey(version) {
    if (!version) return version;
    const versionMap = {
      'ai-data-engineer': 'ai_data_engineer',
      'ai_data_engineer': 'ai_data_engineer',
      'backend-systems-architect': 'backend_systems_architect',
      'backend_systems_architect': 'backend_systems_architect',
      'cloud-platform': 'cloud_platform',
      'cloud_platform': 'cloud_platform',
      'data-science': 'data_science',
      'data_science': 'data_science',
      'edit': 'edit',
      'fintech': 'fintech',
      'fund-accounting': 'fund_accounting',
      'fund_accounting': 'fund_accounting',
      'investment': 'investment_analysis',
      'investment-analysis': 'investment_analysis',
      'investment_analysis': 'investment_analysis',
      'mobile-frontend-architect': 'mobile_frontend_architect',
      'mobile_frontend_architect': 'mobile_frontend_architect',
      'finance': 'neutral_finance',
      'neutral-finance': 'neutral_finance',
      'neutral_finance': 'neutral_finance',
      'personal-blockchain': 'personal_blockchain',
      'personal_blockchain': 'personal_blockchain',
      'personal-data-analyst': 'personal_data_analyst',
      'personal_data_analyst': 'personal_data_analyst',
      'personal-fintech': 'personal_fintech',
      'personal_fintech': 'personal_fintech',
      'developer': 'pure_coding',
      'pure-coding': 'pure_coding',
      'pure_coding': 'pure_coding',
      'reporting-analyst': 'reporting_analyst',
      'reporting_analyst': 'reporting_analyst',
      'rust-market-infra': 'rust_market_infra',
      'rust_market_infra': 'rust_market_infra'
    };
    if (versionMap[version]) return versionMap[version];
    return version.includes('-') ? version.replace(/-/g, '_') : version;
  }

  async init() {
    this.showPreloader();
    // Initialize Firebase first
    await this.initializeFirebase();

    // Resolve the version again once the page DOM is available
    this.currentVersion = this.resolveInitialVersion() || this.currentVersion;

    // Load CV data from local JSON first, then Firebase fallback
    await this.loadVersions();

    // Get DOM elements after data is loaded
    this.allExperiences = this.getAllExperiences();
    this.allProjects = this.getAllProjects();

    this.setupEventListeners();
    // Do NOT call applyVersion here; it will be called after data is loaded in loadFromLocal/loadFromFirebase
    this.hidePreloader();
  }

  showPreloader() {
    if (this.preloader) {
      this.preloader.classList.remove('hidden');
    }
  }

  hidePreloader() {
    if (this.preloader) {
      this.preloader.classList.add('hidden');
    }
  }

  async initializeFirebase() {
    try {
      if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK not loaded, will use local fallback');
        return false;
      }

      // Firebase config
      const firebaseConfig = {
        apiKey: "AIzaSyBHw7K6HMLa2W_PmN9Yctq4XO3Zsng5PXI",
        authDomain: "jobsearch-a3a6c.firebaseapp.com",
        projectId: "jobsearch-a3a6c",
        storageBucket: "jobsearch-a3a6c.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef123456"
      };

      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      
      this.db = firebase.firestore();
      this.firebaseInitialized = true;
      console.log('Firebase initialized successfully for CV loading');
      return true;
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      return false;
    }
  }

  async loadVersions() {
    const loaded = await this.loadVersionData(this.currentVersion);
    if (!loaded) {
      console.error('Failed to load CV data for version:', this.currentVersion);
    }
  }

  getImportBasePath() {
    const path = decodeURIComponent(window.location.pathname);
    const segments = path.split('/').filter(Boolean);
    return segments.length > 1 ? '../admin/firebase-import' : 'admin/firebase-import';
  }

  getVersionFileName(versionKey) {
    const normalizedVersion = this.normalizeVersionKey(versionKey);
    return this.versionFileMap[normalizedVersion] || `${normalizedVersion}.json`;
  }

  getVersionImportUrl(versionKey) {
    return `${this.getImportBasePath()}/${this.getVersionFileName(versionKey)}`;
  }

  parseCvPayload(docData) {
    if (!docData) return null;

    if (docData.cvData) {
      return typeof docData.cvData === 'string'
        ? JSON.parse(docData.cvData)
        : docData.cvData;
    }

    return docData;
  }

  async loadVersionData(versionKey) {
    const normalizedVersion = this.normalizeVersionKey(versionKey);
    const localData = await this.loadFromLocal(normalizedVersion);

    if (localData) {
      this.cvData = localData;
      this.populatePageWithData(localData);
      this.applyVersion(normalizedVersion);
      return true;
    }

    if (this.firebaseInitialized) {
      const firebaseData = await this.loadFromFirebase(normalizedVersion);
      if (firebaseData) {
        this.cvData = firebaseData;
        this.populatePageWithData(firebaseData);
        this.applyVersion(normalizedVersion);
        return true;
      }
    }

    return false;
  }

  async loadFromLocal(versionKey) {
    try {
      const url = this.getVersionImportUrl(versionKey);
      console.log('Loading CV data from local JSON:', url);
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        console.warn('No local JSON found for version:', versionKey, response.status);
        return null;
      }

      const docData = await response.json();
      const cvData = this.parseCvPayload(docData);
      console.log('Local JSON data loaded for version:', versionKey);
      return cvData;
    } catch (error) {
      console.error('Failed to load local JSON for version:', versionKey, error);
      return null;
    }
  }

  async loadFromFirebase(versionKey) {
    try {
      console.log('Loading CV data from Firebase...');
      const docRef = this.db.collection('cv-data').doc(versionKey);
      const doc = await docRef.get();

      if (doc.exists) {
        const docData = doc.data();
        console.log('Firebase data loaded:', docData);
        const cvData = this.parseCvPayload(docData);
        console.log('CV data loaded from Firebase successfully');
        return cvData;
      }

      console.log('No Firebase data found for version:', versionKey);
      return null;
    } catch (error) {
      console.error('Failed to load from Firebase:', error);
      return null;
    }
  }


  populatePageWithData(data) {
    console.log('Populating page with data:', data);
    
    // Update personal info
    if (data.personal) {
      const nameEl = document.querySelector('.name');
      if (nameEl && data.personal.name) nameEl.textContent = data.personal.name;
      
      // Try multiple selectors for job title (more flexible)
      const jobEl = document.querySelector('.job') || document.querySelector('.info p');
      if (jobEl && data.personal.jobTitle) jobEl.textContent = data.personal.jobTitle;
      
      const aboutEl = document.querySelector('.about p');
      if (aboutEl && data.personal.about) aboutEl.textContent = data.personal.about;
    }

    // Update contact info
    if (data.contact) {
      if (data.contact.phone) {
        const phoneEl = document.querySelector('.call a');
        if (phoneEl) {
          phoneEl.href = 'tel:' + data.contact.phone;
          phoneEl.querySelector('span').textContent = data.contact.phone;
        }
      }
      
      if (data.contact.email) {
        const emailEl = document.querySelector('.email a');
        if (emailEl) {
          emailEl.href = 'mailto:' + data.contact.email;
          emailEl.querySelector('span').textContent = data.contact.email;
        }
      }
      
      if (data.contact.location) {
        const locationEl = document.querySelector('.address span');
        if (locationEl) locationEl.textContent = data.contact.location;
      }
      
      if (data.contact.website) {
        const websiteEl = document.querySelector('.website-link a');
        if (websiteEl) {
          websiteEl.href = data.contact.website;
          websiteEl.querySelector('.website-text').textContent = 'Online CV';
        }
      }
    }

    // Update education
    if (data.education && Array.isArray(data.education)) {
      const eduList = document.querySelector('.edu ul');
      if (eduList) {
        eduList.innerHTML = '';
        data.education.forEach(edu => {
          const li = document.createElement('li');
          const educationText = edu.description || (edu.coursework && edu.coursework.length ? edu.coursework.join(' ') : '');
          li.innerHTML = `
            <span>${edu.degree || ''}<br>${edu.school || ''}</span>
            <small>${edu.dates || ''}</small>
            ${educationText ? `<p class="coursework">${educationText}</p>` : ''}
          `;
          eduList.appendChild(li);
        });
      }
    }

    // Update work experience
    if (data.workExperience && Array.isArray(data.workExperience)) {
      const workList = document.querySelector('.work ul');
      if (workList) {
        workList.innerHTML = '';
        data.workExperience.forEach(work => {
          const li = document.createElement('li');
          li.innerHTML = `
            <span>${work.title || ''}</span>${work.company ? `<span class="highlight"> (${work.company})</span>` : ''}
            <small>${work.dates || ''}</small>
            ${work.description ? `<h6 class="coursework">${work.description}</h6>` : ''}
          `;
          workList.appendChild(li);
        });
      }
    }

    // Update skills
    if (data.skills && Array.isArray(data.skills)) {
      const skillsGrid = document.querySelector('.skills-grid');
      if (skillsGrid) {
        skillsGrid.innerHTML = '';
        data.skills.forEach(skill => {
          const skillDiv = document.createElement('div');
          skillDiv.className = 'skill';
          skillDiv.setAttribute('data-percent', skill.percent || 0);
          skillDiv.setAttribute('data-years', skill.years || 0);
          skillDiv.setAttribute('data-tags', (skill.tags || []).join(','));
          skillDiv.innerHTML = `
            <div class="skill-info">
              <div class="skill-name">${skill.name || ''}</div>
            </div>
            <div class="skill-meter" aria-hidden="true"><div class="skill-fill" style="width:0%"></div></div>
            <div class="skill-percent">${skill.percent || 0}%</div>
          `;
          skillsGrid.appendChild(skillDiv);
        });
        
        // Trigger skill animations
        setTimeout(() => {
          document.querySelectorAll('.skills-grid .skill').forEach((el, i) => {
            const percent = el.getAttribute('data-percent') || '0';
            const fill = el.querySelector('.skill-fill');
            const pct = Math.max(0, Math.min(100, parseInt(percent, 10) || 0));
            setTimeout(() => { fill.style.width = pct + '%'; }, 100 + (i * 80));
          });
        }, 100);
      }
    }

    // Update projects
    if (data.projects && Array.isArray(data.projects)) {
      const projectList = document.querySelector('.project-list');
      if (projectList) {
        projectList.innerHTML = '';
        // Filter projects: only show active projects
        const activeProjects = data.projects.filter(project => project.active !== false);
        activeProjects.forEach(project => {
          const li = document.createElement('li');
          li.className = 'project-item active';
          li.setAttribute('data-filter-item', '');
          li.setAttribute('data-category', project.filterCategory || 'web development');
          li.setAttribute('data-active', project.active !== false ? 'true' : 'false');
          
          const links = project.links || [];
          const hasLinks = links.length > 0;
          const mainLink = hasLinks ? links[0] : null;
          const imageMarkup = hasLinks ? `
              <a href="${mainLink.url}" class="project-eye-link" target="_blank">
                <div class="project-item-icon-box">
                  <i class="fas fa-eye"></i>
                </div>
                <img src="../assets/images/${project.image || 'project1.PNG'}" alt="${project.title}" loading="lazy">
              </a>
          ` : `
              <div class="project-item-image">
                <img src="../assets/images/${project.image || 'project1.PNG'}" alt="${project.title}" loading="lazy">
              </div>
          `;
          const linkMarkup = hasLinks ? links.map(link => `<a href="${link.url}" class="project-link" target="_blank">${link.text}</a>`).join('') : '';
          
          li.innerHTML = `
            <figure class="project-img">
              ${imageMarkup}
            </figure>
            <div class="project-info">
              <h3 class="project-title">
                ${hasLinks ? `<a href="${mainLink.url}" target="_blank">${project.title || ''}</a>` : `${project.title || ''}`}
              </h3>
              <p class="project-description">${project.description || ''}</p>
              ${linkMarkup}
              <p class="project-category">${project.category || ''}</p>
            </div>
          `;
          projectList.appendChild(li);
        });
        console.log(`Loaded ${activeProjects.length} active projects out of ${data.projects.length} total`);
      }
    }

    // Update languages
    if (data.languages && Array.isArray(data.languages)) {
      const langContainer = document.querySelector('.interests-items');
      if (langContainer && langContainer.parentElement.querySelector('h3')?.textContent.includes('Languages')) {
        langContainer.innerHTML = '';
        data.languages.forEach(lang => {
          const div = document.createElement('div');
          div.className = 'language';
          div.innerHTML = `
            <img src="../assets/images/${lang.flag}" alt="${lang.name}" class="flag">
            <span>${lang.name}</span>
          `;
          langContainer.appendChild(div);
        });
      }
    }
  }

  loadVersionFromURL() {
    this.currentVersion = this.resolveInitialVersion() || this.currentVersion;
  }

  setupEventListeners() {
    // Version selector dropdown
    const versionSelector = document.getElementById('version-selector');
    if (versionSelector) {
      versionSelector.addEventListener('change', (e) => {
        this.switchVersion(e.target.value);
      });
    }

    // Quick action buttons
    document.querySelectorAll('.version-quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const version = e.currentTarget.dataset.version;
        this.switchVersion(version);
      });
    });
  }

  switchVersion(version) {
    const normalizedVersion = this.normalizeVersionKey(version);
    this.currentVersion = normalizedVersion;
    if (document.body) {
      document.body.dataset.version = normalizedVersion;
    }
    this.loadVersionData(normalizedVersion);

    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('version', normalizedVersion);
    window.history.pushState({}, '', url);

    // Update selector
    const selector = document.getElementById('version-selector');
    if (selector) {
      selector.value = normalizedVersion;
    }

    // Auto-refresh PDF preview if function exists
    if (typeof window.generatePDF === 'function') {
      setTimeout(() => {
        window.generatePDF();
      }, 300); // slight delay to ensure DOM is updated
    }
  }

  applyVersion(versionKey) {
    const version = this.versions && this.versions[versionKey];

    if (version) {
      document.title = `Alejandro Moral Aranda - ${version.title}`;

      const jobTitle = document.querySelector('.job');
      if (jobTitle) {
        jobTitle.textContent = version.jobTitle;
      }

      const aboutText = document.querySelector('.about p');
      if (aboutText) {
        aboutText.textContent = version.about;
      }

      this.updateExperiences(version.experienceOrder);
      this.updateProjects(version.projectsToShow);
      this.applyFormalismTheme(version.formalism);
      this.highlightSkills(version.highlightedSkills);
    } else if (this.cvData) {
      const title = this.cvData.personal?.jobTitle || versionKey.replace(/_/g, ' ');
      document.title = `Alejandro Moral Aranda - ${title}`;

      const jobTitle = document.querySelector('.job');
      if (jobTitle && this.cvData.personal?.jobTitle) {
        jobTitle.textContent = this.cvData.personal.jobTitle;
      }

      const aboutText = document.querySelector('.about p');
      if (aboutText && this.cvData.personal?.about) {
        aboutText.textContent = this.cvData.personal.about;
      }
    }

    this.updatePDFLink(versionKey);
  }

  getAllExperiences() {
    const experiences = [];
    document.querySelectorAll('.work ul li').forEach(li => {
      const title = li.querySelector('span:first-child');
      if (title) {
        experiences.push({
          element: li,
          title: title.textContent.trim(),
          originalIndex: experiences.length
        });
      }
    });
    return experiences;
  }

  getAllProjects() {
    const projects = [];
    document.querySelectorAll('.project-item').forEach(item => {
      const title = item.querySelector('.project-title a');
      if (title) {
        projects.push({
          element: item,
          title: title.textContent.trim(),
          originalIndex: projects.length
        });
      }
    });
    return projects;
  }

  updateExperiences(orderArray) {
    const workList = document.querySelector('.work ul');
    if (!workList) return;

    // Hide all first
    this.allExperiences.forEach(exp => {
      exp.element.style.display = 'none';
    });

    // Show and reorder based on version
    const fragment = document.createDocumentFragment();
    orderArray.forEach(title => {
      const exp = this.allExperiences.find(e => e.title === title);
      if (exp) {
        exp.element.style.display = 'list-item';
        fragment.appendChild(exp.element);
      }
    });

    workList.innerHTML = '';
    workList.appendChild(fragment);
  }

  updateProjects(projectsToShow) {
    const projectList = document.querySelector('.project-list');
    if (!projectList) return;

    if (projectsToShow.includes('all')) {
      // Show all projects
      this.allProjects.forEach(proj => {
        proj.element.style.display = 'list-item';
      });
    } else {
      // Filter projects
      this.allProjects.forEach(proj => {
        if (projectsToShow.includes(proj.title)) {
          proj.element.style.display = 'list-item';
        } else {
          proj.element.style.display = 'none';
        }
      });
    }
  }

  applyFormalismTheme(formalism) {
    const body = document.body;
    
    // Remove existing formalism classes
    body.classList.remove('formalism-professional', 'formalism-balanced', 'formalism-modern', 'formalism-creative');
    
    // Add new formalism class
    body.classList.add(`formalism-${formalism}`);
  }

  highlightSkills(skillsArray) {
    // Remove all existing highlights
    document.querySelectorAll('.skill').forEach(skill => {
      skill.classList.remove('skill-highlighted');
    });

    // Add highlights to specified skills
    skillsArray.forEach(skillName => {
      const skillElement = Array.from(document.querySelectorAll('.skill')).find(el => {
        const name = el.querySelector('.skill-name');
        return name && name.textContent.trim() === skillName;
      });
      
      if (skillElement) {
        skillElement.classList.add('skill-highlighted');
      }
    });
  }

  updatePDFLink(versionKey) {
    const downloadBtn = document.querySelector('.download-btn');
    if (downloadBtn) {
      const fileName = `alejandro_moral_aranda_${versionKey.replace(/-/g, '_')}.pdf`;
      downloadBtn.setAttribute('href', fileName);
      downloadBtn.setAttribute('download', fileName);
    }
  }

  // Generate PDF for current version
  async generatePDF() {
    const versionKey = this.currentVersion;
    const fileName = `alejandro_moral_aranda_${versionKey.replace(/-/g, '_')}.pdf`;
    
    // Trigger PDF generation (assuming pdf-generator.js is loaded)
    if (window.generatePDF) {
      window.generatePDF(fileName);
    }
  }

  // Get current version info
  getCurrentVersion() {
    return {
      key: this.currentVersion,
      data: (this.versions && this.versions[this.currentVersion]) || this.cvData
    };
  }

  // Get all available versions
  getAvailableVersions() {
    if (!this.versions) {
      return [{
        key: this.currentVersion,
        title: this.cvData?.personal?.jobTitle || this.currentVersion,
        formalism: 'balanced'
      }];
    }

    return Object.keys(this.versions).map(key => ({
      key,
      title: this.versions[key].title,
      formalism: this.versions[key].formalism
    }));
  }
}

// Initialize when DOM is ready
let cvController;
document.addEventListener('DOMContentLoaded', function() {
  cvController = new CVVersionController();
});

// Make it globally accessible
window.CVVersionController = CVVersionController;
