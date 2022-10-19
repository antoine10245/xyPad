//Events here are dispatched in two places, main.js and sequencer.js.
import eventBus from "./eventBus.js";
export class XYPad {

    constructor(element, callback) {
        this.element = element;
        this.callback = callback;
        this.isPlaying = false

        this.dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.element.appendChild(this.dot);
        this.updateDot(50, 50, 0.1);

        element.addEventListener("mousedown", (e) => {
            let [xPct, yPct] = this.getPositionInPercentages(e);
            this.updateDot(xPct, yPct, 0.5);
            eventBus.dispatch("down", { type: "down", xPct, yPct });

        });

        element.addEventListener("mousemove", (e) => {
            if (this.isPlaying) return
            let [xPct, yPct] = this.getPositionInPercentages(e);
            this.updateDot(xPct, yPct);
            eventBus.dispatch("move", { type: "move", xPct, yPct });
        });

        element.addEventListener("mouseup", (e) => {
            let [xPct, yPct] = this.getPositionInPercentages(e);
            this.updateDot(xPct, yPct, 0.1);
            eventBus.dispatch("up", { type: "up", xPct, yPct });
        });

        // force stopping playback in case the cursor is ourside the Pad's area.
        document.addEventListener("mouseup", (e) => {
            eventBus.dispatch("up", { type: "up" });
        });

        eventBus.on("move", (e) => {
            this.updateDot(e.xPct, e.yPct);
        })
    }

    getPositionInPercentages(e) {
        const clientRect = this.element.getBoundingClientRect();
        const xPct = (e.offsetX / clientRect.width) * 100;
        const yPct = (e.offsetY / clientRect.height) * 100;
        return [xPct, yPct];
    }

    updateDot(xPct, yPct, opacity) {
        this.dot.setAttribute("r", `20px`);
        this.dot.setAttribute("cx", `${xPct}%`);
        this.dot.setAttribute("cy", `${yPct}%`);
        if (opacity !== undefined) {
            this.dot.style.opacity = opacity;
        }
    }
}