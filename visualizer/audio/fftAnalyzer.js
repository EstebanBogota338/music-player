class FFTAnalyzer {
    constructor() {
        this.analyser = null;
        this.fftSize = 1024;
        this.smoothingTimeConstant = 0.2;
        this.minDecibels = -90;
        this.maxDecibels = -10;
        this.frequencyData = null;
        this.timeData = null;

        this.bands = {
            bass: { start: 1, end: 8 },
            mid: { start: 8, end: 32 },
            treble: { start: 32, end: 64 }
        };
    }

    setup(analyser) {
        this.analyser = analyser;
        this.analyser.fftSize = this.fftSize;
        this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;
        this.analyser.minDecibels = this.minDecibels;
        this.analyser.maxDecibels = this.maxDecibels;
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.timeData = new Uint8Array(this.analyser.fftSize);
    }

    getFrequencyData() {
        if (!this.analyser) return null;
        this.analyser.getByteFrequencyData(this.frequencyData);
        return this.frequencyData;
    }

    getTimeData() {
        if (!this.analyser) return null;
        this.analyser.getByteTimeDomainData(this.timeData);
        return this.timeData;
    }
}

export default FFTAnalyzer;