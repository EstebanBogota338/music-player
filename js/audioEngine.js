class AudioEngine {
    constructor(canvas) {
        this.audio = new Audio();
        this.audioContext = null;
        this.sourceNode = null;
        this.analyser = null;
        this.gainNode = null;
        this.fftRenderer = null;
        this.fftAnalyzer = null;
        
        this.playlist = [];
        this.currentIndex = 0;
        this.paused = false;
        this.repeatMode = false;
        this.shuffleMode = false;
        this.originalOrder = [];
        this.queueCount = 0;
        this.canvas = canvas;
        
        this.onProgressUpdate = null;
        
        this.audio.addEventListener('ended', () => this.onTrackEnded());
        this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
    }

    async init() {
        // Importar dinámicamente los módulos del visualizador
        const [{ default: AudioEngineVisualizer }, { default: FFTAnalyzer }, { default: FFTRenderer }] = await Promise.all([
            import('../visualizer/audio/audioEngine.js'),
            import('../visualizer/audio/fftAnalyzer.js'),
            import('../js/fftRenderer.js')
        ]);
        
        this.visualEngine = new AudioEngineVisualizer();
        this.fftAnalyzer = new FFTAnalyzer();
        this.fftRenderer = new FFTRenderer(this.canvas);
        
        await this.visualEngine.start();
        this.audioContext = this.visualEngine.audioContext;
        
        this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
        this.sourceNode.connect(this.visualEngine.compressor);
        
        this.fftAnalyzer.setup(this.visualEngine.getAnalyser());
        this.fftRenderer.start(this.fftAnalyzer);
    }

    load(file) {
        if (this.audio.src && this.audio.src.startsWith('blob:')) {
            URL.revokeObjectURL(this.audio.src);
        }
        
        this.audio.src = URL.createObjectURL(file);
        this.currentFile = file;
        this.paused = false;
    }

    async play() {
        if (!this.audio.src) return;
        
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        await this.audio.play();
        this.paused = false;
        if (this.fftRenderer) this.fftRenderer.setPlaying(true);
    }

    pause() {
        this.audio.pause();
        this.paused = true;
        if (this.fftRenderer) this.fftRenderer.setPlaying(false);
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.paused = false;
        if (this.fftRenderer) this.fftRenderer.setPlaying(false);
    }

    restart() {
        this.audio.currentTime = 0;
        this.audio.play();
        this.paused = false;
        if (this.fftRenderer) this.fftRenderer.setPlaying(true);
    }

    next() {
        if (this.playlist.length === 0) return;
        
        if (this.shuffleMode) {
            let nextIdx;
            do { 
                nextIdx = Math.floor(Math.random() * this.playlist.length); 
            } while (nextIdx === this.currentIndex && this.playlist.length > 1);
            this.currentIndex = nextIdx;
        } else if (this.repeatMode) {
            this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        } else {
            this.currentIndex++;
            if (this.currentIndex >= this.playlist.length) {
                this.stop();
                return;
            }
        }
        
        if (this.queueCount > 0) this.queueCount--;
        
        this.load(this.playlist[this.currentIndex]);
        this.play();
    }

    previous() {
        if (this.playlist.length === 0) return;
        
        if (this.currentIndex <= 0) {
            this.restart();
            return;
        }
        this.currentIndex--;
        this.load(this.playlist[this.currentIndex]);
        this.play();
    }

    setPosition(seconds) {
        this.audio.currentTime = seconds;
    }

    get currentTime() {
        return this.audio.currentTime;
    }

    get duration() {
        return this.audio.duration || 0;
    }

    formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    toggleShuffle() {
        this.shuffleMode = !this.shuffleMode;
        
        if (this.shuffleMode) {
            this.originalOrder = [...this.playlist];
            this.originalIndex = this.currentIndex;
            
            if (this.playlist.length > 1) {
                const current = this.playlist[this.currentIndex];
                const rest = this.playlist.filter((_, i) => i !== this.currentIndex);
                
                for (let i = rest.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [rest[i], rest[j]] = [rest[j], rest[i]];
                }
                
                this.playlist = [current, ...rest];
                this.currentIndex = 0;
            }
        } else if (this.originalOrder.length) {
            const current = this.playlist[this.currentIndex];
            this.playlist = [...this.originalOrder];
            this.currentIndex = this.playlist.indexOf(current);
            if (this.currentIndex === -1) this.currentIndex = 0;
        }
    }

    addToQueue(file) {
        const insertIdx = Math.min(this.currentIndex + 1, this.playlist.length);
        this.playlist.splice(insertIdx, 0, file);
        this.queueCount++;
    }

    addToPlaylist(file) {
        this.playlist.push(file);
    }

    clearQueue() {
        if (this.queueCount > 0) {
            this.playlist.splice(this.currentIndex + 1, this.queueCount);
            this.queueCount = 0;
        }
    }

    clearPlaylist() {
        this.stop();
        if (this.audio.src && this.audio.src.startsWith('blob:')) {
            URL.revokeObjectURL(this.audio.src);
        }
        this.playlist = [];
        this.currentIndex = 0;
        this.queueCount = 0;
        this.audio.src = '';
    }

    onTrackEnded() {
        if (!this.paused) this.next();
    }

    onTimeUpdate() {
        if (this.onProgressUpdate) {
            this.onProgressUpdate(this.currentTime, this.duration);
        }
    }

    setVolume(value) {
        if (this.visualEngine && this.visualEngine.gainNode) {
            this.visualEngine.gainNode.gain.value = value;
        }
    }

    setVisualizerColor(color) {
        if (this.fftRenderer) {
            this.fftRenderer.setColor(color);
        }
    }

    get isPlaying() {
        return !this.audio.paused && !this.audio.ended && this.audio.src;
    }

    get currentTrack() {
        return this.playlist[this.currentIndex];
    }
}

export default AudioEngine;