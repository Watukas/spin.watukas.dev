const context = new AudioContext();

export async function playTickSound(url: string = "/tick.wav", pitch: number = 1.0) {

    if (context.state === "suspended") {
        await context.resume();
    }

	const response = await fetch(url);
	const arrayBuffer = await response.arrayBuffer();
	const audioBuffer = await context.decodeAudioData(arrayBuffer);

	const source = context.createBufferSource();
	source.buffer = audioBuffer;
	source.playbackRate.value = pitch;

	source.connect(context.destination);
	source.start(0);
}