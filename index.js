// const express = require("express"); //! pemanggilan menggunakan js native, dan umumnya tidak digunakan lagi
import express from "express"; //* yang sekarang digunakan, menggunakan js ES6
import pool from "./src/database/db.js";
import multer from "multer";
import fs from "fs"; // fs untuk menghapus file gambar
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import session from "express-session";
import flash from "express-flash";

const app = express();
const port = 3000;
const webAccess = `http://localhost:${port}`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Inisialisasi storage & upload SEBELUM route ========================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/assets/img/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file JPG, JPEG, atau PNG yang diizinkan"), false);
    }
  },
});

// TODO: Set view engine hbs di express js
app.set("view engine", "hbs");
app.set("views", "src/views");

// TODO: use static forlder, urlendcoded, and flash
app.use("/assets", express.static(path.join(__dirname, 'src/assets')));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

function authMiddleware(req, res, next) {
  if (req.session.users) {
    return next(); // Jika user sudah login, lanjutkan ke route berikutnya
  }
  req.flash("message", "Silakan login terlebih dahulu");
  res.redirect("/login"); // Jika belum login, redirect ke halaman login
}

function guestMiddleware(req, res, next) {
  if (!req.session.users) {
    return next(); // Jika user belum login, lanjutkan ke route berikutnya
  }
  req.flash("message", "Anda sudah login");
  res.redirect("/"); // Jika sudah login, redirect ke halaman utama
}

//* Route handler ----------route home----------
app.get("/login", guestMiddleware, loginWindow);
app.post("/login", guestMiddleware, login);

app.get("/register", guestMiddleware, registerWindow);
app.post("/register", guestMiddleware, upload.single("upload_image"), register);

app.get("/logout", logout);

app.get("/add_project", authMiddleware, home);
app.post(
  "/project",
  authMiddleware,
  upload.single("upload_image"),
  store_project
);
app.get("/project/:id", authMiddleware, projectDetail);
app.get("/project/:id/edit", authMiddleware, editProject);
app.post(
  "/project/:id/edit",
  authMiddleware,
  upload.single("upload_image"),
  updateProject
);
app.post("/project/:id/delete", authMiddleware, deleteProject);

// TODO: Test stage 1 - Route My Portfolio ========================
app.get("/", home_myportfolio);
app.get("/projects", projects);
app.get("/about", about);
app.get("/contact", contact);

//* fungsi dari route '/' -------------fungsi home----------------
async function loginWindow(req, res) {
  if (!req.session.users) {
    res.render("login", {
      message: req.flash("message"),
      successMessage: req.flash("success"),
    });
  } else {
    res.redirect("/");
  }
}
async function login(req, res) {
  let { email, password } = req.body;
  try {
    // console.log(email, password);
    const isRegistered = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    // Cek apakah email terdaftar
    if (isRegistered.rows.length === 0) {
      req.flash("message", "Email tidak terdaftar");
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(
      password,
      isRegistered.rows[0].password
    );

    if (!isMatch) {
      req.flash("message", "Password salah");
      return res.redirect("/login");
    }
    req.session.users = {
      name: isRegistered.rows[0].name,
      email: isRegistered.rows[0].email,
      profile_img: isRegistered.rows[0].profile_img,
    };
    res.redirect("/add_project");
  } catch (error) {
    console.error(error);
    res.send("Gagal login, silakan coba lagi.");
  }
}
async function registerWindow(req, res) {
  if (!req.session.users) {
    res.render("register", {
      errorMessage: req.flash("message"),
      error: req.flash("error"),
    });
  } else {
    res.redirect("/register");
  }
}
async function register(req, res) {
  const { name, email, password } = req.body;
  try {
    let upload_image = null;
    if (req.file) {
      upload_image = req.file.filename;
      console.log("File uploaded:", upload_image);
    }
    // Gunakan parameterized query untuk hindari SQL injection
    const checkEmail = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    // Perbaikan utama: Cek apakah ada hasil query (rows.length)
    if (checkEmail.rows.length > 0) {
      // Hapus file jika sudah terupload
      if (upload_image) {
        fs.unlinkSync(path.join(__dirname, "src/assets/img", upload_image));
      }
      req.flash("message", "Email sudah terdaftar");
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke database
    await pool.query(
      `INSERT INTO users (email, password, name, profile_img) 
       VALUES ($1, $2, $3, $4)`,
      [email, hashedPassword, name, upload_image]
    );
    console.log("Registering user:", name, email, password, upload_image);

    // Tambahkan flash message untuk sukses registrasi
    req.flash("success", "Registrasi berhasil! Silakan login");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("message", "Gagal mendaftar, silakan coba lagi.");
    res.redirect("/register");
  }
}
async function logout(req, res) {
  try {
    // Hapus session user
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Gagal logout");
      }

      // Hapus cookie session (jika menggunakan cookie-based session)
      res.clearCookie("connect.sid"); // 'connect.sid' adalah nama default cookie session

      // Redirect ke halaman login setelah logout berhasil
      res.redirect("/login");
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).send("Terjadi kesalahan saat logout");
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
  const technologies = {
    nodejs: !!req.body.nodejs,
    nextjs: !!req.body.nextjs,
    reactjs: !!req.body.reactjs,
    typescript: !!req.body.typescript,
  };

  try {
    // Ambil data project saat ini
    const currentProject = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [id]
    );

    if (currentProject.rows.length === 0) {
      req.flash("error", "Project tidak ditemukan");
      return res.redirect("/");
    }

    const currentImage = currentProject.rows[0].upload_image;
    let upload_image = currentImage;
    let oldImageToDelete = null;

    // Cek apakah ada file baru yang di-upload
    if (req.file) {
      upload_image = req.file.filename;

      // Tandai gambar lama untuk dihapus
      if (currentImage) {
        oldImageToDelete = path.join(__dirname, "src/assets/img", currentImage);
      }
    }

    // Update database
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
        technologies.nodejs,
        technologies.nextjs,
        technologies.reactjs,
        technologies.typescript,
        upload_image,
        id,
      ]
    );

    // Hapus gambar lama jika ada gambar baru dan update berhasil
    if (req.file && oldImageToDelete && fs.existsSync(oldImageToDelete)) {
      fs.unlinkSync(oldImageToDelete);
    }

    req.flash("success", "Project berhasil diupdate!");
    res.redirect("/");
  } catch (err) {
    console.error(err);

    // Hapus file baru jika upload gagal
    if (req.file) {
      const newImagePath = path.join(
        __dirname,
        "src/assets/img",
        req.file.filename
      );
      if (fs.existsSync(newImagePath)) {
        fs.unlinkSync(newImagePath);
      }
    }

    req.flash("error", "Gagal mengupdate project");
    res.redirect(`/project/${id}/edit`);
  }
}

async function deleteProject(req, res) {
  const { id } = req.params;

  try {
    // Ambil data gambar sebelum menghapus
    const result = await pool.query(
      "SELECT upload_image FROM portfolio WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      req.flash("error", "Project tidak ditemukan");
      return res.redirect("/");
    }

    const imagePath = result.rows[0].upload_image;

    // Hapus dari database
    await pool.query("DELETE FROM portfolio WHERE id = $1", [id]);

    // Hapus file gambar jika ada
    if (imagePath) {
      const fullPath = path.join(__dirname, "src/assets/img", imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    req.flash("success", "Project berhasil dihapus!");
    res.redirect("/add_project");
  } catch (err) {
    console.error(err);
    req.flash("error", "Gagal menghapus project");
    res.redirect("/");
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

// TODO: test stage 1 - membuat portfolio ========================
async function home_myportfolio(req, res) {
  try {
    const result = await pool.query("SELECT * FROM portfolio ORDER BY id DESC");
    const portfolios = result.rows.map((portfolio) => ({
      ...portfolio,
      duration: getDuration(portfolio.start_date, portfolio.end_date),
    }));

    return res.render("index", {
      portfolios,
    }); // RETURN di sini
  } catch (err) {
    console.error(err);
    res.send("Gagal Melakukan load data");
  }
}

async function projects(req, res) {
  try {
    const result = await pool.query("SELECT * FROM portfolio ORDER BY id DESC");
    const portfolios = result.rows.map((portfolio) => ({
      ...portfolio,
      duration: getDuration(portfolio.start_date, portfolio.end_date),
    }));

    return res.render("project", {
      portfolios,
    }); // RETURN di sini
  } catch (err) {
    console.error(err);
    res.send("Gagal Melakukan load data");
  }
}
async function store_project(req, res) {
  const { name, start_date, end_date, description, url_github, url_demo } =
    req.body;
  const technologies = {
    nodejs: !!req.body.nodejs,
    nextjs: !!req.body.nextjs,
    reactjs: !!req.body.reactjs,
    typescript: !!req.body.typescript,
    laravel: !!req.body.laravel,
  };
  // console.log(req.file);
  try {
    let upload_image = null;
    if (req.file) {
      upload_image = req.file.filename;
    }

    await pool.query(
      `INSERT INTO portfolio (name, start_date, end_date, description, url_github, url_demo, 
        nodejs, nextjs, reactjs, typescript, laravel, upload_image) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        name,
        start_date,
        end_date,
        description,
        url_github,
        url_demo,
        technologies.nodejs,
        technologies.nextjs,
        technologies.reactjs,
        technologies.typescript,
        technologies.laravel,
        upload_image,
      ]
    );

    req.flash("success", "Project berhasil ditambahkan!");
    res.redirect("/add_project");
  } catch (err) {
    console.error(err);

    // Hapus file jika upload gagal
    if (req.file) {
      const filePath = path.join(
        __dirname,
        "src/assets/img",
        req.file.filename
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    req.flash("error", "Gagal menambahkan project");
    res.redirect("/add-project");
  }
}
async function home(req, res) {
  try {
    const result = await pool.query("SELECT * FROM portfolio ORDER BY id DESC");
    const portfolios = result.rows.map((portfolio) => ({
      ...portfolio,
      duration: getDuration(portfolio.start_date, portfolio.end_date),
    }));

    // Perbaikan: Gunakan return untuk menghentikan eksek
    const dataUser = {
      name: req.session.users.name,
      email: req.session.users.email,
      profile_img: req.session.users.profile_img || "default.png",
    };

    return res.render("home", {
      portfolios,
      dataUser,
      success: req.flash("message"),
      error: req.flash("success"),
    }); // RETURN di sini
  } catch (err) {
    console.error(err);
    res.send("Gagal Melakukan load data");
  }
}
async function projectDetail(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM portfolio WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.redirect("/add_project");
    }
    const portfolio = result.rows[0];
    portfolio.start_date_formatted = formatDate(portfolio.start_date);
    portfolio.end_date_formatted = formatDate(portfolio.end_date);
    portfolio.duration = getDuration(portfolio.start_date, portfolio.end_date);

    res.render("project-detail", { portfolio });
  } catch (err) {
    console.error(err);
    res.send("Gagal mengambil detail portfolio");
  }
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

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    req.flash("error", "Ukuran file terlalu besar (maks 2MB)");
    return res.redirect("/");
  } else if (err) {
    req.flash("error", err.message);
    return res.redirect("/");
  }
  next();
});

app.listen(port, () => {
  console.log(
    `Example app listening on port ${port}, with access ${webAccess}`
  );
});
