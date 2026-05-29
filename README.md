# Music Player — FFT Edition

Reproductor de música web con visualizador de frecuencias en tiempo real. Vanilla JS puro, sin dependencias ni build step.

## Características

- Visualizador FFT con barras suavizadas y glow
- Frecuencia dominante real en Hz / kHz
- Playlist y cola de reproducción
- Drag & drop de archivos
- Modo aleatorio y bucle
- Controles por teclado (Space, ←, →, S)
- Control de volumen y color del visualizador

## Uso

Abre `index.html` en un servidor local o despliega directo en GitHub Pages.

```bash
# Con VS Code Live Server, o:
npx serve .
```

## Estructura

├── index.html
├── styles.css
├── js/
│   ├── app.js            # Controlador principal y eventos UI
│   ├── audioEngine.js    # Motor de reproducción + Web Audio API
│   ├── fftRenderer.js    # Renderizado de barras sobre canvas
│   └── fftRender.js      # Re-export de fftRenderer
└── visualizer/
└── audio/
├── audioEngine.js  # Grafo de nodos de audio
└── fftAnalyzer.js  # Análisis FFT y frecuencia dominante

## Teclado

| Tecla | Acción |
|-------|--------|
| `Space` | Play / Pause |
| `→` | Siguiente |
| `←` | Anterior |
| `S` | Detener |

## Roadmap

- [ ] Metadata ID3 (artista, álbum, portada)
- [ ] Rediseño de UI
- [ ] Ecualizador de bandas
- [ ] Waveform en barra de progreso
