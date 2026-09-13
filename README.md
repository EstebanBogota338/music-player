# Music Player — FFT Edition

Reproductor de música web con visualizador de frecuencias en tiempo real.  
Vanilla JS puro, sin dependencias ni build step. Frontend estable y listo para integrar con backend.

## Características

- Visualizador FFT con barras suavizadas y glow
- Frecuencia dominante real (calculada desde el analizador Web Audio)
- Playlist y cola de reproducción independiente (FIFO)
- Drag & drop de archivos de audio
- Modo aleatorio (shuffle) y bucle (repeat) con reseteo automático al cargar música nueva
- Controles por teclado (Space, ←, →, S)
- Control de volumen y color del visualizador
- Separación de selección y reproducción (no se reproduce al hacer clic en la lista)

## Uso

Abre `index.html` en un servidor local o despliega directo en GitHub Pages.

```bash
# Con VS Code Live Server, o:
npx serve .

Estructura del proyecto

├── index.html
├── styles.css
├── js/
│   ├── app.js            # Controlador principal y eventos UI
│   ├── audioEngine.js    # Motor de reproducción + Web Audio API
│   └── fftRenderer.js    # Renderizado de barras sobre canvas
└── visualizer/
    └── audio/
        ├── audioEngine.js  # Grafo de nodos Web Audio (compresor, ganancia, analyser)
        └── fftAnalyzer.js  # Análisis FFT y cálculo de frecuencia dominante

Controles por teclado
Tecla	Acción
Space	Play / Pause
→	Siguiente canción
←	Anterior canción
S	Detener
Roadmap (próximos pasos)
□ Extracción de metadatos ID3 (artista, álbum, portada)
□ Persistencia de la biblioteca (localStorage / IndexedDB)
□ Mejoras de accesibilidad y atajos de teclado ampliados
□ Integración con API backend (Spring Boot) para catálogo de discos y QR