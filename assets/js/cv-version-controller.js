/**
 * CV Version Controller
 * Manages multiple CV versions with dynamic content loading from Firebase
 */

class CVVersionController {
  constructor() {
    // Detect version from URL path or default
    this.currentVersion = this.detectVersionFromPath() || 'data_science';
    this.versions = null;
    this.cvData = null;
    this.firebaseInitialized = false;
    this.allExperiences = null;
    this.allProjects = null;
    this.init();
  }

  detectVersionFromPath() {
    const path = window.location.pathname;
    const versionMap = {
      'data-science': 'data_science',
      'fintech': 'fintech',
      'fund-accounting': 'fund_accounting',
      'investment': 'investment_analysis',
      'finance': 'neutral_finance',
      'developer': 'pure_coding',
      'reporting-analyst': 'reporting_analyst'
    };
    
    for (const [pathSegment, firebaseVersion] of Object.entries(versionMap)) {
      if (path.includes('/' + pathSegment + '/')) {
        console.log('Detected version from path:', firebaseVersion);
        return firebaseVersion;
      }
    }
    return null;
  }

  async init() {
    // Initialize Firebase first
    await this.initializeFirebase();
    
    // Load CV data from Firebase
    await this.loadVersions();
    
    // Get DOM elements after data is loaded
    this.allExperiences = this.getAllExperiences();
    this.allProjects = this.getAllProjects();
    
    this.setupEventListeners();
    this.loadVersionFromURL();
    this.applyVersion(this.currentVersion);
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
    // Try loading from Firebase first
    if (this.firebaseInitialized) {
      const loaded = await this.loadFromFirebase();
      if (loaded) return;
    }
    
    // Fallback to local JSON
    await this.loadFromLocal();
  }

  async loadFromFirebase() {
    try {
      console.log('Loading CV data from Firebase...');
      const docRef = this.db.collection('cv-data').doc(this.currentVersion);
      const doc = await docRef.get();
      
      if (doc.exists) {
        const docData = doc.data();
        console.log('Firebase data loaded:', docData);
        
        // Parse cvData
        let cvData;
        if (docData.cvData) {
          cvData = typeof docData.cvData === 'string' 
            ? JSON.parse(docData.cvData) 
            : docData.cvData;
        } else {
          cvData = docData;
        }
        
        this.cvData = cvData;
        this.populatePageWithData(cvData);
        console.log('CV populated from Firebase successfully');
        return true;
      } else {
        console.log('No Firebase data found for version:', this.currentVersion);
        return false;
      }
    } catch (error) {
      console.error('Failed to load from Firebase:', error);
      return false;
    }
  }

  async loadFromLocal() {
    try {
      console.log('Loading CV data from local file...');
      const response = await fetch('cv-versions.json');
      this.versions = await response.json();
      console.log('Local data loaded');
    } catch (error) {
      console.error('Failed to load CV versions:', error);
      this.versions = {};
    }
  }

  populatePageWithData(data) {
    console.log('Populating page with data:', data);
    
    // Update personal info
    if (data.personal) {
      const nameEl = document.querySelector('.name');
      if (nameEl && data.personal.name) nameEl.textContent = data.personal.name;
      
      const jobEl = document.querySelector('.job');
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
          websiteEl.querySelector('.website-text').textContent = '(CV) ' + data.contact.website;
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
          li.innerHTML = `
            <span>${edu.degree || ''}<br>${edu.school || ''}</span>
            <small>${edu.dates || ''}</small>
            ${edu.coursework && edu.coursework.length ? edu.coursework.map(c => 
              `<h6 class="coursework">${c}</h6>`
            ).join('') : ''}
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
        data.projects.forEach(project => {
          const li = document.createElement('li');
          li.className = 'project-item active';
          li.setAttribute('data-filter-item', '');
          li.setAttribute('data-category', project.filterCategory || 'web development');
          
          const links = project.links || [];
          const mainLink = links[0] || { url: '#', text: 'View Project' };
          
          li.innerHTML = `
            <figure class="project-img">
              <a href="${mainLink.url}" class="project-eye-link" target="_blank">
                <div class="project-item-icon-box">
                  <i class="fas fa-eye"></i>
                </div>
                <img src="../assets/images/${project.image || 'placeholder.png'}" alt="${project.title}" loading="lazy">
              </a>
            </figure>
            <div class="project-info">
              <h3 class="project-title">
                <a href="${mainLink.url}" target="_blank">${project.title || ''}</a>
              </h3>
              <p class="project-description">${project.description || ''}</p>
              ${links.map(link => `<a href="${link.url}" class="project-link" target="_blank">${link.text}</a>`).join('')}
              <p class="project-category">${project.category || ''}</p>
            </div>
          `;
          projectList.appendChild(li);
        });
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
    const urlParams = new URLSearchParams(window.location.search);
    const version = urlParams.get('version');
    if (version && this.versions[version]) {
      this.currentVersion = version;
    }
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
    if (!this.versions[version]) {
      console.error('Version not found:', version);
      return;
    }

    this.currentVersion = version;
    this.applyVersion(version);
    
    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('version', version);
    window.history.pushState({}, '', url);

    // Update selector
    const selector = document.getElementById('version-selector');
    if (selector) {
      selector.value = version;
    }
  }

  applyVersion(versionKey) {
    if (!this.versions) {
      console.error('CVVersionController: versions data is not loaded.');
      return;
    }
    const version = this.versions[versionKey];
    if (!version) {
      console.error(`CVVersionController: version '${versionKey}' not found in versions data. Available keys:`, Object.keys(this.versions));
      return;
    }

    // Update document title
    document.title = `Alejandro Moral Aranda - ${version.title}`;

    // Update job title
    const jobTitle = document.querySelector('.job');
    if (jobTitle) {
      jobTitle.textContent = version.jobTitle;
    }

    // Update about section
    const aboutText = document.querySelector('.about p');
    if (aboutText) {
      aboutText.textContent = version.about;
    }

    // Reorder and filter experiences
    this.updateExperiences(version.experienceOrder);

    // Filter projects
    this.updateProjects(version.projectsToShow);

    // Apply formalism theme
    this.applyFormalismTheme(version.formalism);

    // Highlight relevant skills
    this.highlightSkills(version.highlightedSkills);

    // Update PDF download link
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
      data: this.versions[this.currentVersion]
    };
  }

  // Get all available versions
  getAvailableVersions() {
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
