#!/bin/sh
set -eu
# Usage from repository root: sh store2/media-kit/encode.sh /absolute/path/to/frames
frames=${1:?Pass the frameDirectory printed by capture.mjs}
test -f "$frames/0000.png"
ffmpeg -hide_banner -loglevel error -y -framerate 24 -i "$frames/%04d.png" -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart store2/videos/demo.mp4
ffmpeg -hide_banner -loglevel error -y -i store2/videos/demo.mp4 -vf 'fps=12,scale=960:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer' -loop 0 store2/gifs/demo-wide.gif
ffmpeg -hide_banner -loglevel error -y -i store2/videos/demo.mp4 -vf 'fps=10,scale=480:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer' -loop 0 store2/gifs/demo-compact.gif
ffprobe -v error -show_entries format=duration,size:stream=width,height,r_frame_rate -of json store2/videos/demo.mp4
