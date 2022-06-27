import express from 'express';
import chalk from 'chalk';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { schema } from './schemas/joi.js';
import { horarioAgora } from './utils/day.js';
import { messagePrivate } from './utils/messagePrivate.js';


dotenv.config();

const log = console.log;
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db, dbmsg;


mongoClient.connect().then(() => {
   db = mongoClient.db("users");
   dbmsg = mongoClient.db("msg");
});

const server = express();
server.use(cors(), express.json())


server.post('/participants', async (req, res) => {
   const { name } = req.body;
   const result = schema.validate(req.body);
   const listaUsuarios = await db.collection("users").findOne({name:name});
   if(listaUsuarios !== null){
      res.status(404).send("Já EXISTE");
      return;
   }
   if (result.error ) {
      res.status(422).send(result);
      return;
   }

   let user = { name, lastStatus: Date.now() }
   await db.collection("users").insertOne(user);
   await db.collection("msg").insertOne({ from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: horarioAgora() });
   res.status(201).send("OK");
   return;

})

server.get('/participants', async (req, res) => {
   try {
      const result = await db.collection("users").find().toArray();
      res.send(result);
   } catch (error) {
      log(error)
   }


})

server.get('/messages', async (req, res) => {
   try {
      const usuario = await req.headers.user;
      const { limit } = req.query;
      const result = await db.collection("msg").find().toArray();
      let mensagems = messagePrivate(result, usuario, limit)
      res.send(mensagems)
   } catch (error) {
      log(error)
   }
})

server.post('/messages', (req, res) => {
   const { to, text, type } = req.body;
   const name = req.header('User');
   db.collection("msg").insertOne({ from: name, to, text, type, time: horarioAgora() });

})

server.post('/status', async (req, res) => {
   const { user } = req.headers;
   try {
      const resultado = await db.collection("users").find().toArray();
      await db.collection("users").updateOne({ name: user }, { $set: { lastStatus: Date.now() } });
      res.status(200)
   } catch (error) {
      log("last", error)
      res.status(404)
   }
})


const CHECK_INATIVE = 15000;

setInterval(async () => {
   const resultado = await db.collection("users").find().toArray();
   resultado.forEach(async e => {
      let diferença = parseInt(Date.now() - e.lastStatus) / 1000;
      if (diferença.toFixed(0) > 10) {
         try {
            await db.collection("users").deleteOne({ name: e.name });
            await db.collection("msg").insertOne({ from: e.name, to: 'Todos', text: 'sai da sala...', type: 'status', time: horarioAgora() });
            
         } catch (error) {
            log("Error", error)
         }

      }
   })
}, CHECK_INATIVE);

server.delete('/messages/:id', async (req, res) => {
   try {
      const usuario = await req.headers.user;
      const idMensagem = req.params.id
      const verificaUser = await db.collection("msg").findOne({"_id" : ObjectId(idMensagem)});
      log(verificaUser.from, usuario)
      if(usuario == verificaUser.from){
         log("excluida")
         await db.collection("msg").deleteOne({"_id" : ObjectId(idMensagem)});
         res.status(200);
         return;
      }
      res.status(404);

   } catch (error) {
      log("erro ao apagar", error)
   }
})

server.listen(5000, () => {
   log(chalk.bold.yellow("Servidor Rodando!"));
})