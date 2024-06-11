// const path = require("path");
// const net = require("net");
// const http = require("http");
// const fastify = require("fastify")({
//   logger: false,
// });

// fastify.get("/", function (request, reply) {
//   reply.code(200).send({ hello: '200' })
// });

// fastify.listen(
//   { port: process.env.PORT||3000, host: "0.0.0.0" },
//   function (err, address) {
//     if (err) {
//       console.error(err);
//       process.exit(1);
//     }
//     console.log(`Your app is listening on ${address}`);
//   }
// );

const express = require('express');
const proxy = require('express-http-proxy');

const app = express();

let URL = 'http://trail-grove-frown.glitch.me'

app.use('/glitch', proxy(URL));

app.get('/', ((req, res) => {
  res.send('Forbidden!')
}));

app.listen(3000, ()=> { console.log('Your app is listening on 3000') })