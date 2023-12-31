const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7kcf4qx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyCollection = client.db("toyDB").collection("toys");

    app.get("/toys", async (req, res) => {
      const cursor = await toyCollection.find().limit(20).toArray();
      res.send(cursor);
    });

    app.get("/toys", async(req, res) => {
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;
      const result = await toyCollection.slice(0, limit);
      res.json(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const newToys = req.body;
      const result = await toyCollection.insertOne(newToys);
      res.send(result);
    });

    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const toys = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToys = {
        $set: {
          description: toys.description,
          price: toys.price,
          quantity: toys.quantity,
        },
      };
      const result = await toyCollection.updateOne(
        filter,
        updatedToys,
        options
      );
      res.send(result);
    });

    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toyland Server is Running...");
});

app.listen(port, () => {
  console.log(`TOYLAND SERVER IS RUNNING ON PORT : ${port}`);
});
