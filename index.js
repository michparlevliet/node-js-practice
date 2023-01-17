const express = require("express");
const path = require("path");

// APP VARIABLES
const app = express();
const port = process.env.PORT || 8888;


// ROUTES DEFINITIONS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

var links = [
  {
    name: "Home",
    path: "/"
  },
  {
    name: "About",
    path: "/about"
  },
  {
    name: "Shop",
    path: "/"
  }
];

app.get("/", (request, response) => {
//   response.status(200).send("Test page");
  response.render("index", { title: "Home", menu: links });
});

app.get("/about", (request, response) => {
  response.render("about", { title: "About", menu: links });
});

app.get("/shop", (request, response) => {
  response.render("shop", {title: "Shop", menu: links});
});

// SERVER ACTIVATION
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});

