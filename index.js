const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const cors = require('cors');

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`HorizonBound Server is running at: ${port}`);
})

const verifyJwt = (req, res, next) => {
    const authorization = req.headers.authorization;
    if(!authorization){
        return res.status(401).send({error: true, message: "Unauthorized Access!"})
    }
    const token = authorization.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
            return res.send(401).send({error: true, message: "Unauthorized Access"})
        }
        req.decoded = decoded;
        next();
    })
}


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const selected = client.db("HorizonDB").collection("selectedCourses");

        //create jwt 
        app.post('/jwt/', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
            res.send({token});
        })

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
        app.get('/coursesby/', async(req, res)=> {
            const query = {instructor_email: req.query.email}
            const result = await courses.find(query).toArray();
            res.send(result);
        })

        // add courses to selected list (before payment, primary selection. Just like cart)
        app.post('/courses', async(req, res)=> {
            const course = req.body;
            const result = await selected.insertOne(course);
            res.send(result);
        })

        //get instructors
        app.get('/instructors', async(req, res)=> {
            const result = await instructors.find().toArray();
            res.send(result);
        })


        //get selected courses for logged in user
        app.get('/selected/', verifyJwt, async(req, res) => {
            const email = req.query?.email;
            let query = {};

            if(!email){
                return res.send([]);
            }
            if(req.decoded.email !== email){
                return res.status(403).send({error: true, message: "Forbidden access"});
            }
            if(email){
                query = {email: email};
                const result = await selected.find(query).toArray();
                res.send(result);
            }
        })

        //delete one selected course using id
        app.delete('/selected/:id', verifyJwt, async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await selected.deleteOne(query);
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