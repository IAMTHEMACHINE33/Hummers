import net from "node:net";
import fs from "node:fs/promises";

const server = net.createServer(() => {});

const socketStore = [];
server.on("connection", async (socket) => {
  socketStore.push(socket);
  socketStore.forEach((indSocket) => {
    indSocket.write("from loop");
  });
  socket.write("from server\n");
});
server.listen({ port: 8889, host: "0.0.0.0", family: 4 }, () => {
  console.log("Server running at localhost:8889");
});
