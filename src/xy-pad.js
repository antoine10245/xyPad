export class XYPad {

    constructor(element, callback) {
        this.element = element;
        this.callback = callback;

        this.dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.element.appendChild(this.dot);
        this.updateDot(50, 50, 0.1);

        element.addEventListener("mousedown", (e) => {
            let [xPct, yPct] = this.getPositionInPercentages(e);
            this.updateDot(xPct, yPct, 0.5);
            this.callback({type: "down", xPct, yPct});
        });

        element.addEventListener("mousemove", (e) => {
            let [xPct, yPct] = this.getPositionInPercentages(e);
            this.updateDot(xPct, yPct);
            this.callback({type: "move", xPct, yPct});
        });

        element.addEventListener("mouseup", (e) => {
            let [xPct, yPct] = this.getPositionInPercentages(e);
            this.updateDot(xPct, yPct, 0.1);
            this.callback({type: "up", xPct, yPct});
        });
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