const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.POR || 5000;

app.use(cors());
app.use(express.json());

require('dotenv').config()
console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.p3bhfgf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run = async () => {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db('BDtour').collection("services");
        const db1 = client.db('BDtour').collection("Reviews");

        //get data from users
        app.get('/services', async(req, res) => {
            const query = {};
            const cursor = db.find(query);
            const services = await cursor.toArray();
            res.send(services);
            //console.log(services)
        });
        // get specific service details  
        app.get('/services/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const service = await db.findOne(query);
            res.send(service);
        });
        // get specific service reviews  
        app.get('/reviews', async(req, res) => {
            //console.log(req.query);
            let query = {};
            if(req.query.serviceId){
                query = {
                    serviceId: req.query.serviceId
                }
            }
            const cursor = db1.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        app.get('/user_reviews', async(req, res) => {
            console.log(req.query)
            let query = {};
            if(req.query.email){
                query = {
                    user_email: req.query.email
                }
            }
            const cursor = db1.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        //post method on the server                                                                                                                                                           
        app.post('/services', async(req, res) => {
            const service = req.body;
            // Insert a single document, wait for promise so we can read it back
            const result = await db.insertOne(service);
            res.send(result);
        });
        app.post('/reviews', async(req, res) => {
            const service = req.body;
            // Insert a single document, wait for promise so we can read it back
            const result = await db1.insertOne(service);
            res.send(result);
        });
        //update user
        app.get('/reviews/:id', async(req, res) =>{
            const id = req.params.id
            const query = {_id: ObjectId(id)};
            const user = await db1.findOne(query);
            res.send(user);
        })
        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const user = req.body;
            console.log("what come");
            console.log(user.review);
            const option = {upsert: true};
            const updatedUser = {
                $set: {
                    review_text: user.review,
                }
            }
            const result = await db1.updateOne(filter, updatedUser, option);
            res.send(result);
        })

        //delete review
        app.delete('/reviews/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await db1.deleteOne(query);
            console.log(result);
            res.send(result);
        })
    } catch (err) {
        console.log(err.stack);
    }

    finally {
        //await client.close();
    }
}

run().catch(error => console.log(error))







app.get('/', (req, res) => {
    res.send('Hello Server is running');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})