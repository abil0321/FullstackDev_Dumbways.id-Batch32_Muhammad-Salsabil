// const express = require("express"); //! pemanggilan menggunakan js native, dan umumnya tidak digunakan lagi
import express from "express"; //* yang sekarang digunakan, menggunakan js ES6

const app = express();
const port = 3000;
const webAccess = `http://localhost:${port}`;

// TODO: Set view engine hbs di express js
app.set("view engine", "hbs");
app.set("views", "src/views");

// TODO: set static forlder
//* app.use("path-url", express.static("path-folder"));
app.use("/assets", express.static("src/assets"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//* req (request) => dari client ke server
//* res (response) => dari server ke client
app.get("/home", home); //* Route handler ----------route home----------

app.get("/about", (req, res) => {
  const phonenumber = "08123456789";
  res.render("about", { phonenumber });
});

app.listen(port, () => {
  console.log(
    `Example app listening on port ${port}, with access ${webAccess}`
  );
});

//* fungsi dari route '/' -------------fungsi home----------------
function home(req, res) {
  res.render("index");
}
