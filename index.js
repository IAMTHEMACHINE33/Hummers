import express from "express";
import fs from "fs/promises";
import * as fss from "fs";
import { pipeline } from "node:stream/promises";
import ytdl from "ytdl-core";

const app = express();

const fd = await fs.open("./temp/current/Going To California.mp3");
const fdDownloaded = await fs.open("./temp/current/downloaded.mp3", "w");
const song = fd.createReadStream({ highWaterMark: 16 });

const socketStore = [];
console.log("res", res);

app.get("/listen", async (req, res) => {
  socketStore.push(res);
  song.on("data", (data) => {
    console.log(data);
  });
  song.on("end", (data) => {
    console.log("end");
  });
  res.header("connection", "keep-alive");
  pipeline(song, res);
});
app.get("/pause", async (req, res) => {});
// app.get("/heartbeat", async (req, res) => {
//   res.send(proces.uptime());
// });

app.put("/download", (req, res) => {
  const url = "http://www.youtube.com/watch?v=aqz-KE-bpKQ";
  const validate = ytdl.validateURL(url);
  console.log("validate", validate);
  ytdl(url, { quality: "highestaudio" || "highestvideo" || "highest" }) // Choose desired quality
    .pipe(fss.createWriteStream("./temp/current/downloaded.mp3"))
    .on("finish", () => {
      console.log("Download finished!");
    })
    .on("error", (err) => {
      console.error("Error during download:", err);
    });
});
const PORT = process.env.PORT ?? 7777;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
