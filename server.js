const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Servir HTMLs da pasta public/
app.use(express.static(__dirname + '/public'));

// Mapa de clientes conectados: { uuid: socket.id }
const clients = {};

io.on('connection', socket => {
  console.log(`🟢 Conectado: ${socket.id}`);

  // Cliente se registra com UUID
  socket.on('register', uuid => {
    clients[uuid] = socket.id;
    socket.uuid = uuid; // salva no próprio socket
    console.log(`🔖 Registrado: ${uuid} -> ${socket.id}`);
  });

  // Cliente envia oferta de chamada para outro
  socket.on('call', ({ to, offer }) => {
    const targetSocketId = clients[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('incomingCall', {
        from: socket.uuid,
        offer
      });
      console.log(`📞 Chamada de ${socket.uuid} para ${to}`);
    }
  });

  // Cliente envia resposta da chamada
  socket.on('answer', ({ to, answer }) => {
    const targetSocketId = clients[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('acceptAnswer', {
        answer
      });
      console.log(`✅ Resposta de ${socket.uuid} para ${to}`);
    }
  });

  // Candidatos ICE dirigidos
  socket.on('ice-candidate', ({ to, candidate }) => {
    const targetSocketId = clients[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice-candidate', candidate);
    }
  });

  // Quando desconecta
  socket.on('disconnect', () => {
    if (socket.uuid) {
      delete clients[socket.uuid];
      console.log(`🔴 Desconectado: ${socket.uuid}`);
    }
  });
});

// Porta dinâmica para Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 lemurRTC com UUID rodando na porta ${PORT}`);
});
