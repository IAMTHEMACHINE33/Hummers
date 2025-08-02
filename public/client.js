import http from "http";
import fs from "node:fs/promises";

let count = 0;
let playing = false;
const fileHandler = await fs.open("./public/current/current.mp3", "w");

import { spawn } from "node:child_process";

http
  .get("http://localhost:7777/listen", (res) => {
    res.on("data", async (chunk) => {
      console.log("chunk", chunk);
      const stream = fileHandler.createWriteStream();
      stream.write(chunk);
      if (count++ === 10000 && !playing) {
        playing = true;
        console.log("party time");

        const vlc = spawn("vlc", ["public/current/current.mp3"]);
      }
    });
    res.on("end", (data) => {
      fileHandler.close();
    });
  })

  .on("socket", (socket) => {
    socket.emit("agentRemove");
  });
