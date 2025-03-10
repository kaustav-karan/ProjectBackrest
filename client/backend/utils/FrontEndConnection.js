const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const FrontEndWebSocket = (server) => {
  const httpServer = http.createServer(server);
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

//   io.on("connection", (socket) => {
//     console.log("A user connected");

//     socket.on("disconnect", () => {
//       console.log("A user disconnected");
//     });

//     // Listen for custom events from the client
//     socket.on("message", (data) => {
//       console.log("Message received:", data);
//       // Broadcast the message to all connected clients
//       io.emit("message", data);
//     });
//   });

  return io;
};

export default FrontEndWebSocket;
