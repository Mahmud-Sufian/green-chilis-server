const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const admin = require("firebase-admin");
require('dotenv').config();


 

const app = express();
app.use(bodyParser.json());
app.use(cors());





var serviceAccount = require("./configs/green-chilis-client-firebase-adminsdk-rg1dm-d0d312c7d6.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.malwn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });





app.get('/', (req, res) => {
  res.send('Hello World!')
})



client.connect(err => { 
    const collection = client.db("greenChilis").collection("items");
    const breakfastCollection = client.db("greenChilis").collection("breakfast");
    const lunchCollection = client.db("greenChilis").collection("lunch");
    const dinnerCollection = client.db("greenChilis").collection("dinner");
    const orderCollection = client.db("greenChilis").collection("order");


    


    // all and single breakfast get-----
    app.get('/getBreakfast', (req, res) => {
        breakfastCollection.find({})
        .toArray( (err, document) => {
            res.send(document);
        })
    })


    app.get('/getSingleBreakfast/:id', (req, res) => {
        breakfastCollection.find({_id: ObjectID(req.params.id)})
        .toArray( (err, document) => {
            res.send(document[0]);
        })
    })


    // all and single lunch get-----
    app.get('/getLunch', (req, res) => {
        lunchCollection.find({})
        .toArray( (err, document) => {
            res.send(document);
        })
    })


    app.get('/getSingleLunch/:id', (req, res) => {
        lunchCollection.find({_id: ObjectID(req.params.id)})
        .toArray( (err, document) => {
            res.send(document[0]);
        })
    })


    // all and single dinner get-----
    app.get('/getDinner', (req, res) => {
        dinnerCollection.find({})
        .toArray( (err, document) => {
            res.send(document);
        })
    })

    app.get('/getSingleDinner/:id', (req, res) => {
        dinnerCollection.find({_id: ObjectID(req.params.id)})
        .toArray( (err, document) => {
            res.send(document[0]);
        })
    })



    // post and get order item-----------
    app.post('/addOrderItem', (req, res) => {
        orderCollection.insertOne(req.body)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })



    app.get('/getOrderItem', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('bearer')) {
            const idToken = bearer.split(' ')[1];
        
          admin.auth().verifyIdToken(idToken)
            .then((decodedToken) => {
              const tokenEmail = decodedToken.email;
              const queryEmail = req.query.email;
             
              if(tokenEmail == queryEmail){
                orderCollection.find({email: queryEmail})
                  .toArray( (err, document) => {
                  res.send(document);
                })
              }
              else{
                res.status(401).send('un authrized access')
              }
              
            })
            .catch((error) => {
              // Handle error
            });
        }
        else{
          res.status(401).send('un authrized access')
        }
      })
 

 
});



app.listen(process.env.PORT || 5050, () => console.log('this port is running'))