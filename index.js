// const express = require("express"); //! pemanggilan menggunakan js native, dan umumnya tidak digunakan lagi
import express from "express"; //* yang sekarang digunakan, menggunakan js ES6

const app = express();
const port = 3000;
const webAccess = `http://localhost:${port}`;

// TODO: Set view engine hbs di express js
app.set("view engine", "hbs");
app.set("views", "src/views");

// TODO: use static forlder
//* app.use("path-url", express.static("path-folder"));
app.use("/assets", express.static("src/assets"));

app.use(express.urlencoded({ extended: false }));

//* NOTE: req (request) => dari client ke server
//* NOTE: res (response) => dari server ke client
// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

//* Route handler ----------route home----------
app.get("/", home);
app.get("/about", about);
app.get("/contact", contact);
app.post("/contact", store_contact);
app.get("/portfolio/:id", portofolioDetail);

//* fungsi dari route '/' -------------fungsi home----------------
let data = [
  {
    id: 1,
    title: "Belajar HTML",
  },
  {
    id: 2,
    title: "Belajar CSS",
  },
  {
    id: 3,
    title: "Belajar JS",
  },
];
function home(req, res) {
  res.render("home", { accounts });
}
function about(req, res) {
  const phonenumber = "08123456789";
  res.render("about", { phonenumber });
}

function contact(req, res) {
  const phonenumberContact = "08123456789";
  res.render("contact", { phonenumberContact });
}

let accounts = [];
function store_contact(req, res) {
  // console.log(req.body);
  let { name, password } = req.body;
  let account = {
    id: accounts.length + 1, 
    name,
    password,
  };
  accounts.push(account);
  console.log(accounts);
  console.log("contact berhasil disimpan");
  res.redirect("/");
}

function portofolioDetail(req, res) {
  const { id } = req.params;

  let result = accounts.find((element) => element.id == id);
  console.log(result);
  res.render("portfolio", { result });
}

// TODO: Explore Mandiri -------------------------------------------------------

// TODO: memanfaatkan request queries
app.get("/search", (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.send(`<h1>Keyword Belum Dituliskan !</h1>`);
  }
  res.send(`<h1>Search Keyword: ${q}</h1>`);
});

// TODO: memanfaatkan request parameter
app.get("/blog/:nama/:author", (req, res) => {
  const { nama, author } = req.params;
  res.send(
    `<h1>Menemukan buku dengan Judul: ${nama} | Author: ${author}</h1> `
  );
});

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
