const { execSync, spawnSync } = require(`child_process`);
const { unlinkSync, readdir } = require(`fs`);
const { path } = require(`ffmpeg-static`);
const { join } = require(`path`);

const input = `input.mp4`; // Any FFMPEG supported video format
const fps = `24`; // Set to exact number of input file fps
const mode = 1; // 1 or 2
// 1: 9x5 Array of 22x22 emojis (198px x 110px)
// Mode 1 Uses more emojis, splits data into more emojis (Higher Resolution, Bigger Size In Discord, More Emojis)

// 2: 5x3 Array of 32x32 emojis (160px x 96px)
// Mode 2 Uses less emojis, fits more data into each emoji (Lower Resolution, Smaller Size In Discord, Less Emojis)

console.log(`This only works on 16:9 aspect ratio videos`);
console.log(`The input file is currently: ${input} and can be changed in the Main.js file`);
console.log(`Depending on the length and framerate of the input video, the output gifs may be larger than 10mb each, which is the max emoji file size`);

console.log(`Removing any previous files if any`);
deleteFiles(`temp`);
deleteFiles(`gifs`);

if (mode === 1) {
	thing(198, 110, 22);
} else if (mode === 2) {
	thing(320, 192, 32);
}	else {
	console.log(`You didn't set mode to 1 or 2`);
	process.exit();
}

deleteFiles(`temp`);
console.log(`Complete`);

function deleteFiles(directory) {
	return readdir(directory, (error, files) => {
		if (error) throw error;
		for (const file of files) {
			unlinkSync(join(directory, file), error => {
				if (error) throw error;
			});
		}
	});
}

function thing(width, height, scale) {
	console.log(`Shrinking ${input} and converting temp to images. Don't open the temp folder :sweat:`);
	execSync(`${path} -loglevel quiet -i ${input} -filter:v scale=${width}:${height} -c:a copy ./temp/frame%04d.png`, error => console.error(error));
	console.log(`Combining images to a gif (Using gifski) This may take awhile :sweat:`);
	spawnSync(`node_modules/gifski/bin/windows/gifski.exe`, [`-o`, `./temp/output.gif`, `--fps`, fps, `--quality`, `100`, `./temp/frame*.png`]);
	console.log(`Splitting gif into seperate ${scale}x${scale} emojis`);

	let i = 1;
	for (let y = 0; y < height - scale + 1; y += scale) {
		for (let x = 0; x <= width - scale + 1; x += scale) {
			execSync(`${path} -i ./temp/output.gif -filter:v "crop=${scale}:${scale}:${x}:${y}" ./gifs/Output_${i}.gif`, error => console.error(error));
			i++;
		}
	}
}
