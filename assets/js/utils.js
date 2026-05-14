document.addEventListener('DOMContentLoaded', function() {
  var navCv = document.getElementById('nav-cv');
  var navProjects = document.getElementById('nav-projects');
    var baseSection = document.querySelector('.base');
    var projectsSection = document.querySelector('.projects');

  // Only run if both sections exist
  if (baseSection && projectsSection) {
    // Default state: show base, hide projects
    baseSection.style.display = "block";
    projectsSection.style.display = "none";

    navProjects.addEventListener('click', function(e) {
      e.preventDefault();
      baseSection.style.display = "none";
      projectsSection.style.display = "block";
    });

    navCv.addEventListener('click', function(e) {
      e.preventDefault();
      baseSection.style.display = "block";
      projectsSection.style.display = "none";
    });
    }
  });

if (typeof window.letters === 'undefined') {
  window.letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
}

function scrambleText(target) {
  let iteration = 0;
  clearInterval(target.scrambleInterval);

  target.scrambleInterval = setInterval(() => {
    target.innerText = target.innerText
      .split("")
      .map((letter, index) => {
        if (index < iteration) {
          return target.dataset.value[index];
        }
        return window.letters[Math.floor(Math.random() * 26)];
      })
      .join("");

    if (iteration >= target.dataset.value.length) {
      clearInterval(target.scrambleInterval);
    }

    iteration += 1 / 3;
  }, 30);
}

document.addEventListener("DOMContentLoaded", () => {
  const projectsTitle = document.querySelector(".projects-title");

  // Run the scramble effect on page load
  scrambleText(projectsTitle);

  // When the "Projects" nav tab is clicked, re-run the effect
  const navProjects = document.getElementById("nav-projects");
  navProjects.addEventListener("click", () => {
    scrambleText(projectsTitle);
  });

  // Optionally, also re-run the effect on hover
  projectsTitle.addEventListener("mouseover", event => {
    scrambleText(event.target);
  });
});
