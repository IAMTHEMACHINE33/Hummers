import express from "express";
import fs from "fs/promises";
import { pipeline } from "node:stream/promises";

const app = express();

const fd = await fs.open("./temp/current/Going To California.mp3");
const song = fd.createReadStream({ highWaterMark: 16 });

app.get("/listen", async (req, res) => {
  song.on("data", (data) => {
    console.log(data);
  });
  song.on("end", (data) => {
    console.log("end");
  });
  res.header("connection", "keep-alive");
  pipeline(song, res);
});
// app.get("/heartbeat", async (req, res) => {
//   res.send(proces.uptime());
// });

const PORT = process.env.PORT ?? 7777;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
