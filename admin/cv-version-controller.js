/**
 * CV Version Controller
 * Manages multiple CV versions with dynamic content loading
 */

class CVVersionController {
  constructor() {
    this.currentVersion = 'neutral-finance';
    this.versions = null;
    this.allExperiences = this.getAllExperiences();
    this.allProjects = this.getAllProjects();
    this.init();
  }

  async init() {
    await this.loadVersions();
    this.setupEventListeners();
    this.loadVersionFromURL();
    // Do NOT call applyVersion here; it will be called after data is loaded in loadVersions
  }

  async loadVersions() {
    try {
      const response = await fetch('cv-versions.json');
      this.versions = await response.json();
      // Now safe to call applyVersion
      this.applyVersion(this.currentVersion);
    } catch (error) {
      console.error('Failed to load CV versions:', error);
      this.versions = {};
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
    const version = this.versions[versionKey];
    if (!version) return;

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
    // Regenerate PDF preview when version changes
    this.generatePDF();
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

    // First filter by active status
    const activeProjects = this.allProjects.filter(proj => {
      const dataActive = proj.element.getAttribute('data-active');
      return dataActive !== 'false'; // Show by default if not specified, only hide if explicitly false
    });

    if (projectsToShow.includes('all')) {
      // Show all active projects
      activeProjects.forEach(proj => {
        proj.element.style.display = 'list-item';
      });
      this.allProjects.forEach(proj => {
        if (!activeProjects.includes(proj)) {
          proj.element.style.display = 'none';
        }
      });
    } else {
      // Filter projects by version selection AND active status
      this.allProjects.forEach(proj => {
        const isActive = activeProjects.includes(proj);
        const isInShowList = projectsToShow.includes(proj.title);
        if (isActive && isInShowList) {
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
