var timer = null;
var interval = 100; // default interval, this is set before recording or playing.

self.onmessage = function (e) {
    if (e.data == "start") {
        // Start event loop.
        timer = setInterval(function () {
            postMessage("step");
        }, interval);
    } else if (e.data.interval) {
        // Set loop inteval.
        interval = e.data.interval;
        if (timer) {
            clearInterval(timer);
            timer = setInterval(function () {
                postMessage("step");
            }, interval);
        }
    } else if (e.data == "stop") {
        // Stop event loop.
        clearInterval(timer);
        timer = null;
    }
};
