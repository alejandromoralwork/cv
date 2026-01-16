// CV Data Loader - Loads CV content from Firebase or JSON file
// This script dynamically populates all CV content from a database

class CVDataLoader {
  constructor() {
    this.currentData = null;
    this.currentVersion = null;
    this.firebaseEnabled = false;
  }

  // Initialize Firebase if available
  async initializeFirebase() {
    if (typeof firebase !== 'undefined' && typeof firebaseConfig !== 'undefined') {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        this.db = firebase.firestore();
        this.firebaseEnabled = true;
        console.log('Firebase initialized for CV data loading');
        return true;
      } catch (error) {
        console.warn('Firebase initialization failed, will use local JSON:', error);
        this.firebaseEnabled = false;
        return false;
      }
    }
    return false;
  }

  // Load CV data from Firebase
  async loadFromFirebase(version) {
    if (!this.firebaseEnabled) return null;
    
    try {
      const docRef = this.db.collection('cv-data').doc(version);
      const doc = await docRef.get();
      
      if (doc.exists) {
        console.log(`Loaded ${version} from Firebase`);
        return doc.data();
      }
      return null;
    } catch (error) {
      console.error('Error loading from Firebase:', error);
      return null;
    }
  }

  // Load CV data from local JSON file
  async loadFromJSON(version) {
    try {
      const response = await fetch('cv-data-complete.json');
      const allData = await response.json();
      
      if (allData[version]) {
        console.log(`Loaded ${version} from local JSON`);
        return allData[version];
      }
      return null;
    } catch (error) {
      console.error('Error loading from JSON:', error);
      return null;
    }
  }

  // Load CV data (tries Firebase first, then falls back to JSON)
  async loadCVData(version) {
    this.currentVersion = version;
    
    // Try Firebase first
    if (this.firebaseEnabled) {
      const data = await this.loadFromFirebase(version);
      if (data) {
        this.currentData = data;
        return data;
      }
    }
    
    // Fallback to local JSON
    const data = await loadFromJSON(version);
    this.currentData = data;
    return data;
  }

  // Populate the entire CV with data
  populateCV(data) {
    if (!data) return;
    
    this.populatePersonalInfo(data.personal);
    this.populateContact(data.contact);
    this.populateEducation(data.education);
    this.populateWorkExperience(data.workExperience);
    this.populateSkills(data.skills);
    this.populateInterests(data.interests);
    this.populateLanguages(data.languages);
    this.populateProjects(data.projects);
  }

  // Populate personal information
  populatePersonalInfo(personal) {
    if (!personal) return;
    
    const nameEl = document.querySelector('.info .name');
    const jobEl = document.querySelector('.info .job');
    const aboutEl = document.querySelector('.about p');
    const photoEl = document.querySelector('.photo img');
    
    if (nameEl) nameEl.textContent = personal.name || '';
    if (jobEl) jobEl.textContent = personal.jobTitle || '';
    if (aboutEl) aboutEl.textContent = personal.about || '';
    if (photoEl && personal.photo) photoEl.src = personal.photo;
  }

  // Populate contact information
  populateContact(contact) {
    if (!contact) return;
    
    // Phone
    const phoneEl = document.querySelector('.contact .call a');
    if (phoneEl && contact.phone) {
      phoneEl.href = `tel:${contact.phone}`;
      phoneEl.querySelector('span').textContent = contact.phone;
    }
    
    // Location
    const locationEl = document.querySelector('.contact .address span');
    if (locationEl && contact.location) {
      locationEl.textContent = contact.location;
    }
    
    // Email
    const emailEl = document.querySelector('.contact .email a');
    if (emailEl && contact.email) {
      emailEl.href = `mailto:${contact.email}`;
      emailEl.querySelector('span').textContent = contact.email;
    }
    
    // Website
    const websiteEl = document.querySelector('.contact .website-link a');
    if (websiteEl && contact.website) {
      websiteEl.href = contact.website;
      const websiteText = websiteEl.querySelector('.website-text');
      if (websiteText) {
        websiteText.textContent = `(CV) ${contact.website}`;
      }
    }
    
    // GitHub
    const githubEl = document.querySelector('.follow .box a[href*="github"]');
    if (githubEl && contact.github) {
      githubEl.href = contact.github;
    }
  }

  // Populate education
  populateEducation(education) {
    if (!education || !Array.isArray(education)) return;
    
    const eduContainer = document.querySelector('.edu ul');
    if (!eduContainer) return;
    
    eduContainer.innerHTML = '';
    
    education.forEach(edu => {
      const li = document.createElement('li');
      
      const titleSpan = document.createElement('span');
      titleSpan.innerHTML = `${edu.degree}<br>${edu.school}`;
      li.appendChild(titleSpan);
      
      const dateSmall = document.createElement('small');
      dateSmall.textContent = edu.dates;
      li.appendChild(dateSmall);
      
      if (edu.description) {
        const descH6 = document.createElement('h6');
        descH6.className = 'coursework';
        descH6.textContent = edu.description;
        li.appendChild(descH6);
      }
      
      if (edu.coursework && Array.isArray(edu.coursework)) {
        edu.coursework.forEach(course => {
          const courseH6 = document.createElement('h6');
          courseH6.className = 'coursework';
          courseH6.textContent = course;
          li.appendChild(courseH6);
        });
      }
      
      eduContainer.appendChild(li);
    });
  }

  // Populate work experience
  populateWorkExperience(workExperience) {
    if (!workExperience || !Array.isArray(workExperience)) return;
    
    const workContainer = document.querySelector('.work ul');
    if (!workContainer) return;
    
    workContainer.innerHTML = '';
    
    workExperience.forEach(job => {
      const li = document.createElement('li');
      
      const titleSpan = document.createElement('span');
      titleSpan.textContent = job.title;
      li.appendChild(titleSpan);
      
      if (job.company) {
        const companySpan = document.createElement('span');
        companySpan.className = 'highlight';
        companySpan.textContent = ` (${job.company})`;
        li.appendChild(companySpan);
      }
      
      const dateSmall = document.createElement('small');
      dateSmall.textContent = job.dates;
      li.appendChild(dateSmall);
      
      if (job.description) {
        const descH6 = document.createElement('h6');
        descH6.className = 'coursework';
        descH6.textContent = job.description;
        li.appendChild(descH6);
      }
      
      workContainer.appendChild(li);
    });
  }

  // Populate skills
  populateSkills(skills) {
    if (!skills || !Array.isArray(skills)) return;
    
    const skillsContainer = document.querySelector('.skills-grid');
    if (!skillsContainer) return;
    
    skillsContainer.innerHTML = '';
    
    skills.forEach(skill => {
      const skillDiv = document.createElement('div');
      skillDiv.className = 'skill';
      skillDiv.setAttribute('data-percent', skill.percent || 0);
      skillDiv.setAttribute('data-years', skill.years || 0);
      skillDiv.setAttribute('data-tags', (skill.tags || []).join(','));
      
      skillDiv.innerHTML = `
        <div class="skill-info">
          <div class="skill-name">${skill.name}</div>
        </div>
        <div class="skill-meter" aria-hidden="true">
          <div class="skill-fill" style="width:0%"></div>
        </div>
        <div class="skill-percent">${skill.percent}%</div>
      `;
      
      skillsContainer.appendChild(skillDiv);
    });
    
    // Trigger animation
    setTimeout(() => {
      document.querySelectorAll('.skills-grid .skill').forEach((el, i) => {
        const percent = parseInt(el.getAttribute('data-percent'), 10) || 0;
        const fill = el.querySelector('.skill-fill');
        setTimeout(() => {
          fill.style.width = percent + '%';
        }, 100 + (i * 80));
      });
    }, 100);
  }

  // Populate interests
  populateInterests(interests) {
    if (!interests || !Array.isArray(interests)) return;
    
    const interestsContainer = document.querySelector('.interests .interests-items');
    if (!interestsContainer) return;
    
    interestsContainer.innerHTML = '';
    
    interests.forEach(interest => {
      const div = document.createElement('div');
      div.className = 'interest';
      div.innerHTML = `<i class="${interest.icon}"></i><span>${interest.name}</span>`;
      interestsContainer.appendChild(div);
    });
  }

  // Populate languages
  populateLanguages(languages) {
    if (!languages || !Array.isArray(languages)) return;
    
    // Find the languages section (second .interests div)
    const languagesContainer = document.querySelectorAll('.interests .interests-items')[1];
    if (!languagesContainer) return;
    
    languagesContainer.innerHTML = '';
    
    languages.forEach(lang => {
      const div = document.createElement('div');
      div.className = 'language';
      div.innerHTML = `<img src="${lang.flag}" alt="${lang.name} Flag" class="flag"><span>${lang.name}</span>`;
      languagesContainer.appendChild(div);
    });
  }

  // Populate projects
  populateProjects(projects) {
    if (!projects || !Array.isArray(projects)) return;
    
    const projectsList = document.querySelector('.project-list');
    if (!projectsList) return;
    
    projectsList.innerHTML = '';
    
    projects.forEach(project => {
      const li = document.createElement('li');
      li.className = 'project-item active';
      li.setAttribute('data-filter-item', '');
      li.setAttribute('data-category', project.filterCategory || 'web development');
      
      const mainLink = project.links && project.links[0] ? project.links[0].url : '#';
      
      li.innerHTML = `
        <figure class="project-img">
          <a href="${mainLink}" class="project-eye-link" target="_blank" rel="noopener noreferrer">
            <div class="project-item-icon-box">
              <i class="fas fa-eye"></i>
            </div>
            <img src="${project.image}" alt="${project.title}" loading="lazy">
          </a>
        </figure>
        <div class="project-info">
          <h3 class="project-title">
            <a href="${mainLink}" target="_blank" rel="noopener noreferrer">${project.title}</a>
          </h3>
          <p class="project-description">${project.description}</p>
          ${this.renderProjectLinks(project.links)}
          <p class="project-category">${project.category}</p>
        </div>
      `;
      
      projectsList.appendChild(li);
    });
  }

  // Render project links
  renderProjectLinks(links) {
    if (!links || !Array.isArray(links)) return '';
    
    return links.map(link => 
      `<a href="${link.url}" class="project-link" target="_blank" rel="noopener noreferrer">${link.text}</a>`
    ).join('\n');
  }
}

// Global instance
const cvDataLoader = new CVDataLoader();

  // Auto-load on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
  // Get version from URL parameter or default
  const urlParams = new URLSearchParams(window.location.search);
  const version = urlParams.get('version') || 'neutral_finance';
  
  // Initialize Firebase (optional)
  await cvDataLoader.initializeFirebase();
  
  // Load and populate CV data
  const data = await cvDataLoader.loadCVData(version);
  if (data) {
    cvDataLoader.populateCV(data);
    console.log('CV data loaded and populated successfully');
  } else {
    console.warn('No CV data found for version:', version);
  }
});
