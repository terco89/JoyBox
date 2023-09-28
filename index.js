const express = require('express');
const app = express();
const fs = require('fs');
const url = 'https://joyboxapp.000webhost.com/';
const axios = require('axios');
const CircularJSON = require('circular-json');


const { Pool } = require('pg');

// Configura los datos de acceso a la base de datos
/*const pool = new Pool({
  user: 'elpromaster',
  host: 'ccc.oregon-postgres.render.com', // o la dirección del servidor de la base de datos
  database: 'a_r3e5',
  password: 'Y7VaAPh7GilxiHrMTF3M8hiLiEymvRKB',
  port: 5432, // Puerto por defecto de PostgreSQL,
  ssl: true
});*/

const pool = new Pool({
  user: 'postgres',
  database: 'JoyBox',
  password: 'karateca2',
  port: 5432
});

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
  //console.log('Deconocido con ' + socket.id + ' saluda al server');
  io.to(socket.id).emit("inicio", []);
  socket.on("disconnect", (data) => {
    console.log("ds")
    const id = buscarid(socket.id);
    enviarConsulta("SELECT id_amigo FROM amigos WHERE fecha_baja IS NULL AND id_user = "+id).then(res => {
      enviarConsulta("SELECT id_user as id_amigo FROM amigos WHERE fecha_baja IS NULL AND id_amigo = "+id).then(res1 => {
        var amigos = [...res.rows,...res1.rows]
        for(var i = 0; i < amigos.length;i++){
          const sid = buscarsid(amigos[i].id_amigo);
          if(sid != -1){
            io.to(sid).emit("enLineaNo",[id])
          }
        }
      }).catch(err1 =>{
        console.log(err1)
      })
    }).catch(err =>{
      console.log(err)
    })
    if (id != -1) {
      for (var i = players.length - 1; i >= 0; i--) {
        if (players[i].sid == socket.id) {
          players.splice(i, 1)
          break;
        }
      }
    }
  });
  socket.on('registro', (data) => {
    data = data.datos;
    console.log(data);
    enviarConsulta("SELECT registrar('" + data[0] + "'," + data[1] + ",'" + data[2] + "','" + data[3] + "','" + data[4] + "') AS msg").then(res => {
      io.to(socket.id).emit("registro", { msg: res.rows[0].msg });
    })
      .catch(error => {
        console.log(error);
        io.to(socket.id).emit("registro", { msg: "error" });
      })
  });
  socket.on('login', (data) => {
    data = data.datos
    enviarConsulta("SELECT login('" + data[0] + "','" + data[1] + "') AS id").then(res => {
      if (res.rows[0].id) {
        if (buscarsid(res.rows[0].id) != -1) {
          io.to(socket.id).emit("login", ["", "EnUso"]);
          return;
        }
        enviarConsulta("SELECT id_amigo,nombre FROM amigos INNER JOIN usuarios ON amigos.id_amigo = usuarios.id WHERE amigos.fecha_baja IS NULL AND id_user = " + res.rows[0].id).then(res1 => {
          enviarConsulta("SELECT id_user AS id_amigo,nombre FROM amigos INNER JOIN usuarios ON amigos.id_user = usuarios.id WHERE amigos.fecha_baja IS NULL AND id_amigo = " + res.rows[0].id).then(res2 => {
            var amigos = [...res1.rows, ...res2.rows];
            var ar = [];
            players.push(new player(socket.id, res.rows[0].id))
            for (var i = 0; i < amigos.length; i++) {
              var ban = true;
              ar.push(amigos[i].id_amigo);
              ar.push(amigos[i].nombre);
              for (var j = 0; j < partidas.length; j++) {
                if (partidas[j].id == amigos[i].id_amigo) {
                  ar.push(partidas[j].juego)
                  ban = false;
                  break;
                }
              }
              if (ban) {
                ar.push("defecto")
              }
              if(fs.existsSync('img/usuarios/' + amigos[i].id_amigo + '.png')){
                ar.push(fs.readFileSync('img/usuarios/' + amigos[i].id_amigo + '.png').toString('base64'));
              }
              else{
                ar.push("defecto")
              }
              if(buscarsid(amigos[i].id_amigo) == -1){
                ar.push("n")
              }
              else{
                ar.push("s")
              }
              for(var j = 0; j < amigos.length; j++){
                var si = buscarsid(amigos[j].id_amigo);
                if(si != -1 && si != amigos[i].id_amigo){
                  io.to(si).emit("enLinea",[amigos[i].id_amigo.toString()]);
                }
              }
            }
            io.to(socket.id).emit('camigos', ar);
            io.to(socket.id).emit('login', [data[0], "1"]);
            const imagePath = 'img/usuarios/' + res.rows[0].id + '.png';
            fs.readFile(imagePath, (err, data) => {
              if (err) {
                console.error('Error al leer la imagen:', err);
              } else {
                const base64Image = data.toString('base64');
                io.to(socket.id).emit('miImagen', [base64Image.toString()]);
              }
            });
          })
        })
      } else {
        io.to(socket.id).emit('login', ["", "CI"]);
      }
    }).catch(error => {
      io.to(socket.id).emit('login', ["", "IX"]);
      console.log(error);
    });
  });
  socket.on('logout', (data) => {
    for (var i = players.length - 1; i >= 0; i--) {
      if (players[i].sid == socket.id) {
        players.splice(i, 1)
        io.to(socket.id).emit("logout", ["adios vaquero :,V"]);
        break;
      }
    }
  });
  socket.on('eliminar', (data) => {
    enviarConsulta("UPDATE usuarios SET fecha_baja = CURRENT_DATE WHERE id = " + buscarid(socket.id)).then(res => {
      io.to(socket.id).emit("eliminar", ["pipipi"]);
    }).catch(error => {
      console.log(error);
    })
  });
  socket.on('cambiarContra', (data) => {
    const id = buscarid(socket.id);
    data = data.datos
    enviarConsulta("SELECT cambiarcontra('" + data[0] + "','" + data[1] + "'," + id + ") AS si").then(res => {
      if (res.rows[0].si) {
        io.to(socket.id).emit("cambiarContra", ["1", data[1]]);
      } else {
        io.to(socket.id).emit("cambiarContra", ["0"]);
      }
    }).catch(error => {
      console.log(error);
    })
  });
  socket.on('mensajes', (data) => {
    data = limpiar(data.datos)
    var id = buscarid(socket.id);
    enviarConsulta("SELECT mensaje,usuario_id FROM mensajes WHERE (usuario_id = " + id + " AND amigo_id = " + data[0] + ") OR (usuario_id = " + data[0] + " AND amigo_id = " + id + ")").then(res => {
      if (res.rows) {
        var envio = [];
        for (var i = 0; i < res.rows.length; i++) {
          envio.push(res.rows[i].usuario_id)
          envio.push(res.rows[i].mensaje)
        }
        io.to(socket.id).emit("losMensajes", envio);
      }
    }).catch(error => {
      console.log(error);
    })
  });
  socket.on('mandar', (data) => {
    data = data.datos
    var id = buscarid(socket.id)
    enviarConsulta("INSERT INTO mensajes(usuario_id,amigo_id,mensaje) VALUES(" + id + "," + data[0] + ",'" + data[1] + "')").then(res => {
      var sid = buscarsid(data[0])
      if (sid != -1) {
        io.to(sid).emit("nuevoMensaje", { id: id, msg: data[1] });
      }
      io.to(socket.id).emit("mensajeEnviado", { exito: true });
    }).catch(error => {
      console.log(error)
    })
  });

  //imagen de usuario

  socket.on('cargarImagen', (data) => {
    const imagePath = 'img/usuarios/' + buscarid(socket.id) + '.png';
    fs.writeFile(imagePath, data.datos, (err) => {
      if (err)
        console.log(err);
      else {
        io.to(socket.id).emit('imagenCargada', ["si"]);
      }
    });
  });
  //fin
  socket.on('esteJuego', (data) => {
    var juego = JSON.parse(data).juego;
    var id = buscarid(socket.id);
    partidas.push(new partida(id, juego));
    axios.post("https://joyboxapp.000webhostapp.com/traerAmigos.php", JSON.stringify({ id: id }))
      .then(response => {
        var val = response.data;
        for (var i = 0; i < players.length; i++) {
          for (var j = 0; j < val.amigos.length; j++) {
            if (players[i].id == val.amigos[j].id_amigo) {
              io.emit("partidaAmigo", { id_amigo: id, juego: juego });
            }
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  });

  //eventos busqueda para agregar causas y congregaciones fino señores :vVVVv

  socket.on('buscarUsuarios', (data) => {
    data = data.datos
    var id = buscarid(socket.id);
    enviarConsulta("SELECT id,nombre FROM usuarios WHERE nombre LIKE '%" + data[0] + "%' AND fecha_baja IS NULL AND amigo(" + id + ",id) = False AND id != " + id).then(res => {
      if (res.rows) {
        var envio = [];
        for (var i = 0; i < res.rows.length; i++) {
          envio.push(res.rows[i].id)
          envio.push(res.rows[i].nombre)
        }
        io.to(socket.id).emit("losUsuarios", envio);
      }
      else {
        io.to(socket.id).emit("losUsuarios", ["nada"]);
      }
    }).catch(error => {
      console.log(error);
    })
  });

  socket.on('añadirAmigo', (data) => {
    data = data.datos
    enviarConsulta("INSERT INTO amigos(id_user,id_amigo,fecha_baja) VALUES(" + buscarid(socket.id) + "," + data[0] + ",CURRENT_DATE)").then(res => {
      io.to(socket.id).emit("añadioAmigo", [data[0]]);
    }).catch(error => {
      console.log(error);
    })
  });

  socket.on('buscarGrupos', (data) => {
    data = data.datos
    enviarConsulta("SELECT id,nombre FROM usuarios WHERE nombre LIKE '%" + data[0] + "%'").then(res => {
      if (res.rows) {
        var envio = [];
        for (var i = 0; i < res.rows.length; i++) {
          envio.push(res.rows[i].id)
          envio.push(res.rows[i].nombre)
        }
        io.to(socket.id).emit("losMensajes", envio);
      }
      else {
        io.to(socket.id).emit("losMensajes", ["nada"]);
      }
    }).catch(error => {
      console.log(error);
    })
  });

  //aca terminan

  // eventos para las solicitudes de amistad
  socket.on('pedirSolicitudes', (data) => {
    enviarConsulta("SELECT id_user AS id,nombre FROM amigos INNER JOIN usuarios ON amigos.id_user = usuarios.id WHERE amigos.fecha_baja IS NOT NULL AND id_amigo = " + buscarid(socket.id)).then(res => {
      if (res.rows) {
        var envio = [];
        for (var i = 0; i < res.rows.length; i++) {
          envio.push(res.rows[i].id)
          envio.push(res.rows[i].nombre)
        }
        io.to(socket.id).emit("lasSolicitudes", envio);
      }
      else {
        io.to(socket.id).emit("lasSolicitudes", ["nada"]);
      }
    }).catch(error => {
      console.log(error);
    })
  });
  socket.on('aceptarSolicitud', (data) => {
    enviarConsulta("UPDATE amigos SET fecha_baja = null WHERE id_user = " + data.datos[0] + " AND id_amigo = " + buscarid(socket.id)).then(res => {
      io.to(socket.id).emit("solicitudAceptada", data.datos);
    }).catch(error => {
      console.log(error);
    })
  });
  socket.on('rechazarSolicitud', (data) => {
    enviarConsulta("DELETE FROM amigos WHERE id_user = " + data.datos[0] + " AND id_amigo = " + buscarid(socket.id)).then(res => {
      io.to(socket.id).emit("solicitudRechazada", data.datos);
    }).catch(error => {
      console.log(error);
    })
  });
  //aca terminan
  socket.on('fPuntos', (data) => {
    var id = buscarid(socket.id);
    axios.post("https://joyboxapp.000webhostapp.com/puntosFlappy.php", JSON.stringify({ id: id }))
      .then(response => {
        io.to(socket.id).emit("fPuntos", { puntos: response.data.puntaje })
      })
      .catch(error => {
        console.log(error);
      });
  });
  socket.on('faPuntos', (data) => {
    var id = buscarid(socket.id);
    axios.post("https://joyboxapp.000webhostapp.com/actualizarFlappy.php", JSON.stringify({ id: id, puntos: JSON.parse(data).puntos }))
      .then(response => {
      })
      .catch(error => {
        console.log(error);
      });
  });
  socket.on('finicio', (data) => {
    enviarEsp(socket.id, "finicio", { exito: true })
  });
  socket.on('ffinal', (data) => {

  });
  socket.on('ficols', (data) => {

  });
  socket.on('fflap', (data) => {
    enviarEsp(socket.id, "impulso", { exito: true })
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
    enviarEsp(socket.id, "fcols", { y: datos.y, pos: datos.pos })
  });
  socket.on('fbg', (data) => {
    var pid = buscarPartida(buscarid(socket.id));
    partidas[pid].bgs[partidas[pid].bg] = JSON.parse(data).x;
    if (partidas[pid].bg == 0) {
      partidas[pid].bg = 1;
    }
    else {
      partidas[pid].bg = 0;
    }
  });
  socket.on('fentro', (data) => {
    var pid = buscarPartida(JSON.parse(data).id);
    partidas[pid].espectadores.push(buscarid(socket.id));
    enviarEsp(partidas[pid].id, "valores", { id: socket.id })
  });
  socket.on('fvalores', (data) => {
    enviarEsp(JSON.parse(data).id, "salidas", JSON.parse(data));
  });
});

function enviarEsp(id, evento, valores) {
  var pid = buscarPartida(buscarid(id));
  for (var i = 0; i < partidas[pid].espectadores.length; i++) {
    io.to(buscarsid(partidas[pid].espectadores[i])).emit(evento, { valores });
  }
}

function buscarid(sid) {
  for (var i = 0; i < players.length; i++) {
    if (players[i].sid == sid) {
      return players[i].id;
    }
  }
  return -1;
}

function buscarsid(id) {
  for (var i = 0; i < players.length; i++) {
    if (players[i].id == id) {
      return players[i].sid;
    }
  }
  return -1;
}

function buscarPartida(id) {
  for (var i = 0; i < partidas.length; i++) {
    if (partidas[i].id == id) {
      return i;
    }
  }
}

async function enviarConsulta(consulta) {
  return await pool.query(consulta);
}

async function pullConsultas(consultas) {
  var respuestas = [];
  for (var i = 0; i < consultas.length; i++) {
    respuestas[respuestas.length - 1] = await enviarConsulta();
  }
  return respuestas;
}

function limpiar(si) {
  datos = []
  for (var i = 0; i < si.length; i++) {
    if (si[i].length > 1) {
      datos.push(si[i].substr(0, si[i].length - 1));
    }
    else {
      datos.push(si[i])
    }
  }
  return datos;
}