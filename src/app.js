const express = require("express");
const fs = require("fs");
const app = express();
const path = require("path");
const { transcodeVideo } = require("../utils");

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use(
  "/videos",
  express.static(path.join(__dirname, "..", "uploads/videos"))
);

app.get("/videos/all", (req, res) => {
  const videos = [];
  const videosPath = path.join(__dirname, "..", "/uploads/videos");
  const files = fs.readdirSync(videosPath);
  files.forEach((file, idx) => {
    videos.push({
      id: idx + 1,
      video_path: file,
    });
  });

  res.send(videos);
});

app.post("/videos/create", async (req, res) => {
  const originalPath = path.join(__dirname, "..", "/uploads/original");
  const files = fs.readdirSync(originalPath);

  if (req.query.names) {
    const names = JSON.parse(req.query.names);
    const validaNames = {};

    for (const name of names) {
      validaNames[name] = true;
    }

    for (let idx = 0; idx < files.length; idx++) {
      const name = files[idx].split(".")[0];
      if (validaNames[name]) {
        await transcodeVideo(
          "/uploads/original/" + files[idx],
          "/uploads/videos/" + name,
          name
        );
      }
    }
  } else {
    for (let idx = 0; idx < files.length; idx++) {
      const name = files[idx].split(".")[0];
      await transcodeVideo(
        "/uploads/original/" + files[idx],
        "/uploads/videos/" + name,
        name
      );
    }
  }

  res.send();
});

app.get("/videos/:id", (req, res) => {
  const name = req.params.id;

  const playlistPath = path.join(
    __dirname,
    "..",
    "uploads/videos/" + name,
    name + ".m3u8"
  );

  res.sendFile(playlistPath);
});

/*
app.get("/videoplayback", function (req, res) {
  const range = req.headers.range;

  if (!range) {
    res.status(400).send("Requires Range header");
  }
  
  const videoPath = "MarkRonson_UptownFunk2.mp4";

  const videoSize = fs.statSync(videoPath).size;

  //const CHUNK_SIZE = 10 ** 6; // 1MB
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": "Content-Range",
  };

  res.writeHead(206, headers);

  const videoStream = fs.createReadStream(videoPath, { start, end });
  // const videoStream = fs.createReadStream(videoPath);

  videoStream.pipe(res);
});
*/

module.exports = app;
