/**
 * Makes the home hero's web media from the two source files (the looping
 * video and its still), into public/hero/.
 *
 *   node scripts/hero-media.js <source-video.mp4> <source-still.jpg>
 *
 * The video (2024x1024, 24 frames a second, about 8 seconds):
 * - Its last frame does not quite meet its first (the steam jumps), so the
 *   first half second is cross-faded over the last half second and the loop
 *   starts half a second in. The join is then invisible.
 * - hero-loop.mp4   1920 wide, H.264, no audio track, faststart
 * - hero-loop.webm  1920 wide, VP9
 * - hero-loop-720.mp4  for phones: the part of the frame a narrow, tall
 *   hero can show (see TALL below), 720 tall, H.264
 *
 * The still:
 * - hero-plate.jpg  the source, untouched (the fallback)
 * - hero-plate.avif / .webp  the same picture, smaller
 * - hero-plate-tall.avif / .webp / .jpg  the phone crop
 *
 * TALL: the hero shows the picture with object-fit: cover at 60% across. A
 * box up to 700 wide and at least 640 tall can only ever show the strip of
 * the picture from 26.9% to 82.1% of its width, so phones are sent just
 * that strip (same 60% position, about half the bytes).
 *
 * Needs ffmpeg on the path, and sharp (already here with Next).
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const [video, still] = process.argv.slice(2);
if (!video || !still) { console.error('usage: node scripts/hero-media.js <source-video.mp4> <source-still.jpg>'); process.exit(1); }
const OUT = path.join(__dirname, '..', 'public', 'hero');
fs.mkdirSync(OUT, { recursive: true });
const TMP = fs.mkdtempSync(path.join(require('os').tmpdir(), 'hero-'));
const ff = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
const TALL = { from: 0.269, to: 0.821 };
const FADE = 12; // frames: half a second

(async () => {
  const frames = Number(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', video]).toString().trim());
  const body = frames - FADE;
  // The loop, joined: frames FADE..body-1 as they are, then the last FADE frames fading into the first FADE.
  const master = path.join(TMP, 'master.mkv');
  ff(['-i', video, '-filter_complex',
    `[0:v]split=3[a][b][c];` +
    `[a]trim=start_frame=${FADE}:end_frame=${body},setpts=PTS-STARTPTS[body];` +
    `[b]trim=start_frame=${body}:end_frame=${frames},setpts=PTS-STARTPTS[tail];` +
    `[c]trim=start_frame=0:end_frame=${FADE},setpts=PTS-STARTPTS[head];` +
    `[tail][head]blend=all_expr='A*(1-(N+1)/${FADE + 1})+B*((N+1)/${FADE + 1})'[join];` +
    `[body][join]concat=n=2:v=1,format=yuv420p[out]`,
    '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '8', master]);

  const x264 = (out, vf, crf, maxrate) => ff(['-i', master, '-vf', vf, '-an', '-c:v', 'libx264', '-preset', 'veryslow', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', String(crf), '-maxrate', maxrate, '-bufsize', '8M', '-g', '48', '-movflags', '+faststart', path.join(OUT, out)]);
  x264('hero-loop.mp4', 'scale=1920:-2:flags=lanczos', 21, '4200k');
  ff(['-i', master, '-vf', 'scale=1920:-2:flags=lanczos', '-an', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '31', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', path.join(OUT, 'hero-loop.webm')]);
  x264('hero-loop-720.mp4', `crop=trunc(iw*${TALL.to - TALL.from}/2)*2:ih:trunc(iw*${TALL.from}):0,scale=-2:720:flags=lanczos`, 23, '1500k');

  // The still.
  fs.copyFileSync(still, path.join(OUT, 'hero-plate.jpg'));
  const meta = await sharp(still).metadata();
  await sharp(still).avif({ quality: 52, effort: 7 }).toFile(path.join(OUT, 'hero-plate.avif'));
  await sharp(still).webp({ quality: 78 }).toFile(path.join(OUT, 'hero-plate.webp'));
  const crop = { left: Math.round(meta.width * TALL.from), top: 0, width: Math.round(meta.width * (TALL.to - TALL.from)), height: meta.height };
  // The phone's first picture, and the largest thing a phone paints: as small as it can be and still look right under the shade.
  await sharp(still).extract(crop).avif({ quality: 44, effort: 7 }).toFile(path.join(OUT, 'hero-plate-tall.avif'));
  await sharp(still).extract(crop).webp({ quality: 78 }).toFile(path.join(OUT, 'hero-plate-tall.webp'));
  await sharp(still).extract(crop).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT, 'hero-plate-tall.jpg'));

  fs.rmSync(TMP, { recursive: true, force: true });
  for (const f of fs.readdirSync(OUT).sort()) console.log(String(fs.statSync(path.join(OUT, f)).size).padStart(9), f);
})();
