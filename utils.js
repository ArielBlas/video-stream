const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

function transcodeVideo(inputFileName, outputFileNameBase, name) {
  return new Promise((resolve, reject) => {
    const inputFilePath = path.join(__dirname, inputFileName);
    const outputDir = path.join(__dirname, outputFileNameBase);
    const outputPlaylist = `${name}.m3u8`;
    const segmentFilePattern = `${name}_%01d.ts`;

    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const ffmpegCommand = `ffmpeg -i ${inputFilePath} -vf scale=1280:-1 -c:v h264 -profile:v main -g 48 -keyint_min 48 -sc_threshold 0 -b:v 2500k -maxrate 2500k -bufsize 2500k -hls_time 4 -hls_playlist_type vod -hls_segment_filename '${path.join(
      outputDir,
      segmentFilePattern
    )}' ${path.join(outputDir, outputPlaylist)}`;

    exec(ffmpegCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing FFmpeg command: ${error.message}`);
        reject(error);
        return;
      }

      if (stderr) {
        console.error(`FFmpeg stderr: ${stderr}`);
      }

      console.log(`FFmpeg stdout: ${stdout}`);
      resolve();
    });
  });
}

module.exports = { transcodeVideo };
