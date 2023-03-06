@echo off
set /p proj=project name: 
set /p fRate=framerate:
set /p fStart=start at frame:
cd output/%proj%
@echo on
ffmpeg -r %fRate% -f image2 -s 1920x1080 -start_number %fStart% -i %%06d.png -vcodec libx264 -crf 25 -pix_fmt yuv420p ../%proj%.mp4
 @echo off
cd ../../