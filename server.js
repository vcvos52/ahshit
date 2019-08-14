#!/usr/bin/env node

/**
 * Module dependencies.
 */
const app = require('./app');
/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
// const debug = require('debug')('fritter-starter:server');
const http = require('http').createServer(app);

var io = require('socket.io')(http);

// listen for incoming connections from client
io.on('connection', function (socket) {
  console.log("Someone connected");

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