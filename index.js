const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000
require('dotenv').config();

//middleware
app.use(cors());
app.use(express.json())
console.log('hello',process.env.ACCESS_SECRET_TOKEN)
//  const accessToken = 'cc6236534b10614492b969322fcdb56818742f720d047a8bd3106230bc7018e38853698b2f34c044d09d085e3b08853d16ea57a7890e84337f246459d3df475e'
//  console.log(accessToken)
const verifyJwt = (req, res, next) =>{
  const authorization = req.headers.authorization;

  if(!authorization){
   return res.status(401).send({ error : true, message : "unauthorized access" })
  }

  const token = authorization.split(' ')[1];
 
  

  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
   if(err){
     return res.status(401).send({ error : true, message : "unauthorized access" })
   }

   req.decoded = decoded;
   next();
  })
}

//maa-computer
//gSDTM02xhfByBfS9


const uri = "mongodb+srv://maa-computer:gSDTM02xhfByBfS9@cluster0.lek3e6k.mongodb.net/?retryWrites=true&w=majority";

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
    // Send a ping to confirm a successful connection


    const userCollections = client.db('maa-computer').collection('users');
    const courseCollections = client.db('maa-computer').collection('courses')
    const notificationCollections = client.db('maa-computer').collection('notice')
    const publishAssignmentCollections = client.db('maa-computer').collection('publish-assignment');
    const bookmarkCourseCollections = client.db('maa-computer').collection('bookmark-courses');
    const ratingCollections = client.db('maa-computer').collection('rating');
    const submitAssignmentCollections = client.db('maa-computer').collection('submit-assignment');
    const paymentCollections = client.db('maa-computer').collection('payment');
    const feedbackCollections = client.db('maa-computer').collection('feedback');
    const allStudentCollections = client.db('maa-computer').collection('all-students');
    const classCollections = client.db('maa-computer').collection('all-classes');
    const problemCollections = client.db('maa-computer').collection('all-problems');

    app.post('/jwt', (req, res) =>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: '1h' });
      res.send({token})
    })

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = {email : email};
      const user = await userCollections.findOne(query);
 
      if(user?.role !== 'admin'){
        res.status(403).send({error : true, message : 'forbidden user'})
      }

      next();
    }

    //user related api:

    app.get('/users', verifyJwt, async(req, res)=>{
      const result = await userCollections.find().toArray();
      res.send(result)
    })

    app.post('/users', async(req, res) =>{
      const user = req.body;
      const query = {email : user.email}
      const existingUser = await userCollections.findOne(query);
      if(existingUser){
        return res.send({message : 'user already exist'})
      }
      const result = await userCollections.insertOne(user);
      res.send(result)
    })

    app.get('/users/:email', async(req, res) =>{
      const email = req.params.email;

      const query = {email : email};
      const result = await userCollections.findOne(query);
      res.send(result);
    })

    app.put('/users/:email', async(req, res) =>{
      const email = req.params.email;
       const totalmark = req.body;

       const filter = {email : email}
      const updateDoc = {
        $set: {
          totalmark: totalmark
        },
    }
    const result = await userCollections.updateOne(filter, updateDoc);
    res.send(result)
  })

    app.put('/users/role/:email', async(req, res) =>{
      const email = req.params.email;
       const courseName = req.body;

       const filter = {email : email}
      const updateDoc = {
        $set: {
          courseName: courseName
        },
    }
    const result = await userCollections.updateOne(filter, updateDoc);
    res.send(result)
  })

    app.get('/users/admin/:email', verifyJwt, async(req, res) =>{
      const email = req.params.email;
      const decodedEmail = req.decoded.email;

      if(decodedEmail !== email){
        res.send({admin : false})
      }

      const query = { email : email }
      const user = await userCollections.findOne(query);

      if(user?.role === 'admin'){
        const result = {admin: 'true'}
        res.send(result);
      }
      
    })

    app.patch('/users/admin/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = { _id : new ObjectId(id) };
      const updateDoc = {
        $set : {
          role : 'admin'
        },
      }

      const result = await userCollections.updateOne(filter, updateDoc)
      res.send(result)
    })

    app.patch('/users/student/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = { _id : new ObjectId(id) };
      const updateDoc = {
        $set : {
          role : 'student'
        },
      }

      const result = await userCollections.updateOne(filter, updateDoc)
      res.send(result)
    })

    app.get('/users/student/:email',verifyJwt, async(req, res) =>{
      const email = req.params.email;

      const query = { email : email }
      const user = await userCollections.findOne(query);

      const result = {admin : user?.role === 'student'};
      res.send(result)
    })


    app.delete('/users/:id', async(req, res) =>{
      const id = req.params.id;
      const query = { _id : new ObjectId(id) }

      const result = await userCollections.deleteOne(query)
      res.send(result)
    })

    app.get('/users/leader', async(req, res) =>{
      const result = await userCollections.find().toArray();
      res.send(result)
    })

    //Courses Related API:

    app.get('/courses', async(req, res) =>{
      const result = await courseCollections.find().toArray();
      res.send(result)
    })

    app.post('/courses', async(req, res) =>{
      const course = req.body;
      const result = await courseCollections.insertOne(course);
      res.send(result)
    })

    app.delete('/courses/:id', async(req, res) =>{
      const id = req.params.id;
      const query = { _id : new ObjectId(id) }

      const result = await courseCollections.deleteOne(query)
      res.send(result)
    })

    //bookmark courses
    app.post('/bookmark', async(req, res) =>{
      const bookmark = req.body;
      const result = await bookmarkCourseCollections.insertOne(bookmark);
      res.send(result)
    })

    app.get('/bookmark', async(req, res) =>{
      const result = await bookmarkCourseCollections.find().toArray();
      res.send(result)
    })

    app.get('/bookmark/:email', async(req, res) =>{
      const email = req.params.email;

      const query = {email : email}

      const result = await bookmarkCourseCollections.find(query).toArray();
      res.send(result);
    })

    app.get('/bookmark/payment/:id', async(req, res) =>{
      const id = req.params.id;

      const query = {_id : new ObjectId(id)}

      const result = await bookmarkCourseCollections.findOne(query);
      res.send(result);
    })

    // app.get('/bookmark/course/:id', async(req, res) =>{
    //   const id = req.params.id;

    //   const query = {courseId : id}

    //   const result = await bookmarkCourseCollections.findOne(query);
    //   res.send(result);

    // })

    app.delete('/bookmark/confirm/:id', async(req, res) =>{
      const id = req.params.id;

      const query = { _id : new ObjectId(id) }

      const result = await bookmarkCourseCollections.deleteOne(query);
      res.send(result)
    });

    //Notice Related API

    app.post('/notice', async(req, res) =>{
      const notice = req.body;
      const result = await notificationCollections.insertOne(notice);
      res.send(result)
    })

    app.get('/notice', async(req, res) =>{
      const result = await notificationCollections.find().toArray();
      res.send(result);
    })

    //Assignment Related API

    app.get('/publish-assignment', async(req, res) =>{
      const result = await publishAssignmentCollections.find().toArray();
      res.send(result)
    })

    app.post('/publish-assignment', async(req, res) =>{
      const newAssignment = req.body;
      const result = await publishAssignmentCollections.insertOne(newAssignment);
      res.send(result)
    })

    app.put('/publish-assignment/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}

      const result = await publishAssignmentCollections.findOne(query);
      res.send(result);
    })

    app.post('/submit-assignment', async(req, res) =>{
      const submitAssignment = req.body;
      const result = await submitAssignmentCollections.insertOne(submitAssignment);
      res.send(result)
    })

    app.get('/submit-assignment', async(req, res) =>{
      const result = await submitAssignmentCollections.find().toArray();
      res.send(result);
    })

     app.put('/submit-assignment/:id', async(req, res) =>{
      const id = req.params.id;

      const filter = {_id : new ObjectId(id)};

     const updateDoc = {
       $set: {
         marking: true
       },
     };

     const result = await submitAssignmentCollections.updateOne(filter, updateDoc);
     res.send(result)
   })

    app.get('/submit-assignment/mark/:email', async(req, res) =>{
        const email = req.params.email;
  
        const query = {email : email}
  
        const result = await submitAssignmentCollections.find(query).toArray();
        res.send(result);
  
      })

    //Rating Related API
    app.post('/rating', async(req, res) =>{
      const newRating = req.body;
      const result = await ratingCollections.insertOne(newRating);
      res.send(result);
    })

    app.get('/rating', async(req, res) =>{
      const result = await ratingCollections.find().toArray();
      res.send(result)
    });

    //Payment Related API

    app.post('/payment', async(req, res) =>{
      const newPayment = req.body;
      const result = await paymentCollections.insertOne(newPayment);
      res.send(result);
    })

    app.get('/payment', async(req, res) =>{
      const result = await paymentCollections.find().sort({date: -1}).toArray();
      res.send(result)
    })

    app.get('/payment/:email', async(req, res) =>{
      const email = req.params.email;

      const query = {userEmail : email}

      const result = await paymentCollections.find(query).toArray();
      res.send(result);
    })

     app.put('/payment/verify/:id', async(req, res) =>{
      const id = req.params.id;

      const filter = {_id : new ObjectId(id)};
     const updateDoc = {
       $set: {
         status: 'verified'
       },
     };

     const result = await paymentCollections.updateOne(filter, updateDoc);
     res.send(result)
   })

   //Feedback Related API

   app.post('/feedback', async(req, res) =>{
    const feedback = req.body;
    const result = await feedbackCollections.insertOne(feedback);
    res.send(result)
   });

   app.get('/feedback', async(req, res) =>{
    const result = await feedbackCollections.find().toArray();
    res.send(result);
   })

   app.get('/feedback/:email', async(req, res) =>{
    const email = req.params.email;
    const query = {email : email};

    const result = await feedbackCollections.find(query).toArray();
    res.send(result);
   })

   //all-student related api
   app.get('/all-students', async(req, res)=>{
    const result = await allStudentCollections.find().toArray();
    res.send(result);
   })

   //class related api
  //  app.put('/class-control', async(req, res) =>{
  //   const classes = req.body;
  //   const result = await classCollections.insertOne(classes);
  //   res.send(result)
  // })
  app.put('/class-control', async(req, res) =>{
    // const email = req.params.email;
     const body = req.body;
    console.log(body);
     const filter = {classes : body.id}
    const updateDoc = {
      $set: {
        status: body.status
      },
  }
  const result = await classCollections.updateOne(filter, updateDoc);
  res.send(result)
})

  app.get('/class-control', async(req, res) =>{
    const result = await classCollections.find().toArray();
    res.send(result);
  });

  //report problem related api

  app.post('/problem', async(req, res) =>{
    const problem = req.body;

    const result = await problemCollections.insertOne(problem);
    res.send(result);
  });

  app.get('/problem', async(req, res) =>{
    const result = await problemCollections.find().toArray();
    res.send(result);
  })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res)=>{
    res.send('MAA COMPUTER is running')
})

app.listen(port,()=>{
   console.log(`MA COMPUTER is running on ${port}`)
})