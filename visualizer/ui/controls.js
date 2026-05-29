const btnPlay = document.getElementById("btn-play");
const btnStop = document.getElementById("btn-stop");

const gainSlider = document.getElementById("gain-slider");
const colorPicker = document.getElementById("color-picker");

const audioUpload = document.getElementById("audio-upload");

const trackName = document.getElementById("track-name");

const freqDisplay = document.getElementById("freq-display");

const statusIndicator =
    document.querySelector(".status-indicator");

let isPlaying = false;

export function setStatus(text) {

    if (statusIndicator) {
        statusIndicator.textContent = text;
    }
}

export function updateFreqDisplay(hz) {

    if (!freqDisplay) return;

    freqDisplay.textContent =
        `${hz.toFixed(1)} Hz`;
}

export function initControls({

    onPlay,
    onStop,
    onGain,
    onColor,
    onUpload

}) {

    btnPlay?.addEventListener("click", () => {

        if (isPlaying) return;

        isPlaying = true;

        if (typeof onPlay === "function") {
            onPlay();
        }
    });

    btnStop?.addEventListener("click", () => {

        if (!isPlaying) return;

        isPlaying = false;

        if (typeof onStop === "function") {
            onStop();
        }
    });

    gainSlider?.addEventListener("input", () => {

        const value =
            parseFloat(gainSlider.value);

        if (typeof onGain === "function") {
            onGain(value);
        }
    });

    colorPicker?.addEventListener("input", () => {

        const color = colorPicker.value;

        if (typeof onColor === "function") {
            onColor(color);
        }
    });

    audioUpload?.addEventListener("change", (e) => {

        const file =
            e.target.files?.[0];

        if (!file) return;

        isPlaying = true;

        if (trackName) {
            trackName.textContent = file.name;
        }

        if (typeof onUpload === "function") {
            onUpload(file);
        }
    });
}