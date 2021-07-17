'use strict';

/* abdallah => I setup all the autheraization files but am not going to use it */

const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
// const morgan = require('morgan');
// const logger = require('./src/middleware/logger');
const notFoundHandler = require('./src/error-handlers/404');
const errorHandler = require('./src/error-handlers/500');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./src/models/users');

const router = require('./src/router');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: 'https://ibrahim-abdullah-chat-room.netlify.app',
    credentials: true,
  },
});

app.use(cors());
// app.use(logger);
// app.use(morgan('dev'));
app.use(router);

io.on('connect', (socket) => {

  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if(error) return callback(error);

    socket.join(user.room);

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
  });
});

app.use('*', notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server is listening to ${PORT}`));