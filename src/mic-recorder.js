import eventBus from "./eventBus.js";

/**
 * this class takes care of recording a mic input and returns a ObjectURl linking to the recorded audio.
 */
export default class MicRecorder {
    constructor() {
        this.recordBtn = document.querySelector('.record-mic');
        this.stopMicRecord = document.querySelector('.stop-mic-record');
        this.initRecorder()
    }
    initRecorder() {
        if (navigator.mediaDevices.getUserMedia) {
            console.log('getUserMedia supported.');

            const constraints = { audio: true };
            let chunks = [];

            let onSuccess = (stream) => {
                const mediaRecorder = new MediaRecorder(stream);

                this.recordBtn.onclick = () => {
                    mediaRecorder.start();

                    this.recordBtn.style.display = "none";
                    this.stopMicRecord.style.display = "initial";
                }

                this.stopMicRecord.onclick = () => {
                    mediaRecorder.stop();

                    this.recordBtn.style.display = "initial";
                    this.stopMicRecord.style.display = "none";
                }

                mediaRecorder.onstop = function (e) {
                    const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
                    chunks = [];
                    const audioURL = window.URL.createObjectURL(blob);
                    eventBus.dispatch("sampleRecorded", { audioURL })
                }

                mediaRecorder.ondataavailable = function (e) {
                    chunks.push(e.data);
                }
            }

            let onError = function (err) {
                console.log('The following error occured: ' + err);
            }

            navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

        } else {
            console.log('getUserMedia not supported on your browser!');
        }
    }
}