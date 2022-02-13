const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
const cors = require('cors');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mongodb Configaration
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8vsmo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log('database connected');

    const database = client.db('sneakers');
    const productsCollection = database.collection('products');
    const ordersCollection = database.collection('orders');
    const reviewsCollection = database.collection('reviews');
    const usersCollection = database.collection('users');

    // POST User [Save A New User to Database]
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      // console.log(result, 'res');
      res.json(result);
    });

    // PUT Users [Upsert Google User]
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      // console.log(result, 'g');
      res.json(result);
    });

    // PUT Users [Update User to Make Admin]
    app.put('/users/admin', async (req, res) => {
      const email = req.body.email;
      const filter = { email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      console.log(result);
      res.json(result);
    });

    // GET A User and Check if that User is Admin
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      let admin = false;
      if (user?.role === 'admin') {
        admin = true;
      }
      res.json({ admin });
    });

    // GET All Products
    app.get('/products', async (req, res) => {
      const cursor = productsCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    app.post('/orders', async (req, res) => {
      const bike = req.body;
      const result = await bikesCollection.insertOne(bike);
      res.json(result);
    });

    // GET a Single Bike
    app.get('/bikes/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bikesCollection.findOne(query);
      res.json(result);
    });

    // GET All Orders of a Specific USer
    app.get('/orders', async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });

    // POST Orders
    app.post('/orders', async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });

    // Delete Order
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    // GET All Reviews
    app.get('/reviews', async (req, res) => {
      const cursor = reviewsCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    // POST Review
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.json(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Sneakers Server');
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
