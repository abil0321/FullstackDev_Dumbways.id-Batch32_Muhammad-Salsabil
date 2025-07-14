// Ambil ID dari URL
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id");

if (projectId) {
  const projectData = JSON.parse(localStorage.getItem(`project_${projectId}`));

  if (projectData) {
    // Update title
    document.getElementById("project-title").textContent = "Detail " + projectData.name;

    // Update gambar
    document.getElementById("project-image").src = projectData.imageUrl;

    // Hitung durasi bulan
    const startDate = new Date(projectData.startDate);
    document.getElementById("start-date").textContent =
      startDate.toLocaleDateString("en-GB");
    const endDate = new Date(projectData.endDate);
    document.getElementById("end-date").textContent =
      endDate.toLocaleDateString("en-GB");

    // Hitung durasi dalam bulan
    const months = Math.max(
      0,
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        endDate.getMonth() -
        startDate.getMonth()
    );
    document.getElementById("duration").textContent = `${months} month${
      months !== 1 ? "s" : ""
    }`;

    // Update deskripsi
    document.getElementById("project-description").textContent =
      projectData.description;

    // Update teknologi
    const techContainer = document.getElementById("tech-container");
    techContainer.innerHTML = ""; // Kosongkan kontainer

    // Mapping teknologi ke ikon
    const techIconMap = {
      "Node Js": "fa-node-js",
      "Next Js": "fa-brands fa-js",
      "React Js": "fa-brands fa-react",
      TyoeScript: "fa-brands fa-js",
    };

    // Bagi teknologi menjadi 2 kolom
    let col1 = document.createElement("div");
    col1.className = "col-md-5 col-sm-5 d-grid gap-2";
    let col2 = document.createElement("div");
    col2.className = "col-md-5 col-sm-5 d-grid gap-2";

    projectData.technologies.forEach((tech, index) => {
      const techItem = document.createElement("div");
      techItem.className = "d-flex align-items-center gap-3 mb-2 fs-2";

      // Cari ikon yang cocok
      const iconClass = techIconMap[tech] || "fa-circle";

      techItem.innerHTML = `
            <i class="fa-brands ${iconClass}"></i>
            <span class="tech-item">${tech}</span>
          `;

      // Distribusi ke kolom 1 dan 2
      if (index % 2 === 0) {
        col1.appendChild(techItem);
      } else {
        col2.appendChild(techItem);
      }
    });

    techContainer.appendChild(col1);
    techContainer.appendChild(col2);
  } else {
    document.querySelector(
      ".content-text p"
    ).innerHTML = `<div class="alert alert-danger">Proyek tidak ditemukan.</div>`;
  }
} else {
  document.querySelector(
    ".content-text p"
  ).innerHTML = `<div class="alert alert-warning">ID proyek tidak tersedia.</div>`;
}

function goBack() {
  // Arahkan ke halaman utama
  window.location.href = "index.html";
}
