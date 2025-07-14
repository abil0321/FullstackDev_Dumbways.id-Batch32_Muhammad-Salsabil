// Generate unique project id
function generateProjectId() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

const form = document.querySelector("#form");
const projectName = document.querySelector("#projectName");
const date = document.querySelector("#startDate");
const endDate = document.querySelector("#endDate");
const description = document.querySelector("#description");
const nodeJS = document.querySelector("#nodejs");
const nextJS = document.querySelector("#nextjs");
const reactJS = document.querySelector("#reactjs");
const typescript = document.querySelector("#typescript");
const uploadImage = document.querySelector("#uploadImage");
const submitBtn = document.querySelector("#submitBtn");
const cardsContainer = document.querySelector(".cards-container");

//TODO: Function to load all projects from localStorage
function loadAllProjects() {
  const projects = [];

  // Loop through all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    // Check if the key starts with "project_"
    if (key && key.startsWith("project_")) {
      try {
        const projectData = JSON.parse(localStorage.getItem(key));
        if (projectData) {
          projects.push(projectData);
        }
      } catch (error) {
        console.error(`Error parsing project data for key ${key}:`, error);
      }
    }
  }

  return projects;
}

// TODO: Function to display all projects
function displayAllProjects() {
  const projects = loadAllProjects();

  //* Clear existing cards
  cardsContainer.innerHTML = "";

  //* Create cards for each project
  projects.forEach((project) => {
    createProjectCard(project);
  });
}

// TODO: Function to create a project card
function createProjectCard(projectData) {
  const newCard = document.createElement("div");
  newCard.classList.add("col", "col-sm-12", "col-lg-4", "col-md-6");
  newCard.setAttribute("data-project-id", projectData.id); // Add data attribute for easy identification

  newCard.innerHTML = `
    <div class="card shadow-sm h-100">
      <img src="${
        projectData.imageUrl || "default-image.jpg"
      }" class="card-img-top" alt="Project Image" onclick="window.location.href='detail.html?id=${
    projectData.id
  }'">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title mb-1"><a href="detail.html?id=${projectData.id}"> ${projectData.name}</a></h5>
        <span class="card-text">Start Date: ${projectData.startDate}</span>
        <span class="card-text">End Date: ${projectData.endDate}</span>
        <p class="card-text mt-2"><b>Description:</b> ${projectData.description}</p>
        <p class="card-text"><b>Technologies:</b> ${projectData.technologies.join(
          ", "
        )}</p>
        <div class="card-footer-icons mt-3 d-flex gap-3 align-items-center">
          <button class="btn btn-edit flex-grow-1" onclick="window.location.href='edit.html?id=${
            projectData.id
          }'">Edit</button>
          <button class="btn btn-delete" onclick="deleteProject('${
            projectData.id
          }')">Delete</button>
        </div>
      </div>
    </div>
  `;

  cardsContainer.appendChild(newCard);
}

// Form submission handler
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const projectId = generateProjectId(); // Generate unique ID for each project
  const projectNameValue = projectName.value;
  const startDateValue = date.value;
  const endDateValue = endDate.value;
  const descriptionValue = description.value;
  const nodeJSValue = nodeJS.checked ? nodeJS.value : "";
  const nextJSValue = nextJS.checked ? nextJS.value : "";
  const reactJSValue = reactJS.checked ? reactJS.value : "";
  const typescriptValue = typescript.checked ? typescript.value : "";
  const file = uploadImage.files[0];

  const projectData = {
    id: projectId,
    name: projectNameValue,
    startDate: startDateValue,
    endDate: endDateValue,
    description: descriptionValue,
    technologies: [
      nodeJSValue,
      nextJSValue,
      reactJSValue,
      typescriptValue,
    ].filter(Boolean),
    imageUrl: null,
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      projectData.imageUrl = event.target.result;
      saveAndDisplayProject(projectData);
    };
    reader.readAsDataURL(file);
  } else {
    saveAndDisplayProject(projectData);
  }
});

// Function to save project and display it
function saveAndDisplayProject(projectData) {
  // Save to localStorage with unique key
  localStorage.setItem(
    `project_${projectData.id}`,
    JSON.stringify(projectData)
  );

  // Create and display the new card
  createProjectCard(projectData);

  // Reset form
  form.reset();

  console.log("Project saved successfully:", projectData);
}

// Fixed delete function
function deleteProject(projectId) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this project?"
  );

  if (confirmDelete) {
    // Remove from localStorage
    localStorage.removeItem(`project_${projectId}`);

    // Remove the card from DOM instead of reloading the page
    const cardToRemove = document.querySelector(
      `[data-project-id="${projectId}"]`
    );
    if (cardToRemove) {
      cardToRemove.remove();
    }

    console.log(`Project ${projectId} deleted successfully`);
  }
}

// Function to get all project data (utility function)
function getAllProjectData() {
  return loadAllProjects();
}

// Function to search projects by name
function searchProjects(searchTerm) {
  const projects = loadAllProjects();
  return projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

// Function to filter projects by technology
function filterProjectsByTechnology(technology) {
  const projects = loadAllProjects();
  return projects.filter((project) =>
    project.technologies.includes(technology)
  );
}

// Function to clear all projects (with confirmation)
function clearAllProjects() {
  const confirmClear = confirm(
    "Are you sure you want to delete ALL projects? This action cannot be undone."
  );

  if (confirmClear) {
    const projects = loadAllProjects();
    projects.forEach((project) => {
      localStorage.removeItem(`project_${project.id}`);
    });

    cardsContainer.innerHTML = "";
    console.log("All projects cleared successfully");
  }
}

// Load and display all projects when page loads
document.addEventListener("DOMContentLoaded", function () {
  displayAllProjects();
});

// Export functions for global access
window.deleteProject = deleteProject;
window.getAllProjectData = getAllProjectData;
window.searchProjects = searchProjects;
window.filterProjectsByTechnology = filterProjectsByTechnology;
window.clearAllProjects = clearAllProjects;
