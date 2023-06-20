const express = require('express');
const app = express();

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'),() =>{
  console.log("servidor se corre en puerto ",app.get('port'));
});

const SocketIO = require('socket.io');
const io = SocketIO(server);

io.on('connection',(socket)=>{
  console.log('new connection',socket.id);
  socket.on('hello', (data) => {
    console.log('Evento "hello" recibido:', data);
    // Emitir un evento de respuesta
    socket.emit('hello', '¡Hola, cliente!');
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