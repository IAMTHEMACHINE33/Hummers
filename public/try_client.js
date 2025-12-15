import net from "node:net";

const socket = net.createConnection({ host: "localhost", port: 8889 }, () => {
  console.log("connected to server!");
});

socket.on("data", (data) => {
  console.log("data", data.toString("utf-8"));
});
socket.on("close", (hadError) => console.log("Socket closed", hadError));
socket.on("end", () => console.log("Socket ended by server"));
socket.on("error", (err) => console.log("Socket error", err));
