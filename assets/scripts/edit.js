// Get project ID from URL parameters
function getProjectIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

// Get project data from localStorage
function getProjectData(projectId) {
  const projectData = localStorage.getItem(`project_${projectId}`);
  return projectData ? JSON.parse(projectData) : null;
}

// Load project data into form
function loadProjectData() {
  const projectId = getProjectIdFromUrl();
  const loadingIndicator = document.getElementById("loadingIndicator");
  const errorMessage = document.getElementById("errorMessage");
  const errorText = document.getElementById("errorText");
  const editForm = document.getElementById("editForm");

  if (!projectId) {
    showError("No project ID provided in URL");
    return;
  }

  const projectData = getProjectData(projectId);

  if (!projectData) {
    showError("Project not found");
    return;
  }

  // Hide loading indicator
  loadingIndicator.style.display = "none";

  // Show form
  editForm.style.display = "block";

  // Populate form fields
  document.getElementById("projectName").value = projectData.name || "";
  document.getElementById("startDate").value = projectData.startDate || "";
  document.getElementById("endDate").value = projectData.endDate || "";
  document.getElementById("description").value = projectData.description || "";

  // Set current image
  const currentImage = document.getElementById("currentImage");
  if (projectData.imageUrl) {
    currentImage.src = projectData.imageUrl;
    currentImage.style.display = "block";
  } else {
    currentImage.style.display = "none";
  }

  // Check technologies
  const technologies = projectData.technologies || [];
  document.getElementById("nodejs").checked = technologies.includes("Node Js");
  document.getElementById("nextjs").checked = technologies.includes("Next Js");
  document.getElementById("reactjs").checked =
    technologies.includes("React Js");
  document.getElementById("typescript").checked =
    technologies.includes("TypeScript");
}

// Show error message
function showError(message) {
  const loadingIndicator = document.getElementById("loadingIndicator");
  const errorMessage = document.getElementById("errorMessage");
  const errorText = document.getElementById("errorText");

  loadingIndicator.style.display = "none";
  errorText.textContent = message;
  errorMessage.classList.remove("d-none");
}

// Show success message
function showSuccess() {
  const successMessage = document.getElementById("successMessage");
  successMessage.classList.remove("d-none");

  // Hide success message after 3 seconds
  setTimeout(() => {
    successMessage.classList.add("d-none");
  }, 3000);
}

// Cancel edit and go back
function cancelEdit() {
  if (
    confirm(
      "Are you sure you want to cancel? Any unsaved changes will be lost."
    )
  ) {
    window.location.href = "index.html";
  }
}

// Update project data
function updateProject(projectId, updatedData) {
  localStorage.setItem(`project_${projectId}`, JSON.stringify(updatedData));
}

// Form submit handler
document.getElementById("editForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const projectId = getProjectIdFromUrl();
  const currentData = getProjectData(projectId);

  if (!currentData) {
    showError("Project data not found");
    return;
  }

  // Get form values
  const projectName = document.getElementById("projectName").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const description = document.getElementById("description").value;

  // Validate dates
  if (new Date(startDate) > new Date(endDate)) {
    showError("Start date cannot be later than end date");
    return;
  }

  // Get selected technologies
  const technologies = [];
  if (document.getElementById("nodejs").checked) technologies.push("Node Js");
  if (document.getElementById("nextjs").checked) technologies.push("Next Js");
  if (document.getElementById("reactjs").checked) technologies.push("React Js");
  if (document.getElementById("typescript").checked)
    technologies.push("TypeScript");

  // Handle image upload
  const uploadImage = document.getElementById("uploadImage");
  const file = uploadImage.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const updatedData = {
        ...currentData,
        name: projectName,
        startDate: startDate,
        endDate: endDate,
        description: description,
        technologies: technologies,
        imageUrl: event.target.result,
      };

      updateProject(projectId, updatedData);
      showSuccess();

      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    };
    reader.readAsDataURL(file);
  } else {
    // No new image, keep existing one
    const updatedData = {
      ...currentData,
      name: projectName,
      startDate: startDate,
      endDate: endDate,
      description: description,
      technologies: technologies,
    };

    updateProject(projectId, updatedData);
    showSuccess();

    // Redirect after a short delay
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  }
});

// Load project data when page loads
document.addEventListener("DOMContentLoaded", function () {
  loadProjectData();
});
