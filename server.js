const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Servir arquivos estáticos da pasta public
app.use(express.static(__dirname + '/public'));

io.on('connection', socket => {
  console.log('🟢 Cliente conectado:', socket.id);

  socket.on('webrtc-offer', offer => {
    socket.broadcast.emit('webrtc-offer', offer);
  });

  socket.on('webrtc-answer', answer => {
    socket.broadcast.emit('webrtc-answer', answer);
  });

  socket.on('ice-candidate', candidate => {
    socket.broadcast.emit('ice-candidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor lemurRTC rodando na porta ${PORT}`);
});
