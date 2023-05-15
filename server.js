const express= require('express');
const bodyparser= require('body-parser');
const bcrypt= require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')


const db =knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      database : 'face_scanner'
    }

});

    

const app=express();

app.use(bodyparser.json());
app.use(cors());



app.get('/', (req,res)=>{
    res.send(database.users);
})

app.post('/signin',(req,res)=>{

    db.select('email','hash').from('login')
    
     .where('email', '=', req.body.email)
     .then(data=> {
      const isValid=  bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid){
       return db.select('*').from('users')
         .where('email','=', req.body.email)
         .then(user=>{
            res.json(user[0])
         })
      } else{
        res.json('wrong credentials!')
      }
    })
    .catch(err=> res.status(400).json('wrong credentials!'))
   
})

app.post('/register',(req,res)=>{
    const {name , email ,password } =req.body
    const hash=bcrypt.hashSync(password);

    db.transaction(trx =>{
        trx.insert({
            hash:hash,
            email:email
        })
        .into('login')
        .returning('email')
        .then(loginEmail=>{
           return trx('users') 
            .returning('*')
            .insert({
                email: email,
                name: name,
                joined: new Date()
            }).then(user=>{
                res.json(user[0]);
            })

        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err=> res.status(400).json('unable to register'))
    
})

app.get('/profilee/:id',(req,res)=>{
    const {id}=req.params;
    db.select('*').from('users').where({id})
    .then(user=>{
        if (user.length){
            res.json(user[0])
        } else{
            res.status(400).json('not found')
        }
    })
    .catch(err => res.status(400).json('errorr!'))
})  


app.put('/image',(req,res)=>{
    const {id}=req.body;
    db('users').where('id','=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries =>{
        res.json(entries[0])
    })
    .catch(err => res.status(400).json('error getting entries!'))

})


// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });


app.listen(3001, ()=>{
    console.log('working')
})

// 
