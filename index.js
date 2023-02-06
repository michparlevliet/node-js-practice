const express = require("express");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
const { request } = require("http");

// Mongo
const dbUrl =  "mongodb://testdbuser:test123!@127.0.0.1:27017/?authMechanism=DEFAULT&authSource=testdb";
const client = new MongoClient(dbUrl);


// APP VARIABLES
const app = express();
const port = process.env.PORT || 8888;


// ROUTES DEFINITIONS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

// by default, data is expressed as a query string. it's easier to deal with form data if it's in JSON form.
// in order to parse POST body data as JSON, do the following:
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (request, response) => {
  links = await getLinks();
  response.render("index", { title: "Home", menu: links });
});

app.get("/about", async (request, response) => {
  links = await getLinks();
  info = await getAboutInfo();
  response.render("about", { title: "About", menu: links, about: info });
});

app.get("/shop", async (request, response) => {
  links = await getLinks();
  products = await getProducts();
  response.render("shop", {title: "Shop", menu: links, shop: products});
});

app.get("/admin/menu", async (request, response) => {
  links = await getLinks();
  response.render("menu-list", { title: "Menu links admin", menu: links });
});
app.get("/admin/menu/add", async (request, response) => {
  links = await getLinks();
  response.render("menu-add", { title: "Add link", menu: links });
});

// FORM PROCESSING PATHS
app.post("/admin/menu/add/submit", async (request, response) => {
  // for a POST form, field values are passed through request.body.<field-name>
  // need to parse for JSON to do this (see notes above)
  let weightVal = request.body.weight;
  let pathVal = request.body.path;
  let nameVal = request.body.name;
  let newLink = {
    weight: weightVal,
    path: pathVal,
    name: nameVal
  };
  await addLink(newLink);
  response.redirect("/admin/menu"); // goes back to admin page
});
app.get("/admin/menu/delete", async (request, response) => {
  // for a GET form, field values are passed in as request.query.<field-name> because we're retrieving from the query string
  let id = request.query.linkId;
  await deleteLink(id);
  response.redirect("/admin/menu");
})
app.get("/admin/menu/edit", async (request, response) => {
  if (request.query.linkId) {
    let id = request.query.linkId;
    let linkToEdit = await getSingleLink(id);
    links = await getLinks();
    response.render("menu-edit", { title: "Edit link", editLink: linkToEdit, menu: links });
  } else {
    response.redirect("/admin/menu");
  }
});
app.get("/shop/product", async (request, response) => {
  if (request.query.productId) {
    let id = request.query.productId;
    let productView = await getSingleProduct(id);
    links = await getLinks();
    response.render("product", { title: "View Product", menu: links, product: productView});
  } else {
    response.redirect("/shop");
  }
});

app.post("/admin/menu/edit/submit", async (request, response) => {
  // fill out code for lab
  // get the _id to use as a filter
  let id = request.body.linkId;

  let weightVal = request.body.weight;
  let pathVal = request.body.path;
  let nameVal = request.body.name;
  // get weight/path/name values and build this as updated document
  let link = {
    weight: weightVal,
    path: pathVal,
    name: nameVal
  };
  // run editLink()
  let editIdFilter = { _id: new ObjectId(id)};


  await editLink(editIdFilter, link);
  response.redirect("/admin/menu");
})

// SERVER ACTIVATION
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});

// MONGO FUNCTIONS
async function connection() {
  await client.connect();
  db = client.db("testdb");
  return db;
}
// async function to retrieve all links docs from menuLinks collection
async function getLinks() {
  db = await connection();
  var results = db.collection("menuLinks").find({}); // {} as the query means no filter, so select all
  res = await results.toArray();
  return res;
}
async function getAboutInfo() {
  db = await connection();
  var results = db.collection("aboutInfo").find({});
  res = await results.toArray();
  return res;
}
async function getProducts() {
  db = await connection();
  var results = db.collection("products").find({});
  res = await results.toArray();
  return res;
}
// async function to insert one doc into menuLinks
async function addLink(link) {
  db = await connection();
  let status = await db.collection("menuLinks").insertOne(link);
  console.log("link added");
}
// async function to delete one doc by id
async function deleteLink(id) {
  db = await connection();
  const deleteIdFilter = { _id: new ObjectId(id) };
  const result = await db.collection("menuLinks").deleteOne(deleteIdFilter);
  if (result.deletedCount === 1)
    console.log("delete successful");
}
// async function to select one document by id
async function getSingleLink(id) {
  db = await connection();
  const editIdFilter = { _id: new ObjectId(id) };
  const result = db.collection("menuLinks").findOne(editIdFilter);
  return result;
}
async function getSingleProduct(id) {
  db = await connection();
  const viewIdFilter = { _id: Object(id) };
  const result = db.collection("products").findOne(viewIdFilter);
  return result;
}
// async function to edit one document
async function editLink(id, link) {
  // fill out
  db = await connection();
  
  const updateLink = {
    $set: link,
  };
  const result = await db.collection("menuLinks").updateOne(id, updateLink);
  
  console.log("link updated");
  return result;
}
