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
const cardsContainer = document.querySelector(".cards-container"); // Ambil elemen cards-container

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const projectNameValue = projectName.value;
  const startDateValue = date.value;
  const endDateValue = endDate.value;
  const descriptionValue = description.value;
  const nodeJSValue = nodeJS.checked ? nodeJS.value : "";
  const nextJSValue = nextJS.checked ? nextJS.value : "";
  const reactJSValue = reactJS.checked ? reactJS.value : "";
  const typescriptValue = typescript.checked ? typescript.value : "";

  const file = uploadImage.files[0]; // Ambil file yang diunggah
  const reader = new FileReader();

  if (file) {
    reader.readAsDataURL(file); // Baca file sebagai URL data
  }

  reader.onload = function (event) {
    const newCard = document.createElement("div");
    newCard.classList.add("col", "col-sm-12"); // Tambahkan kelas kolom
    newCard.innerHTML = `
        <div class="card shadow-sm h-100">
          <img src="${event.target.result}" class="card-img-top" alt="Project Image">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${projectNameValue}</h5>
            <p class="card-text">Start Date: ${startDateValue}</p>
            <p class="card-text">End Date: ${endDateValue}</p>
            <p class="card-text">Description: ${descriptionValue}</p>
            <p class="card-text">Technologies: ${nodeJSValue}, ${nextJSValue}, ${reactJSValue}, ${typescriptValue}</p>
            <div class="card-footer-icons mt-3 d-flex align-items-center">
              <button type="button" class="btn btn-edit flex-grow-1">edit</button>
              <button type="button" class="btn btn-delete">delete</button>
            </div>
          </div>
        </div>
      `;
    cardsContainer.appendChild(newCard); // Tambahkan kartu baru ke dalam kontainer
  };
});
