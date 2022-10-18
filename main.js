import { XYPad } from './src/xy-pad.js';
import { SamplePlayer } from './src/sample-player.js';

document.addEventListener("DOMContentLoaded", () => {
    const audioContext = new AudioContext({latencyHint: "playback", sampleRate: 44100});
    const samplePlayer = new SamplePlayer(audioContext);

    const xyPad = new XYPad(document.getElementById("xy_pad"), (e) => {
        samplePlayer.setFilterCutoff((e.xPct / 100) * 10000);
        samplePlayer.setPlaybackRate((1 - (e.yPct / 100)) * 2);

        switch(e.type) {
            case "down":
                samplePlayer.startPlayback();
                break;
            case "up":
                samplePlayer.stopPlayback();
                break;
            case "move":
                break;
        }
    });

    samplePlayer.loadSample().then(() => {
        document.getElementById("loading_indicator").innerHTML = "Sample Loaded!";
    })

    document.addEventListener("mousedown", (e) => {
        audioContext.resume();
    });
});
