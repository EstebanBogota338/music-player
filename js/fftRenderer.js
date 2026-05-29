class FFTRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.analyzer = null;
        this.isRunning = false;
        this.id = null;
        this.isPlaying = false;

        this.config = {
            width: 700,
            height: 150,
            barCount: 64,
            barGap: 2,
            barRadius: 3,
            smoothing: 0.55,
            colors: {
                bass: "#d4af37",
                mid: "#e6be50",
                treble: "#8b5cf6"
            },
            background: "#282828",
            glow: 14
        };

        this.smoothed = new Float32Array(this.config.barCount);
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
    }

    setPlaying(playing) {
        this.isPlaying = playing;
    }

    setColor(color) {
        this.config.colors.bass = color;
        this.config.colors.mid = color;
        this.config.colors.treble = color;
    }

    start(analyzer) {
        this.analyzer = analyzer;
        this.isRunning = true;
        this.loop();
    }

    stop() {
        this.isRunning = false;
        if (this.id) cancelAnimationFrame(this.id);
    }

    loop() {
        if (!this.isRunning) return;
        this.draw();
        this.id = requestAnimationFrame(() => this.loop());
    }

    draw() {
        const ctx = this.ctx;
        const W = this.config.width;
        const H = this.config.height;

        ctx.fillStyle = this.config.background;
        ctx.fillRect(0, 0, W, H);

        const data = this.analyzer?.getFrequencyData();
        if (!data) return;

        const count = this.config.barCount;
        const barW = (W - this.config.barGap * (count - 1)) / count;
        let energySum = 0;

        for (let i = 0; i < count; i++) {
            const t = i / count;
            const index = Math.floor(Math.pow(t, 1.6) * (data.length - 1));

            let value = (data[index] ?? 0) / 255;
            value = Math.log10(1 + value * 9) / Math.log10(10);
            energySum += value;

            this.smoothed[i] = this.smoothed[i] * this.config.smoothing + value * (1 - this.config.smoothing);
            let v = this.smoothed[i];

            if (!this.isPlaying) {
                v = v * 0.15;
            }

            v = Math.pow(v, 1.25);
            v = Math.min(1, Math.max(0, v));

            const h = v * H * 0.45;
            const x = i * (barW + this.config.barGap);
            const y = H - h;

            const color = this.color(i, count);

            ctx.shadowBlur = this.config.glow;
            ctx.shadowColor = color;
            ctx.fillStyle = color;

            if (h > 0) {
                this.roundRect(ctx, x, y, barW, h, this.config.barRadius);
            }
        }

        ctx.shadowBlur = 0;
    }

    color(i, total) {
        const p = i / total;
        if (p < 0.33) return this.config.colors.bass;
        if (p < 0.66) return this.config.colors.mid;
        return this.config.colors.treble;
    }

    roundRect(ctx, x, y, w, h, r) {
        if (h <= 0) return;
        const radius = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }
}

export default FFTRenderer;