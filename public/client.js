import http from "http";
import fs from "node:fs/promises";

import { spawn } from "node:child_process";

import { stdin, stdout } from "node:process";

const chunks = [];
const vlc = spawn("vlc", [
  "--intf",
  "rc",
  "--rc-fake-tty",
  // "--quiet",
  "public/current/current.mp3",
]);
stdin.on("data", (data) => {
  console.log("From terminal", data.toString("utf-8"));
  vlc.stdin.write("pause\n");
});

let count = 0;
let playing = false;
const fileHandler = await fs.open("./public/current/current.mp3", "w");
http
  .get("http://localhost:7777/listen", (res) => {
    res.on("data", async (chunk) => {
      console.log("chunk", chunk);
      const stream = fileHandler.createWriteStream();
      stream.write(chunk);
      if (count++ === 6000 && !playing) {
        playing = true;
        console.log("party time");

        const vlc = spawn("vlc", [
          "--intf",
          "rc",
          "--rc-fake-tty",
          "--quiet",
          "public/current/current.mp3",
        ]);
      }
    });
    res.on("end", (data) => {
      fileHandler.close();
    });
  })
  .on("socket", (socket) => {
    socket.emit("agentRemove");
  });
