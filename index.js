const express = require('express');
const app = express();
const url = 'https://joyboxapp.000webhost.com/';
const axios = require('axios');
const CircularJSON = require('circular-json');
function player(sid,id) {
  this.sid = sid;
  this.id = id;
}
var players = [];

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'),() =>{
  console.log("servidor se corre en puerto ",app.get('port'));
});


const SocketIO = require('socket.io');
const io = SocketIO(server);

io.on('connection',(socket)=>{
  console.log('Deconocido con '+socket.id+' saluda al server');
  socket.on('registro', (data) => {
    axios.post("https://joyboxapp.000webhostapp.com/nuevoUsuario.php", data)
    .then(response => {
      io.to(socket.id).emit('registro', response.data);
    })
    .catch(error => {
      io.to(socket.id).emit('registro', JSON.stringify({exito : false}));
      console.log(error);
    });
  });
  socket.on('login', (data) => {
    axios.post("https://joyboxapp.000webhostapp.com/login.php", data)
    .then(response => {
      var val = response.data;
      if(val.id){
        players.push(new player(socket.id,val.id))
        io.to(socket.id).emit('login', JSON.stringify({nombre:val.nombre}));
      }else{
        io.to(socket.id).emit('login', JSON.stringify({exito:false}));
      }
    })
    .catch(error => {
      io.to(socket.id).emit('login', JSON.stringify({exito : false}));
      console.log(error);
    });
  });
});

function djson(jsond){
  return JSON.parse(jsond.split("[")[1].split("]")[0])
}
