class AudioEngine {
    constructor() {
        this.audioContext  = null;
        this.analyser      = null;
        this.gainNode      = null;
        this.compressor    = null;
        this.frequencyData = null;
        this.isRunning     = false;
    }

    async start() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        this._setupNodes();
        this.isRunning = true;
    }

    _setupNodes() {
        if (this._nodesReady) return;

        // 1. Analyser
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize               = 2048;
        this.analyser.smoothingTimeConstant = 0.75;
        this.analyser.minDecibels           = -90;
        this.analyser.maxDecibels           = -10;
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

        // 2. Gain
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 1.0;

        // 3. Compressor
        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.value = -35;
        this.compressor.knee.value      = 30;
        this.compressor.ratio.value     = 12;
        this.compressor.attack.value    = 0.003;
        this.compressor.release.value   = 0.25;

        this.compressor.connect(this.gainNode);
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        this._nodesReady = true;
    }

    getAnalyser() {
        return this.analyser;
    }

    getFrequencyData() {
        if (!this.analyser) return null;
        this.analyser.getByteFrequencyData(this.frequencyData);
        return this.frequencyData;
    }
}

export default AudioEngine;