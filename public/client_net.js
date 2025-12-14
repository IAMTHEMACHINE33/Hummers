import net from "node:net";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import { stdin } from "node:process";
import { Transform } from "node:stream";

const socket = net.createConnection({ host: "localhost", port: 8888 }, () => {
  console.log("connected to server!");
});
const fileHandler = await fs.open("./public/current/current.mp3", "w");
let currentTime = 0;
const vlc = spawn("vlc", [
  "--intf",
  "rc",
  "--rc-fake-tty",
  "--quiet",
  "public/current/current.mp3",
]);
vlc.stdout.on("data", (data) => {
  // console.log(data.toString("utf-8"));
  try {
    const time = parseInt(data.toString("utf-8"));
    if (!Number.isNaN(time)) {
      currentTime = time;
      socket.write(JSON.stringify({ event: "time", value: time }));
    }
  } catch (err) {}
  console.log("-----------------");
});
vlc.stdout.on("error", (err) => {
  console.log("error", err);
});

const myTransform = new Transform({
  transform(chunk, encoding, callback) {
    try {
      const data = JSON.parse(chunk.toString("utf-8"));
      console.log(chunk.toString("utf-8"));
      switch (data?.event) {
        case "cmd":
          switch (data?.cmd) {
            case "play\n":
            case "pause\n":
            case "get_time\n":
              vlc.stdin.write(data?.cmd);
              break;
            case "getTime":
              vlc.stdin.write("get_time\n");
              break;
          }
          break;
        case "time":
          console.log(data.value, currentTime);
          vlc.stdin.write(`seek ${parseInt(data.value) - currentTime}` + "\n");
          break;
        default:
          console.log(data);
          break;
      }
      callback(null, "");
    } catch (err) {
      callback(null, chunk);
    }
  },
});
stdin.on("data", (data) => {
  console.log("From terminal", data.toString("utf-8"));
  const cmd = data.toString("utf-8");
  switch (cmd) {
    case "play\n":
    case "pause\n":
    case "get_time\n":
      socket.write(JSON.stringify({ event: "cmd", cmd: cmd }));
      // vlc.stdin.write(cmd);
      break;
    default:
      console.log("Invalid cmd");
      break;
  }
  // seek get_time + forward sec
});

const stream = fileHandler.createWriteStream();
socket.pipe(myTransform).pipe(stream, { end: false });

/* pipeline(socket, stream, (err) => {
  if (err) console.log("Pipeline failed");
  else {
    // vlc.stdin.write("get_state");
    vlc.stdin.write("play");
  }
}); */

socket.on("close", (hadError) => console.log("Socket closed", hadError));
socket.on("end", () => console.log("Socket ended by server"));
socket.on("error", (err) => console.log("Socket error", err));
/* socket.on("end", () => {
  // Delete the file
  console.log("Connection was ended");
}); */
