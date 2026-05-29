import AudioEngine from './audioEngine.js';

// Elementos del DOM
const canvas = document.getElementById('fft-canvas');
const btnPlay = document.getElementById('btn-play');
const btnPause = document.getElementById('btn-pause');
const btnStop = document.getElementById('btn-stop');
const btnNext = document.getElementById('btn-next');
const btnPrev = document.getElementById('btn-prev');
const btnShuffle = document.getElementById('btn-shuffle');
const btnRepeat = document.getElementById('btn-repeat');
const btnFolder = document.getElementById('btn-folder');
const btnQueueNext = document.getElementById('btn-queue-next');
const btnAddPlaylist = document.getElementById('btn-add-playlist');
const btnClearQueue = document.getElementById('btn-clear-queue');
const btnClearPlaylist = document.getElementById('btn-clear-playlist');
const fileInput = document.getElementById('file-input');

const slider = document.getElementById('progress-slider');
const timeLabel = document.getElementById('current-time');
const totalLabel = document.getElementById('total-time');
const selector = document.getElementById('song-selector');
const playlistDisplay = document.getElementById('playlist-display');
const statusLabel = document.getElementById('status-label');
const queueCountLabel = document.getElementById('queue-count');
const folderPath = document.getElementById('folder-path');
const freqDisplay = document.getElementById('freq-display');

const gainSlider = document.getElementById('gain-slider');
const colorPicker = document.getElementById('color-picker');

const loadingOverlay = document.getElementById('loading-overlay');
const loadingProgress = document.getElementById('loading-progress');
const loadingText = document.getElementById('loading-text');

// Inicializar motor
const engine = new AudioEngine(canvas);
let isSeeking = false;

async function boot() {
    try {
        await engine.init();
        setStatus('Listo');
    } catch (error) {
        console.error('Error al inicializar:', error);
        setStatus('Error al inicializar');
    }
}

boot();

// Eventos de control
btnPlay.addEventListener('click', () => {
    if (engine.playlist.length === 0) {
        setStatus('No hay canciones');
        return;
    }
    engine.play();
    setStatus('Reproduciendo');
});

btnPause.addEventListener('click', () => {
    engine.pause();
    setStatus('Pausado');
});

btnStop.addEventListener('click', () => {
    engine.stop();
    setStatus('Detenido');
    slider.value = 0;
    timeLabel.textContent = '00:00';
});

btnNext.addEventListener('click', () => {
    if (engine.playlist.length === 0) return;
    engine.next();
    updateSelectorIndex();
    updatePlaylistDisplay();
    setStatus('Reproduciendo');
});

btnPrev.addEventListener('click', () => {
    if (engine.playlist.length === 0) return;
    engine.previous();
    updateSelectorIndex();
    updatePlaylistDisplay();
    setStatus('Reproduciendo');
});

btnShuffle.addEventListener('click', () => {
    engine.toggleShuffle();
    btnShuffle.classList.toggle('active');
    setStatus(engine.shuffleMode ? 'Aleatorio ON' : 'Aleatorio OFF');
});

btnRepeat.addEventListener('click', () => {
    engine.repeatMode = !engine.repeatMode;
    btnRepeat.classList.toggle('active');
    setStatus(engine.repeatMode ? 'Bucle ON' : 'Bucle OFF');
});

// Progress bar
engine.onProgressUpdate = (current, total) => {
    if (!isSeeking) {
        slider.value = current;
        if (total > 0) slider.max = total;
        timeLabel.textContent = engine.formatTime(current);
        totalLabel.textContent = engine.formatTime(total);
    }
    // Actualizar frecuencia simulada para el display
    if (total > 0) {
        const percent = current / total;
        const dominantFreq = Math.floor(percent * 20000);
        freqDisplay.textContent = `${dominantFreq.toFixed(1)} Hz`;
    }
};

slider.addEventListener('mousedown', () => isSeeking = true);
slider.addEventListener('input', () => {
    timeLabel.textContent = engine.formatTime(parseFloat(slider.value));
});
slider.addEventListener('change', () => {
    engine.setPosition(parseFloat(slider.value));
    isSeeking = false;
});

// Selector de canciones
selector.addEventListener('change', () => {
    if (engine.playlist.length === 0) return;
    engine.currentIndex = selector.selectedIndex;
    engine.load(engine.playlist[engine.currentIndex]);
    engine.play();
    updatePlaylistDisplay();
    setStatus('Reproduciendo');
});

// Seleccionar archivos
btnFolder.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) {
        setStatus('No se seleccionaron archivos');
        return;
    }
    
    // Filtrar archivos de audio
    const audioFiles = files.filter(file => {
        const name = file.name.toLowerCase();
        return name.endsWith('.mp3') || name.endsWith('.wav') || 
               name.endsWith('.ogg') || name.endsWith('.m4a') ||
               name.endsWith('.flac') || name.endsWith('.webm') ||
               file.type.startsWith('audio/');
    });
    
    if (audioFiles.length === 0) {
        setStatus('No se encontraron archivos de audio válidos');
        return;
    }
    
    folderPath.textContent = `${audioFiles.length} archivo(s) seleccionado(s)`;
    
    showLoading();
    for (let i = 0; i < audioFiles.length; i++) {
        updateLoading(i + 1, audioFiles.length, audioFiles[i].name);
        await new Promise(r => setTimeout(r, 50));
    }
    hideLoading();
    
    engine.clearPlaylist();
    engine.playlist = audioFiles;
    engine.currentIndex = 0;
    await engine.load(audioFiles[0]);
    populateSelector(audioFiles);
    updatePlaylistDisplay();
    setStatus(`${audioFiles.length} canciones cargadas`);
    
    fileInput.value = '';
});

// Queue y Playlist
btnQueueNext.addEventListener('click', () => {
    const selected = selector.selectedIndex;
    if (selected >= 0 && selected < engine.playlist.length) {
        engine.addToQueue(engine.playlist[selected]);
        updatePlaylistDisplay();
        setStatus('Agregado a cola');
    }
});

btnAddPlaylist.addEventListener('click', () => {
    const selected = selector.selectedIndex;
    if (selected >= 0 && selected < engine.playlist.length) {
        engine.addToPlaylist(engine.playlist[selected]);
        updatePlaylistDisplay();
        setStatus('Agregado a playlist');
    }
});

btnClearQueue.addEventListener('click', () => {
    engine.clearQueue();
    updatePlaylistDisplay();
    setStatus('Cola limpiada');
});

btnClearPlaylist.addEventListener('click', () => {
    engine.clearPlaylist();
    populateSelector([]);
    updatePlaylistDisplay();
    setStatus('Playlist limpiada');
});

// Volumen y color
gainSlider.addEventListener('input', () => {
    engine.setVolume(parseFloat(gainSlider.value));
});

colorPicker.addEventListener('input', () => {
    engine.setVisualizerColor(colorPicker.value);
});

// Drag and drop
const dragOverlay = document.createElement('div');
dragOverlay.className = 'drag-overlay';
dragOverlay.innerHTML = '<span>🎵 Suelta tus archivos de audio aquí 🎵</span>';
dragOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(212, 175, 55, 0.15);
    border: 3px dashed var(--gold);
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    z-index: 999;
    opacity: 0;
    transition: opacity 0.2s;
`;
document.body.appendChild(dragOverlay);

document.body.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragOverlay.style.opacity = '1';
});

document.body.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragOverlay.style.opacity = '0';
});

document.body.addEventListener('drop', async (e) => {
    e.preventDefault();
    dragOverlay.style.opacity = '0';
    
    const files = Array.from(e.dataTransfer.files).filter(f => {
        const name = f.name.toLowerCase();
        return name.endsWith('.mp3') || name.endsWith('.wav') || 
               name.endsWith('.ogg') || name.endsWith('.m4a') ||
               name.endsWith('.flac') || name.endsWith('.webm') ||
               f.type.startsWith('audio/');
    });
    
    if (files.length > 0) {
        folderPath.textContent = `${files.length} archivo(s) soltado(s)`;
        
        showLoading();
        for (let i = 0; i < files.length; i++) {
            updateLoading(i + 1, files.length, files[i].name);
            await new Promise(r => setTimeout(r, 50));
        }
        hideLoading();
        
        engine.clearPlaylist();
        engine.playlist = files;
        engine.currentIndex = 0;
        await engine.load(files[0]);
        populateSelector(files);
        updatePlaylistDisplay();
        setStatus(`${files.length} archivos cargados`);
    }
});

// Teclas rápidas
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            if (engine.isPlaying) {
                engine.pause();
                setStatus('Pausado');
            } else {
                engine.play();
                setStatus('Reproduciendo');
            }
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (engine.playlist.length) engine.next();
            updateSelectorIndex();
            updatePlaylistDisplay();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            if (engine.playlist.length) engine.previous();
            updateSelectorIndex();
            updatePlaylistDisplay();
            break;
        case 'KeyS':
            btnStop.click();
            break;
    }
});

// Funciones auxiliares
function populateSelector(songs) {
    selector.innerHTML = '';
    songs.forEach((file, i) => {
        const option = document.createElement('option');
        option.textContent = file.name;
        selector.appendChild(option);
    });
    if (songs.length > 0) {
        selector.selectedIndex = 0;
    }
}

function updateSelectorIndex() {
    selector.selectedIndex = engine.currentIndex;
}

function updatePlaylistDisplay() {
    if (engine.playlist.length === 0) {
        playlistDisplay.value = '';
        queueCountLabel.textContent = 'Cola: 0';
        return;
    }
    
    const lines = [];
    for (let i = 0; i < engine.playlist.length; i++) {
        const marker = i === engine.currentIndex ? '▶ ' : '  ';
        const isQueued = engine.queueCount > 0 && i > engine.currentIndex && i <= engine.currentIndex + engine.queueCount;
        const queued = isQueued ? ' [COLA]' : '';
        lines.push(`${marker}${engine.playlist[i].name}${queued}`);
    }
    playlistDisplay.value = lines.join('\n');
    queueCountLabel.textContent = `Cola: ${engine.queueCount}`;
}

function setStatus(text) {
    statusLabel.textContent = text;
}

function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
    loadingProgress.style.width = '0%';
}

function updateLoading(current, total, name) {
    const pct = (current / total) * 100;
    loadingProgress.style.width = pct + '%';
    loadingText.textContent = `Cargando ${current}/${total}: ${name.substring(0, 40)}`;
}