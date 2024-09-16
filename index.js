const express = require('express');
const app = express();
const cors = require('cors');

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res)=> {
    res.send(`HorizonBound Server is running at: ${port}`);
})


app.listen(port, ()=> {
    console.log("Camp HorizonBound Server is running at:", port);
})