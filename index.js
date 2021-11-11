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
    const usersCollection = database.collection("users");
    const productCollection = database.collection("products");
    const reviewCollection = database.collection("review");
    const ordersCollection = database.collection("orders");

    // products get from api
    app.get("/products", async (req, res) => {
      const size = parseInt(req.query.size);
      const cursor = productCollection.find({});
      let products;
      if (size) {
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
    });

    // order get
    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.json(orders);
    });
    // get order product by email
    app.get("/email", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });

    // delet form my cart
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const myCart = await ordersCollection.deleteOne(query);
      res.json(myCart);
    });

    // app put
    app.put("/orders", async (req, res) => {
      const id = req.body._id;
      const checked = req.body.checked;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const data = { $set: { status: checked } };
      const result = await ordersCollection.updateOne(query, data, options);
      res.json(result);
    });

    // single product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.json(product);
    });
    // delete product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.deleteOne(query);
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
    });

    // review get
    app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    // create a user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
    });

    // upsert user by google
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // set admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // check admin status
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
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
