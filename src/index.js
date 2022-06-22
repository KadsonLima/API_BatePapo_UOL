import express from 'express';
import chalk from 'chalk';
import cors from 'cors';
import {MongoClient} from 'mongodb';
import dotenv from 'dotenv';
import {schema} from './schemas/joi.js';
import {horarioAgora} from './utils/day.js';


dotenv.config();

const log = console.log;
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db, dbmsg;


mongoClient.connect().then(()=>{
   db = mongoClient.db("users");
   dbmsg = mongoClient.db("msg");
});

const server = express();
server.use(cors(), express.json())


server.post('/participants', (req, res)=>{
   const {name} = req.body;
   const result =  schema.validate(req.body);
   if(result.error){
      res.status(422).send(result);
      return;
   }
    
   let user = {name, lastStatus: Date.now()}
   db.collection("users").insertOne(user);
   db.collection("msg").insertOne({name, to:'Todos', text:'entra na sala...', type:'status', time:horarioAgora()});
   res.status(201).send("OK");
   return;

})

server.get('/participants', (req, res)=>{
   db.collection("users").find().toArray().then(e =>{
      res.send(e);
   });
})

server.get('/messages', (req, res)=>{
   db.collection("msg").find().toArray().then(e =>{
      res.send(e);
   });
})

server.post('/messages', (req, res)=>{
   const {to, text ,type} = req.body
   const name = req.header('User')
   log(name)
   db.collection("msg").insertOne({name, to, text, type, time:horarioAgora()});

})

server.listen(5000, ()=>{
   log( chalk.bold.yellow("Servidor Rodando!"));
})