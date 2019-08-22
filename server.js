#!/usr/bin/env node

/**
 * Module dependencies.
 */
const app = require('./app');
/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);
// const debug = require('debug')('fritter-starter:server');
const http = require('http').createServer(app);

var io = require('socket.io')(http);

let allconnections = [];

// listen for incoming connections from client
io.on('connection', function (socket) {
  console.log("Someone connected");
  allconnections.push(socket.id);
  console.log("==============================", allconnections);
  socket.on('disconnect', function(){
      console.log("Someone Disconnected");
  });

  // start listening for player joining
  socket.on('player-joined', function (data) {
      // console.log(data); 
      io.emit('player-joined', data);
  });

  // start listening for player leaving
  socket.on('player-left', function (data) {
    // console.log(data);
    io.emit('player-left', data);
  });

  // start listening for player leaving
  socket.on('start-game', function (data) {
    // console.log(data);
    io.emit('start-game', data);
  });

  // start listening for next turn
  socket.on('next-turn', function (data) {
    // console.log(data);
    io.emit('next-turn', data);
  });

  // start listening for next turn
  socket.on('next-round', function (data) {
    // console.log(data);
    io.emit('next-round', data);
  });

  // start listening for next turn
  socket.on('card-played', function (data) {
    // console.log(data);
    io.emit('card-played', data);
  });

  // start listening for next turn
  socket.on('trick-done', function (data) {
    // console.log(data);
    io.emit('trick-done', data);
  });

  // start listening for next turn
  socket.on('deck-updated', function (data) {
    // console.log(data);
    io.emit('deck-updated', data);
  });


  socket.on('award-trick', function (data) {
    // console.log(data);
    io.emit('award-trick', data);
  });

  // start listening for next turn
  socket.on('round-done', function (data) {
    // console.log(data);
    io.emit('round-done', data);
  });


});

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}




http.listen(port);
// server.on('error', onError);
// server.on('listening', onListening);