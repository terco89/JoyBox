const express = require('express');
const app = express();
const url = 'https://joyboxapp.000webhost.com/';
const axios = require('axios');
const CircularJSON = require('circular-json');
function player(sid, id) {
  this.sid = sid;
  this.id = id;
  
}
function partida(id, juego) {
  this.id = id;
  this.juego = juego;
  this.espectadores = [];
  /*this.rpuntos = 0;
  this.inicio = false;
  this.colsy = [0,0,0,0,0];
  this.colsx = [-14,-14,-14,-14,-14];
  this.cols
  this.pcols = 0;
  this.icols = false;
  this.bgs = [-0.03,20.41];
  this.bg = 0;*/
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
    axios.post("https://joyboxapp.000webhostapp.com/nuevoUsuario.php", {datos:data})
      .then(response => {
        io.to(socket.id).emit('registro', response.data);
      })
      .catch(error => {
        io.to(socket.id).emit('registro', { exito: false });
        console.log(error);
      });
  });
  socket.on('login', (data) => {
    axios.post("https://joyboxapp.000webhostapp.com/login.php", {datos:data})
      .then(response => {
        var val = response.data;
        if (val.id) {
          var ar = [];
          players.push(new player(socket.id, val.id))
          for (var i = 0; i < val.amigos.length; i++) {
            var ban = true;
            ar.push(val.amigos[i].id_amigo);
            ar.push(val.amigos[i].nombre);
            for(var j = 0; j < partidas.length; j++){
              if(partidas[j].id == val.amigos[i].id_amigo){
                ar.push(partidas[j].juego)
                ban = false;
                break;
              }
            }
            if(ban){
              ar.push("defecto")
            }
          }
          io.to(socket.id).emit('camigos', ar);
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
  socket.on('mensajes', (data) => {
    axios.post("https://joyboxapp.000webhostapp.com/traerMensajes.php", JSON.stringify({id:buscarid(socket.id),id_amigo:JSON.parse(data).id}))
      .then(response => {
        if(response.data.mensajes){
          var envio = [];
          var msgs = response.data.mensajes
          for(var i = 0; i < msgs.length; i++){
            envio.push(msgs[i].usuario_id)
            envio.push(msgs[i].mensaje)
          }
          io.to(socket.id).emit("losMensajes",envio);
        }
      })
      .catch(error => {
        console.log(error);
      });
  });
  socket.on('mandar', (data) => {
    var datos = JSON.parse(data);
    axios.post("https://joyboxapp.000webhostapp.com/insertarMensaje.php", {id:buscarid(socket.id),amigo_id:datos.id,mensaje:datos.msg})
      .then(response => {
        if(response.data.exito){
          var sid = buscarsid(datos.id)
          if(sid){
            io.to(sid).emit("nuevoMensaje",{id:buscarid(socket.id),msg:datos.msg});
          }
          io.to(socket.id).emit("mensajeEnviado",{exito:true});
        }
      })
      .catch(error => {
        console.log(error);
      });
  });
  socket.on('esteJuego', (data) => {
    var juego = JSON.parse(data).juego;
    var id = buscarid(socket.id);
    partidas.push(new partida(id,juego));
    axios.post("https://joyboxapp.000webhostapp.com/traerAmigos.php", JSON.stringify({id:id}))
      .then(response => {
        var val = response.data;
        for(var i = 0; i < players.length; i++){
          for(var j = 0; j < val.amigos.length; j++){
            if(players[i].id == val.amigos[j].id_amigo){
              io.emit("partidaAmigo",{id_amigo:id,juego:juego});
            }
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  });
  socket.on('fPuntos', (data) => {
    var id = buscarid(socket.id);
    axios.post("https://joyboxapp.000webhostapp.com/puntosFlappy.php", JSON.stringify({id:id}))
      .then(response => {
        io.to(socket.id).emit("fPuntos",{puntos : response.data.puntaje})
      })
      .catch(error => {
        console.log(error);
      });
  });
  socket.on('faPuntos', (data) => {
    var id = buscarid(socket.id);
    axios.post("https://joyboxapp.000webhostapp.com/actualizarFlappy.php", JSON.stringify({id:id,puntos:JSON.parse(data).puntos}))
      .then(response => {
      })
      .catch(error => {
        console.log(error);
      });
  });
  socket.on('finicio', (data) => {
    enviarEsp(socket.id,"finicio",{exito:true})
  });
  socket.on('ffinal', (data) => {
    
  });
  socket.on('ficols', (data) => {
    
  });
  socket.on('fflap', (data) => {
    enviarEsp(socket.id,"impulso",{exito:true})
  });
  socket.on('fcols', (data) => {
    /*var pid = buscarPartida(buscarid(socket.id));
    partidas[pid].colsy[partida.pcols] = JSON.parse(data).y
    partidas[pid].colsx[partida.pcols] = JSON.parse(data).x
    partidas[pid].pcols++
    if(partidas[pid].pcols == 5){
      partidas[pid].pcols = 0;
    }*/
    var datos = JSON.parse(data)
    enviarEsp(socket.id,"fcols",{y:datos.y,pos:datos.pos})
  });
  socket.on('fbg', (data) => {
    var pid = buscarPartida(buscarid(socket.id));
    partidas[pid].bgs[partidas[pid].bg] = JSON.parse(data).x;
    if(partidas[pid].bg == 0){
      partidas[pid].bg = 1;
    }
    else{
      partidas[pid].bg = 0;
    }
  });
  socket.on('fentro', (data) => {
    partidas[buscarPartida(JSON.parse(data).id)].espectadores.push(buscarid(socket.id));
  });
});

function enviarEsp(id,evento,valores){
  var pid = buscarPartida(buscarid(id));
  for(var i =0; i < partidas[pid].espectadores.length;i++){
    io.to(buscarsid(partidas[pid].espectadores[i])).emit(evento,{valores});
  }
}

function buscarid(sid){
  for(var i = 0; i < players.length;i++){
    if(players[i].sid == sid){
      return players[i].id;
    }
  }
}

function buscarsid(id){
  for(var i = 0; i < players.length;i++){
    if(players[i].id == id){
      return players[i].sid;
    }
  }
}

function buscarPartida(id){
  for(var i = 0; i < partidas.length; i++){
    if(partidas[i].id == id){
      return i;
    }
  }
}