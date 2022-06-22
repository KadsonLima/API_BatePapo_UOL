import express from 'express';
import chalk from 'chalk';
import cors from 'cors';
import {MongoClient} from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const log = console.log;
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect().then(()=>{
   db = mongoClient.db("participants");
});

const server = express();
server.use(cors(), express.json())

server.get('/participants', (req, res)=>{
   res.send({alou:'pika'});
})

server.post('/participants', (req, res)=>{
   const { name } = req.body;
   if(!name){
      res.status(422).send("Preencha o campo Name!");
      return;
   }

   db.collection("participants").insertOne({name});
   res.status(201).send("OK");
   return;

})

server.get('/vida', (req, res)=>{
   db.collection("participants").find().toArray().then(e =>{
      res.send(e);
   });
})

server.listen(5000, ()=>{
   log( chalk.bold.green("Servidor Rodando!"));
})