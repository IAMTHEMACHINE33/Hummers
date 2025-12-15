import net from "node:net";
import fs from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { finished, Readable, Transform } from "node:stream";

const socketStore = [];

// const fd = await fs.open("./temp/current/Going To California.mp3");
/* const highWaterMark = 32;
const options = {
  highWaterMark: highWaterMark,
}; */
const avg = [0];
const server = net.createServer(() => {});

const sendAll = (event, data) => {
  setTimeout(() => {
    socketStore.forEach((socket) => {
      socket.write(JSON.stringify({ event: event, cmd: data }));
    });
  }, 500);
};
server.on("connection", async (socket) => {
  const fd = await fs.open("./temp/current/Going To California.mp3");
  const song = fd.createReadStream();
  song.on("end", async () => {
    console.log("end", song.readable);
    song.pause();
    song.unpipe(socket);
    await fd.close();
    sendAll("cmd", "getTime");
  });

  song.pipe(socket, { end: false });

  socket.wildcard = false;
  socket.bidirectional = true;
  socket.setKeepAlive(true);

  socketStore.push(socket);
  /* socketStore.forEach((socket) => {
    socket.write(JSON.stringify({ event: "try", cmd: "trial" }));
    // socket.write(JSON.stringify({ event: "cmd", cmd: "getTime" }) + "\n");
  }); */

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
            sendAll("time", avg[1] ?? avg[0]);
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
