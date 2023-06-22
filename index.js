const express = require('express');
const app = express();
const url = 'https://joyboxapp.000webhost.com/';
const axios = require('axios');
const CircularJSON = require('circular-json');

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'),() =>{
  console.log("servidor se corre en puerto ",app.get('port'));
});

const SocketIO = require('socket.io');
const io = SocketIO(server);

io.on('connection',(socket)=>{
  console.log('new connection',socket.id);
  socket.on('registro', (data) => {
    var json = JSON.parse(data);
    const datos = {
      nombre: json.nombre,
      correo: json.correo,
      edad:json.edad,
      contrasenia:json.contrasenia,
      rcontrasenia:json.rcontrasenia
    };
    console.log(datos.nombre+" "+datos.correo+" "+datos.edad+" "+datos.contrasenia+" "+datos.rcontrasenia);
    axios.post("https://joyboxapp.000webhostapp.com/nuevoUsuario.php", datos)
    .then(response => {
      io.to(socket.id).emit('registro', CircularJSON.stringify(response));
    })
    .catch(error => {
      io.to(socket.id).emit('registro', JSON.stringify({exito : false}));
      console.log(error);
    });
  });
});

/*const url = 'https://www.ejemplo.com/archivo.php';
const data = {
  parametro1: 'valor1',
  parametro2: 'valor2'
};

axios.post(url, data)
  .then(response => {
    console.log('Respuesta del servidor PHP:', response.data);
  })
  .catch(error => {
    console.error('Error al hacer la solicitud:', error);
  });*/