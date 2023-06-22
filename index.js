import fetch from 'cross-fetch';
const express = require('express');
const app = express();
var url = 'https://joyboxapp.000webhost.com/';

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
    fetch('http://example.com/external-file.php', {
      method: 'POST',
      body: postData
    })
      .then(response => response.text())
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error(error);
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