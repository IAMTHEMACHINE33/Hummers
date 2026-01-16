import net from "node:net";
import fs from "node:fs/promises";
import crypto from "node:crypto";
const server = net.createServer(() => {});

let allUsers = [];
const times = [];
let i = 0;

server.on("connection", async (socket) => {
  const fd = await fs.open("./temp/current/Going To California.mp3");
  const song = fd.createReadStream();

  socket.id = crypto.randomUUID();
  console.log("socket.id", socket.id);

  song.pipe(socket, { end: false });

  allUsers.push({
    socket,
    userId: socket.id,
  });
  console.log("allUsers.length", allUsers.length);
  await sendToAll({
    event: "cmd",
    cmd: "getTime",
  });

  socket.on("data", dataFn);
  socket.on(
    "end",
    () => (allUsers = allUsers.filter((user) => user.userId !== socket.id)),
  );
  socket.on("error", (err) => {
    console.log("error: socket error", err);
  });
});

async function dataFn(rawData) {
  console.log(rawData.toString());
  const data = JSON.parse(rawData.toString());
  switch (data.event) {
    case "time": {
      times.push(data.value);
      if (allUsers.length === times.length) {
        const currentTime = times.filter((time) => time)[0];
        console.log("currentTime", currentTime);
        await sendToAll({
          event: "cmd",
          cmd: "changeTime",
          value: currentTime,
        });
        times.length = 0;
      }
      console.log("time");
    }
  }
}

function sendJSON(socket, obj) {
  const data = JSON.stringify(obj);
  socket.write(data);
}

function sendToAll(obj) {
  return new Promise((res, rej) =>
    setTimeout(() => {
      try {
        for (const user of allUsers) {
          sendJSON(user.socket, obj);
        }
        res(true);
      } catch (err) {
        rej(err);
      }
    }, 500),
  );
}
server.listen({ port: 8888, host: "0.0.0.0", family: 4 }, () => {
  console.log("Server running at localhost:8888");
});
