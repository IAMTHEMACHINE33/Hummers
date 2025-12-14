import net from "node:net";
import fs from "node:fs/promises";
import { pipeline } from "node:stream/promises";

const socketStore = [];

// const fd = await fs.open("./temp/current/Going To California.mp3");
const highWaterMark = 32;
const options = {
  highWaterMark: highWaterMark,
};
const avg = [0];
const server = net.createServer(() => {});
server.on("connection", async (socket) => {
  const fd = await fs.open("./temp/current/Going To California.mp3");
  const song = fd.createReadStream();
  song.pipe(socket, { end: false });
  song.on("end", () => {
    console.log("ended");
    fd.close();
  });
  socket.wildcard = false;
  socket.bidirectional = true;
  socket.setKeepAlive(true);

  /* socketStore.forEach((socket) => {
    socket.write(JSON.stringify({ event: "cmd", cmd: "getTime" }) + "\n");
  }); */

  socket.write(JSON.stringify({ event: "try", cmd: "trial" }));
  socketStore.push(socket);

  socket.on("data", (data) => {
    const chunk = JSON.parse(data.toString("utf-8"));
    switch (chunk?.event) {
      case "time":
        try {
          avg.push(parseInt(chunk.value));
          console.log(
            "avg.length === socketStore.length",
            avg.length,
            socketStore.length,
          );
          if (avg.length >= socketStore.length) {
            socketStore.forEach((indsocket) => {
              indsocket.write(
                JSON.stringify({ event: "time", value: avg[1] ?? avg[0] }) +
                  "\n",
              );
            });
            avg.length = 1;
          }
        } catch (err) {
          console.log(err);
        }
        break;
    }
  });
  socket.on("end", () => {
    console.log("socket ended?");
  });
  socket.on("error", (err) => {
    console.log("socket error", err);
  });
});
server.listen({ port: 8888, host: "0.0.0.0", family: 4 }, () => {
  console.log("Server running at localhost:8888");
});
