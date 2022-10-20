import { XYPad } from './src/xy-pad.js';
import { SamplePlayer } from './src/sample-player.js';
import eventBus from './src/eventBus.js'
import { Sequencer } from './src/sequencer.js'
import MicRecorder from "./src/mic-recorder.js"

document.addEventListener("DOMContentLoaded", () => {
    const XYPadEl = document.getElementById("xy_pad")
    const startBtn = document.getElementById("start")
    const stopBtn = document.getElementById("stop")

    const audioContext = new AudioContext({ latencyHint: "playback", sampleRate: 44100 });
    const sequencer = new Sequencer()
    const micRecorder = new MicRecorder()
    const xyPad = new XYPad(XYPadEl);

    let recording = null

    const samplePlayer = new SamplePlayer(audioContext, (e) => {
        //This could also be managed with the EventBus.
        switch (e.type) {
            case "meterValue":
                XYPadEl.style.outlineWidth = e.value + "px"
                break;
            case "stop":
                XYPadEl.style.outlineWidth = "0px"
                break;
        }
    });

    document.addEventListener("mousedown", () => {
        audioContext.resume();
    });

    startBtn.addEventListener("click", (e) => {
        sequencer.startPlayback(recording)
        samplePlayer.startPlayback()
        
        xyPad.isPlaying = true
        XYPadEl.style.backgroundColor = "lightgreen"
        stopBtn.style.display = "initial"
        startBtn.style.display = "none"
    });

    stopBtn.addEventListener("click", () => {
        xyPad.isPlaying = false
        sequencer.stopPlayback()
        samplePlayer.stopPlayback()
    });

    //Listening for XYPadEvents, works for recording and playback.
    eventBus.on("down", () => {
        //we start to record on mouseDown
        sequencer.startRecord()
        samplePlayer.startPlayback()
        startBtn.classList.add("btn-disabled")
    });
    eventBus.on("move", (e) => {
        samplePlayer.setFilterCutoff((e.xPct / 100) * 10000);
        samplePlayer.setPlaybackRate((1 - (e.yPct / 100)) * 2);
    });
    eventBus.on("up", () => {
        //we stop recording on mouseUp
        samplePlayer.stopPlayback()
        recording = sequencer.stopRecord()
        sequencer.stopPlayback()
        startBtn.classList.remove("btn-disabled")
    });

    //once the sequencer finished the playback we are displaying the play button again.
    eventBus.on("playbackStop", () => {
        xyPad.isPlaying = false
        XYPadEl.style.backgroundColor = ""
        stopBtn.style.display = "none"
        startBtn.style.display = "initial"
    });
});





