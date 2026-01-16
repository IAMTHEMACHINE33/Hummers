import net from "node:net";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
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
  // "--no-audio", //TODO: remove later
  "public/current/current.mp3",
]);
vlc.stdout.on("data", (data) => {
  try {
    const time = parseInt(data.toString("utf-8"));
    console.log("time", time);
    if (!Number.isNaN(time)) {
      currentTime = time;
      socket.write(JSON.stringify({ event: "time", value: time }));
    }
  } catch (err) {}
  console.log("-----------------");
});

const stream = fileHandler.createWriteStream();
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
            case "changeTime":
              console.log(data.value, currentTime);
              vlc.stdin.write(
                `seek ${parseInt(data.value) - currentTime}` + "\n",
              );
              currentTime = data.value;
              break;
          }
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
socket.pipe(myTransform).pipe(stream, { end: false });

socket.on("close", (hadError) => console.log("close: Socket closed", hadError));
socket.on("end", () => console.log("end: Socket ended by server"));
socket.on("error", (err) => console.log("error: Socket error", err));
