const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();

app.get("/", (req, res) => {
  res.send("hello from Smart Eye shop");
});

app.listen(port, () => {
  console.log("listening from port", port);
});
