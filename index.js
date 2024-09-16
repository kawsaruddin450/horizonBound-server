const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`HorizonBound Server is running at: ${port}`);
})



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.acntg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const courses = client.db("HorizonDB").collection("courses");
        const instructors = client.db("HorizonDB").collection("instructors");
        const users = client.db("HorizonDB").collection("users");

        //get all courses
        app.get('/courses', async (req, res) => {
            const result = await courses.find().toArray();
            res.send(result);
        })

        //get courses categorically
        app.get('/courses/:category', async (req, res) => {
            const category = req.params.category;
            if (category === "all") {
                const result = await courses.find().toArray();
                res.send(result);
            }
            else {
                const query = { category: category };
                const result = await courses.find(query).toArray();
                res.send(result);
            }
        })

        //get courses by instructor
        app.get('/courses/:instructor', async(req, res) => {
            const instructor = req.params.instructor;
            const query = {instructor: instructor};
            const result = await courses.find(query).toArray();
            res.send(result);
        })

        //get instructors
        app.get('/instructors', async(req, res)=> {
            const result = await instructors.find().toArray();
            res.send(result);
        })

        //post users
        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await users.insertOne(user);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log("Camp HorizonBound Server is running at:", port);
})