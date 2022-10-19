import eventBus from "./eventBus.js";
export class SamplePlayer {

    audioBuffer = undefined;
    source = undefined;

    constructor(audioContext, callback) {
        this.audioContext = audioContext;
        this.callback = callback
        this.filter = new Tone.BiquadFilter().toDestination();
        this.meter = new Tone.Meter();
        this.filter.type = "lowpass";
        this.filter.connect(this.meter)
        this.meterInterval = null

        this.loadSample("/assets/drum-loop-102-bpm.wav").then(() => {
            console.log("Sample Loaded!");
        })

        eventBus.on("sampleRecorded", (e) => {
            this.loadSample(e.audioURL).then(() => {
                console.log("Sample Loaded!");
            })
        });
    }

    loadSample(sampleUrl) {
        return fetch(sampleUrl)
            .then(response => response.arrayBuffer())
            .then(audioData => this.audioContext.decodeAudioData(audioData))
            .then(audioBuffer => this.audioBuffer = audioBuffer);
    }

    startPlayback() {
        this.source = new Tone.Player()
        this.source.buffer = this.audioBuffer;
        this.source.loop = true;
        this.source.connect(this.filter);
        this.source.start();

        // get current level of the track
        this.meterInterval = setInterval(() => {
            this.callback({ type: "meterValue", value: this.getPositiveMeterValues(this.meter.getValue()) })
        }, 50);
    }

    /**
     * since tone.js meter is returning RMS value from -infinity to 0
     * we convert those values to positive and clamp them in order to create our visualization
     */
    getPositiveMeterValues(value) {
        const resolution = 4
        const minValue = 0
        const maxValue = 100
        const PositiveMappedValue = (maxValue - (value * -1)) / resolution
        return this.clamp(PositiveMappedValue, minValue, maxValue)
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    stopPlayback() {
        if (this.source) {
            this.source.stop();
            clearInterval(this.meterInterval);
            this.callback({ type: "stop" })
        }
    }

    setFilterCutoff(frequency) {
        if (frequency) {
            this.filter.frequency.value = frequency;
        }
    }

    setPlaybackRate(pct) {
        if (this.source && pct) {
            this.source.playbackRate = pct;
        }
    }
}