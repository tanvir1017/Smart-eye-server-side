const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// DB_USER=smart-eye-glases
// DB_PASS=lYcoQUz7ekvU0nvT

// mongoclientDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.14uaf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// database connect
async function run() {
  try {
    await client.connect();
    const database = client.db("smartGlasses");
    const productCollection = database.collection("products");
    const reviewCollection = database.collection("review");
    const ordersCollection = database.collection("orders");

    // products get from api
    app.get("/products", async (req, res) => {
      const size = parseInt(req.query.size);
      console.log(size);
      const cursor = productCollection.find({});
      let products;
      if (products) {
        products = await cursor.limit(size).toArray();
      } else {
        products = await cursor.toArray();
      }
      res.json(products);
    });

    // add product placed post
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.json(result);
      console.log(result);
    });
    // ordered product
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(query);
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });
    // single product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.json(product);
    });

    // order placed post
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      res.json(result);
    });

    // review post
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
      console.log(result);
    });

    // review get
    app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    // create a document to insert
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello from Smart Eye shop");
});

app.listen(port, () => {
  console.log("listening from port", port);
});
