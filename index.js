// const express = require("express"); //! pemanggilan menggunakan js native, dan umumnya tidak digunakan lagi
import express from "express"; //* yang sekarang digunakan, menggunakan js ES6
import pool from "./src/database/db.js";
import multer from "multer";
import path from "path";

const app = express();
const port = 3000;
const webAccess = `http://localhost:${port}`;

// TODO: Inisialisasi storage & upload SEBELUM route ========================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/assets/img/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// TODO: Set view engine hbs di express js
app.set("view engine", "hbs");
app.set("views", "src/views");

// TODO: use static forlder
app.use("/assets", express.static("src/assets"));
app.use(express.urlencoded({ extended: false }));

//* Route handler ----------route home----------
app.get("/", home);
app.post("/project", upload.single("upload_image"), store_project);
app.get("/project/:id", projectDetail);
app.get("/project/:id/edit", editProject);
app.post("/project/:id/edit", upload.single("upload_image"), updateProject);
app.post("/project/:id/delete", deleteProject);

app.get("/about", about);
app.get("/contact", contact);

//* fungsi dari route '/' -------------fungsi home----------------
async function home(req, res) {
  try {
    const result = await pool.query("SELECT * FROM projects ORDER BY id DESC");
    const projects = result.rows.map((project) => {
      return {
        ...project,
        duration: getDuration(project.start_date, project.end_date),
      };
    });
    res.render("home", { projects });
  } catch (err) {
    console.error(err);
    res.send("Gagal mengambil data");
  }
}

async function projectDetail(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.redirect("/");
    }
    const project = result.rows[0];
    project.start_date_formatted = formatDate(project.start_date);
    project.end_date_formatted = formatDate(project.end_date);
    project.duration = getDuration(project.start_date, project.end_date);

    res.render("project-detail", { project });
  } catch (err) {
    console.error(err);
    res.send("Gagal mengambil detail project");
  }
}

async function editProject(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.redirect("/");
    }
    const project = result.rows[0];
    project.start_date_formatted_input = formatDateForInput(project.start_date);
    project.end_date_formatted_input = formatDateForInput(project.end_date);

    res.render("edit-project", { project });
  } catch (err) {
    console.error(err);
    res.send("Gagal menampilkan form edit");
  }
}

async function updateProject(req, res) {
  const { id } = req.params;
  const { name, start_date, end_date, description } = req.body;
  const nodejs = req.body.nodejs ? true : false;
  const nextjs = req.body.nextjs ? true : false;
  const reactjs = req.body.reactjs ? true : false;
  const typescript = req.body.typescript ? true : false;

  try {
    let currentProject = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [id]
    );
    let currentImage = currentProject.rows[0].upload_image;

    const upload_image = req.file ? req.file.filename : currentImage;

    await pool.query(
      `UPDATE projects SET 
                name = $1, start_date = $2, end_date = $3, description = $4, 
                nodejs = $5, nextjs = $6, reactjs = $7, typescript = $8, upload_image = $9 
            WHERE id = $10`,
      [
        name,
        start_date,
        end_date,
        description,
        nodejs,
        nextjs,
        reactjs,
        typescript,
        upload_image,
        id,
      ]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Gagal mengupdate project");
  }
}

async function deleteProject(req, res) {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM projects WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Gagal menghapus project");
  }
}

// TODO: add data project postgresql ========================

async function store_project(req, res) {
  const { name, start_date, end_date, description } = req.body;
  // Checkbox: jika tidak dicentang, value-nya undefined
  const nodejs = req.body.nodejs ? true : false;
  const nextjs = req.body.nextjs ? true : false;
  const reactjs = req.body.reactjs ? true : false;
  const typescript = req.body.typescript ? true : false;
  const upload_image = req.file ? req.file.filename : null;

  try {
    await pool.query(
      `INSERT INTO projects 
        (name, start_date, end_date, description, nodejs, nextjs, reactjs, typescript, upload_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        name,
        start_date,
        end_date,
        description,
        nodejs,
        nextjs,
        reactjs,
        typescript,
        upload_image,
      ]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Gagal menyimpan project");
  }
}

// Helper functions
function getDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = Math.floor((diffDays % 365) % 30);

  let duration = "";
  if (years > 0) duration += `${years} year${years > 1 ? "s" : ""} `;
  if (months > 0) duration += `${months} month${months > 1 ? "s" : ""} `;
  if (days > 0) duration += `${days} day${days > 1 ? "s" : ""}`;

  return duration.trim();
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateForInput(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const day = `0${d.getDate()}`.slice(-2);
  return `${year}-${month}-${day}`;
}

function about(req, res) {
  const phonenumber = "08123456789";
  res.render("about", { phonenumber });
}
function contact(req, res) {
  const phonenumberContact = "08123456789";
  res.render("contact", { phonenumberContact });
}


// ! ---------------------------------------------------------------------------------------
app.get("/not-found", (req, res) => {
  res.send("<h1>Halaman Tidak Ditemukan</h1>");
});
app.use((req, res) => {
  res.redirect("not-found");
});

app.listen(port, () => {
  console.log(
    `Example app listening on port ${port}, with access ${webAccess}`
  );
});
