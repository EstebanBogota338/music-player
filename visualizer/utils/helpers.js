export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function lerp(a, b, t) {
    return a + (b - a) * clamp(t, 0, 1);
}

export function mapRange(value, inMin, inMax, outMin, outMax) {

    return outMin +
        ((value - inMin) / (inMax - inMin)) *
        (outMax - outMin);
}

export function normalize(value, min, max) {
    return clamp((value - min) / (max - min), 0, 1);
}

export function isValidAudioFile(file) {

    if (!file) return false;

    const valid = [
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/mp4",
        "audio/webm",
        "audio/x-wav"
    ];

    return valid.includes(file.type);
}

export function isNumber(value) {
    return typeof value === "number" &&
        Number.isFinite(value);
}

export function formatHz(hz) {

    if (!isNumber(hz)) {
        return "-- Hz";
    }

    if (hz >= 1000) {
        return `${(hz / 1000).toFixed(1)} kHz`;
    }

    return `${hz.toFixed(1)} Hz`;
}

export function hexToRgb(hex) {

    const match =
        /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (!match) {
        return {
            r: 255,
            g: 0,
            b: 255
        };
    }

    return {
        r: parseInt(match[1], 16),
        g: parseInt(match[2], 16),
        b: parseInt(match[3], 16)
    };
}