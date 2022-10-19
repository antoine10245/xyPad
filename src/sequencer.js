import eventBus from "./eventBus.js";

/**
 * the sequencer worker allow us to have a steady event loop.
 * We are using it to trigger a "step" event every x time.
 * (Ideally a worker-loader should be configured for production)
 */
const sequencerWorker = new Worker("./worker/sequencer.worker.js");

const newRecording = () => ({
    id: new Date().valueOf().toString(),
    bars: [],
    bpm: 120,
});

/**
 * Step-sequencer to record and play notes on a given tempo.
 * A recording is made of a mulitdimensionnal array made of Bars,Steps and Notes.
 * Notes are stored in Steps. Steps are stored in Bars. Bars are stored in a recording.
 * {Notes} < [Steps] < [Bars] < {recording}
 */
export class Sequencer {
    // Higher the number better the precision of the recording. should be always even.
    numberOfStepsPerBeat = 16;
    // Common 4/4 time signature.
    numberOfBeatsPerBar = 4;

    recording = newRecording();
    bar = [];
    step = [];

    stepIndex = 0;
    barIndex = 0;

    isRecording = false;
    isPlaying = false;

    constructor() {
        this.subscribeToEvents();
    }

    /**
     * Init new recording's state and start the sequencer worker.
     */
    startRecord = () => {
        if (this.isRecording) return;
        this.isRecording = true;

        this.initNewRecording();
        this.setSequencerStepInterval();
        this.seekTransport({ bar: 0, step: 0 });

        // Start the sequencer.
        sequencerWorker.postMessage("start");

        sequencerWorker.onmessage = (ev) => {
            if (ev.data === "step") {
                // Create a new blank step.
                this.step = [];
                // Move sequence to the next step.
                this.stepIndex++;

                this.pushStepToBar();

                // When nb of steps reached the number of steps per bar.
                if (!(this.stepIndex % (this.numberOfStepsPerBeat * this.numberOfBeatsPerBar))) {
                    this.pushBarToRecording();
                    // Create a new empty bar.
                    this.bar = [];
                    // Reset step count for the new bar.
                    this.stepIndex = 0;
                }
            }
        };
    };

    /**
     * Stop the reccording, push the last notes in the recording and stop the sequencer.
     * @returns
     */
    stopRecord = () => {
        this.isRecording = false;

        // Push last bar steps even uncompleted.
        if (this.stepIndex) {
            this.pushBarToRecording();
        }

        // Stop the sequencer.
        sequencerWorker.postMessage("stop");
        return this.recording;
    };

    // We use document level event listener to ensure a faster listening of keyboards evt.
    // When an event occur we store the note in the actual step.
    subscribeToEvents() {
        eventBus.on("down", (e) => this.onEvent(e));
        eventBus.on("move", (e) => this.onEvent(e));
        eventBus.on("up", (e) => this.onEvent(e));
    }

    /**
     * Calculate the exact interval time between steps using recording bpm and nb of steps per bar.
     * @returns {Number} interval in ms
     */
    setSequencerStepInterval = () => {
        const interval = (60 / this.recording.bpm / this.numberOfStepsPerBeat) * 1000;
        sequencerWorker.postMessage({ interval });

        return interval;
    };

    initNewRecording = () => {
        this.recording = newRecording();
        this.bar = [];
        this.step = [];
    };

    pushStepToBar = () => {
        this.bar.push({ notes: this.step });
    };

    pushBarToRecording = () => {
        this.recording.bars.push({ steps: this.bar });
    };

    onEvent(e) {
        if (!this.isRecording) return;
        this.step.push(e);
    }

    /**
     * Takes care of playing a recording.
     * It's going through the sequence's data using the same worker as for recording.
     * This guarantee a very close representation of the original sequence.
     * @returns void
     */
    startPlayback(recording) {
        this.recording = recording;
        //Setting sequencer interval to match with recorging bpm.
        this.setSequencerStepInterval();

        if (this.isPlaying) return;
        this.isPlaying = true;
        this.seekTransport({ bar: 0, step: 0 });


        sequencerWorker.postMessage("start");

        sequencerWorker.onmessage = (ev) => {
            if (ev.data === "step") {
                // we are performing the same indexing as recording.
                this.stepIndex++;
                if (!(this.stepIndex % (this.numberOfStepsPerBeat * this.numberOfBeatsPerBar))) {
                    this.barIndex++;
                    this.stepIndex = 0;
                }
            }

            // If the step is having data, we dispatch an event.
            if (
                this.recording.bars[this.barIndex] &&
                this.recording.bars[this.barIndex].steps[this.stepIndex]
            ) {
                this.recording.bars[this.barIndex].steps[this.stepIndex].notes.forEach((note) => {
                    if (note.type === "up") {
                        eventBus.dispatch("up", note);
                    }
                    if (note.type === "move") {
                        eventBus.dispatch("move", note);
                    }
                    if (note.type === "down") {
                        eventBus.dispatch("down", note);
                    }
                });
            } else {
                this.stopPlayback();
            }
        };
    }

    stopPlayback() {
        this.isPlaying = false;
        sequencerWorker.postMessage("stop");
        eventBus.dispatch("playbackStop")
    }

    /**
     * Allow us to navigate through a sequence using indexes of bars and steps.
     * @returns void
     */
    seekTransport({ bar = 0, step = 0 }) {
        this.barIndex = bar;
        this.stepIndex = step;
    }
}
