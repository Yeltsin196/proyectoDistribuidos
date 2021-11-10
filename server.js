// server.js
var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);
var cluster = require('cluster');
var crypto = require('crypto');
var numCPUs = require('os').cpus().length;
const pid = process.pid;
var index = 0;
let discEvent = "conexión finalizada"

app.use(express.static(__dirname + '/public'));
//redirect / to our index.html file
app.get('/', function (req, res, next) {
  res.sendFile(__dirname + '/public/index.html');
});


//start our web server and socket.io server listening
if (cluster.isMaster) {
  console.log(`El proceso principal ${pid} se está ejecutando`);

  // Proceso de trabajo derivado.
  for (let i = 0; i < numCPUs; i++) {

    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`el proceso de trabajo ${pid} ha salido`);
  });
} else {
  server.listen(3000, function () {
    console.log('listening on *:3000');

  });
}

/* io.on('connection', function (client) {
  index++;
  console.log("new connection");
 
  io.emit('user', index);
  io.on('disconnect', () => {
    console.log("desconection");

  });
});
 */

io.on("connection", socket => {
  index++;
  socket.emit("new user", { message: "Ha entrado un usuario al Chat", index: index })

  socket.on("number", (data) => {

    socket.emit('INFO', { numeros: fibonacci(data.numero) });
  })

  socket.on("disconnect", () => {
    socket.broadcast.emit("disconnect user", index--);
  })

})

function fibonacci(numero) {
  let numeros = [2, 1];

  for (let i = 2; i < numero; i++) {




    numeros[i] = numeros[i - 2] + numeros[i - 1];

  }


  return numeros;
}
