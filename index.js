const express = require('express');
const app = express();
const url = 'https://joyboxapp.000webhost.com/';
const axios = require('axios');
const CircularJSON = require('circular-json');
function player(sid, id) {
  this.sid = sid;
  this.id = id;
  
}
function partida(id, info) {
  this.id = id;
  this.info = info;
}
//function flappy(nombre,puntos,)
var players = [];
var partidas = [];
var ars = [];

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), () => {
  console.log("servidor se corre en puerto ", app.get('port'));
});


const SocketIO = require('socket.io');
const io = SocketIO(server);

io.on('connection', (socket) => {
  console.log('Deconocido con ' + socket.id + ' saluda al server');
  socket.on('registro', (data) => {
    axios.post("https://joyboxapp.000webhostapp.com/nuevoUsuario.php", data)
      .then(response => {
        io.to(socket.id).emit('registro', response.data);
      })
      .catch(error => {
        io.to(socket.id).emit('registro', { exito: false });
        console.log(error);
      });
  });
  socket.on('login', (data) => {
    axios.post("https://joyboxapp.000webhostapp.com/login.php", data)
      .then(response => {
        var val = response.data;
        if (val.id) {
          var ar = [];
          players.push(new player(socket.id, val.id))
          var cont = 0;
          for (var i = 0; i < val.amigos.length; i++) {
            ar.push(val.amigos[i].id_amigo);
            ar.push(val.amigos[i].nombre);
            ar.push("defecto")
            for (var j = 0; j < players.length; j++) {
              if (players[j].id == val.amigos[i].id_amigo) {
                cont++;
              }
            }
          }
          if (cont == 0) {
            io.to(socket.id).emit('camigos', ar);
          }
          else {
            ar.push(cont);
            ar.push(val.id);
            ars.push(ar);
            for (var i = 0; i < val.amigos.length; i++) {
              for (var j = 0; j < players.length; j++) {
                if (players[j].id == val.amigos[i].id_amigo) {
                  var envio = [val.id, players[j].id];
                  io.to(players[j].sid).emit("inicioJuego", envio);
                }
              }
            }
          }
          io.to(socket.id).emit('login', { nombre: val.nombre });
        } else {
          io.to(socket.id).emit('login', { exito: false });
        }
      })
      .catch(error => {
        io.to(socket.id).emit('login', { exito: false });
        console.log(error);
      });
  });
});

function djson(jsond) {
  return JSON.parse(jsond.split("[")[1].split("]")[0])
}
