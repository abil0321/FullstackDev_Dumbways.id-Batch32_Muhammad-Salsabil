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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//* NOTE: req (request) => dari client ke server
//* NOTE: res (response) => dari server ke client
app.get("/home", home); //* Route handler ----------route home----------

app.get("/about", (req, res) => {
  const phonenumber = "08123456789";
  res.render("about", { phonenumber });
});

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
  res.send(`<h1>Menemukan buku dengan Judul: ${nama} | Author: ${author}</h1> `);
});

//* fungsi dari route '/' -------------fungsi home----------------
function home(req, res) {
  res.render("home");
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
