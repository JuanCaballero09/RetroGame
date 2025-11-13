const mapa = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,3,2,2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,3,0],
    [0,2,0,0,0,2,0,0,0,0,2,0,2,0,0,0,0,2,0,0,0,2,0],
    [0,2,0,0,0,2,0,0,0,0,2,0,2,0,0,0,0,2,0,0,0,2,0],
    [0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0],
    [0,2,0,0,0,2,0,2,0,0,0,0,0,0,0,2,0,2,0,0,0,2,0],
    [0,2,2,2,2,2,0,2,2,2,2,0,2,2,2,2,0,2,2,2,2,2,0],
    [0,0,0,0,0,2,0,0,0,0,2,0,2,0,0,0,0,2,0,0,0,0,0],
    [1,1,1,1,0,2,0,1,1,1,1,1,1,1,1,1,0,2,0,1,1,1,1], 
    [1,1,1,1,0,2,0,1,0,0,0,1,0,0,0,1,0,2,0,1,1,1,1], 
    [0,0,0,0,0,2,0,1,0,1,1,1,1,1,0,1,0,2,0,0,0,0,0], 
    [4,1,1,1,1,2,1,1,0,1,1,1,1,1,0,1,1,2,1,1,1,1,4], 
    [4,1,1,1,1,2,1,1,0,1,1,1,1,1,0,1,1,2,1,1,1,1,4], 
    [0,0,0,0,0,2,0,1,0,0,0,0,0,0,0,1,0,2,0,0,0,0,0], 
    [1,1,1,1,0,2,0,1,1,1,1,1,1,1,1,1,0,2,0,1,1,1,1], 
    [1,1,1,1,0,2,0,1,1,1,1,1,1,1,1,1,0,2,0,1,1,1,1], 
    [0,0,0,0,0,2,0,1,0,0,0,0,0,0,0,1,0,2,0,0,0,0,0], 
    [0,2,2,2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,2,0], 
    [0,2,0,0,0,2,0,0,0,0,2,0,2,0,0,0,0,2,0,0,0,2,0], 
    [0,2,2,2,0,2,2,2,2,2,2,1,2,2,2,2,2,2,0,2,2,2,0], 
    [0,0,0,2,0,2,0,2,0,0,0,0,0,0,0,2,0,2,0,2,0,0,0], 
    [0,2,2,2,2,2,0,2,2,2,2,0,2,2,2,2,0,2,2,2,2,2,0], 
    [0,2,0,0,0,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0,0,2,0], 
    [0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,0], 
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 
];

// Estado de power mode
let powerMode = false;
let powerTimeout = null;
const POWER_DURATION = 8000; // ms

let dificultad = 0.4;

const codigoKonami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
const codigoKonami2 = ['w', 'w', 's', 's', 'a', 'd', 'a', 'd'];

const entradaTeclas = [];

const game = document.getElementById('game');

const pacman = { fila: 19, columna: 11 };
let score = 0;
let direccion = null;
let moving = false;
let moveInterval;
let posicion;

let tiempoInicio = null;
let tiempoTranscurrido = 0;
let timerInterval = null;

const vidas = document.getElementById('vidas');
// Vidas del jugador (mutable)
let vidasActuales = 3;

// Renderiza las vidas en el contenedor `#vidas`
function renderVidas() {
    // Limpiar contenedor antes de renderizar para evitar duplicados
    vidas.innerHTML = '';
    for (let i = 0; i < vidasActuales; i++) {
        const vidaImg = document.createElement('img');
        vidaImg.src = './public/corazones.png';
        vidaImg.classList.add('vida');
        vidas.appendChild(vidaImg);
    }
}

renderVidas();

let fantasmas = [
    { fila: 11, columna: 11, x: 11 * 24.8, y: 11 * 24.8, direccion: { fila: 0, columna: 1 }, color: 'red',    activo: false, tiempoActivacion: 0 },
    { fila: 12, columna: 11, x: 11 * 24.8, y: 12 * 24.8, direccion: { fila: 0, columna: -1 }, color: 'pink',   activo: false, tiempoActivacion: 6 },
    { fila: 12, columna: 10, x: 10 * 24.8, y: 12 * 24.8, direccion: { fila: 0, columna: 1 }, color: 'cyan',    activo: false, tiempoActivacion: 10 },
    { fila: 12, columna: 12, x: 12 * 24.8, y: 12 * 24.8, direccion: { fila: 0, columna: -1 }, color: 'orange', activo: false, tiempoActivacion: 14 }
];

// Inicializar targets
fantasmas.forEach(f => {
  f.targetX = f.x;
  f.targetY = f.y;
});

// Guardar estado inicial de los fantasmas para poder reubicarlos al perder vida
const ghostInitialState = fantasmas.map(f => ({ fila: f.fila, columna: f.columna, x: f.x, y: f.y, tiempoActivacion: f.tiempoActivacion }));
let ghostInterval = null;
let isRespawning = false;

const info = document.querySelector('.info');
const marcador = document.createElement('div');
marcador.classList.add('score');
marcador.classList.add('hidden');
marcador.innerText = `Score: ${score}`;
info.appendChild(marcador);

const timer = document.createElement('div');
timer.classList.add('timer');
timer.classList.add('hidden');
timer.innerText = `Tiempo: 0s`;
info.appendChild(timer);

const ready = document.createElement('div');
ready.classList.add('ready');
ready.innerText = `Presiona una flecha o WASD para comenzar`;
info.appendChild(ready);

const konamiText = document.createElement('div');
konamiText.classList.add('konamiText');
konamiText.classList.add('hidden');
konamiText.innerText = `¡Código Konami activado!`;
info.appendChild(konamiText);

// Crear mapa
for (let fila = 0; fila < mapa.length; fila++) {
    for (let columna = 0; columna < mapa[fila].length; columna++){
        const celda = document.createElement('div');
        celda.classList.add('cell');
        if (mapa[fila][columna] === 0) celda.classList.add('wall');
        if (mapa[fila][columna] === 1) celda.classList.add('path');
        if (mapa[fila][columna] === 2) celda.classList.add('dot');
        if (mapa[fila][columna] === 3) celda.classList.add('power');
        if (mapa[fila][columna] === 4) celda.classList.add('portal');
        game.appendChild(celda);
    }
}

// Crear Pac-Man
const pacmanDiv = document.createElement('div');
pacmanDiv.classList.add('pacman');
game.appendChild(pacmanDiv);

// Crear fantasmas
const ghostDivs = [];
fantasmas.forEach(f => {
    const ghostDiv = document.createElement('div');
    ghostDiv.classList.add('ghost', f.color);
    ghostDiv.style.display = 'block';
    ghostDiv.style.zIndex = 5;
    game.appendChild(ghostDiv);
    ghostDivs.push(ghostDiv);
});

// Actualizar posiciones
function actualizarPosicion() {
    const x = pacman.columna * 24.8;
    const y = pacman.fila * 24.8;
    let rotation = 0;
    if (direccion === 'up') rotation = -90;
    if (direccion === 'down') rotation = 90;
    if (direccion === 'left') rotation = -180;
    if (direccion === 'right') rotation = 0;
    pacmanDiv.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
}

actualizarPosicion();

function actualizarPosicionFantasmas() {
    fantasmas.forEach((f, i) => {
        ghostDivs[i].style.transform = `translate(${f.x}px, ${f.y}px)`;
        ghostDivs[i].style.display = 'block';
    });
}

actualizarPosicionFantasmas();

// Modo frightened (modo con poder)
function activarFrightenedMode() {
    fantasmas.forEach((f, i) => {
        f.frightened = true;
        f.frightenedTimer = Date.now() + 7000; // dura 7 segundos
        ghostDivs[i].classList.add('frightened');
    });
}

// Timer
function actualizarTimer() {
    if (tiempoInicio) {
        tiempoTranscurrido = Math.floor((Date.now() - tiempoInicio) / 1000);
        timer.innerText = `Tiempo: ${tiempoTranscurrido}s`;

        fantasmas.forEach((f, i) => {
            if (!f.activo && tiempoTranscurrido >= f.tiempoActivacion) {
                f.activo = true;
                f.salio = false;
                salirDeCentro(f, i);
            }
        });

        // Revisar fantasmas comidos para reingreso
        fantasmas.forEach((f, i) => {
            if (f.comido && f.reaparecerAt && Date.now() >= f.reaparecerAt) {
                // Revivir el fantasma en el centro
                f.comido = false;
                f.reaparecerAt = null;
                f.activo = true;
                f.salio = false;

                // Ubicarlo exactamente en el centro del corral
                const tam = 24.8;
                const centroFila = 12;
                const centroColumna = 11;
                f.x = centroColumna * tam;
                f.y = centroFila * tam;
                f.fila = centroFila;
                f.columna = centroColumna;
                f.targetX = f.x;
                f.targetY = f.y;
                f.direccion = { fila: 0, columna: 0 };

                // Mostrarlo visualmente
                ghostDivs[i].style.display = 'block';

                // Salida suave hacia el laberinto
                salirDeCentro(f, i);
            }
        });
    }
}

// --- NUEVA FUNCIÓN: salida suave del centro ---
function salirDeCentro(f, i) {
    const tamCelda = 24.8;
    const salidaFila = 7;
    const salidaColumna = 11;
    const destinoX = salidaColumna * tamCelda;
    const destinoY = salidaFila * tamCelda;

    const anim = setInterval(() => {
        const dx = destinoX - f.x;
        const dy = destinoY - f.y;
        const dist = Math.hypot(dx, dy);
        const step = 1.5;

        if (dist > 1) {
            f.x += (dx / dist) * step;
            f.y += (dy / dist) * step;
            ghostDivs[i].style.transform = `translate(${f.x}px, ${f.y}px)`;
        } else {
            clearInterval(anim);
            f.x = destinoX;
            f.y = destinoY;
            f.fila = salidaFila;
            f.columna = salidaColumna;
            f.salio = true;
            f.activo = true;
            f.targetX = destinoX;
            f.targetY = destinoY;
            f.direccion = { fila: 0, columna: 0 };
            ghostDivs[i].style.transform = `translate(${f.x}px, ${f.y}px)`;
        }
    }, 16);
}

// Movimiento Pac-Man
function moverPacman() {
    let nuevaFila = pacman.fila;
    let nuevaColumna = pacman.columna;
    if (direccion === 'up') nuevaFila--;
    if (direccion === 'down') nuevaFila++;
    if (direccion === 'left') nuevaColumna--;
    if (direccion === 'right') nuevaColumna++;

    if (mapa[nuevaFila][nuevaColumna] === 0) return;

    pacman.fila = nuevaFila;
    pacman.columna = nuevaColumna;
    actualizarPosicion();

    if (mapa[pacman.fila][pacman.columna] === 2) {
        const comerSound = new Audio('./assets/sounds/comer.mp3')
        comerSound.playbackRate = 1.7;
        comerSound.play();
        mapa[pacman.fila][pacman.columna] = 1;
        const index = pacman.fila * mapa[0].length + pacman.columna;
        const cell = game.children[index];
        cell.classList.remove('dot');
        cell.classList.add('path');
        score += 10;
        marcador.innerText = `Score: ${score}`;
    }

    // Consumo de pastilla de poder
    if (mapa[pacman.fila][pacman.columna] === 3) {
        // quitar la pastilla del mapa
        mapa[pacman.fila][pacman.columna] = 1;
        const index2 = pacman.fila * mapa[0].length + pacman.columna;
        const cell2 = game.children[index2];
        cell2.classList.remove('power');
        cell2.classList.add('path');

        // puntos por consumir pastilla (más que un punto normal)
        score += 10;
        marcador.innerText = `Score: ${score}`;

        // activar modo poder
        activarPowerMode();
        activarFrightenedMode();
    }

    if (mapa[pacman.fila][pacman.columna] === 4) {
        portal();
    }

    fantasmas.forEach((f, i) => {
        // Si el fantasma está en estado comestible
        if (f.activo && Math.abs(f.fila - pacman.fila) < 1 && Math.abs(f.columna - pacman.columna) < 1) {
            if (f.frightened) {
                // Comer al fantasma
                comerFantasma(f, i);
            } else {
                gameOver();
            }
        }
    });

    if (!mapa.flat().includes(2)) ganar();
}

// Devuelve la siguiente dirección óptima desde una posición hacia Pac-Man
function direccionHaciaPacman(filaInicio, colInicio, filaObjetivo, colObjetivo) {
    const filas = mapa.length;
    const columnas = mapa[0].length;
    const visitado = Array.from({ length: filas }, () => Array(columnas).fill(false));
    const cola = [];

    cola.push({ fila: filaInicio, col: colInicio, path: [] });
    visitado[filaInicio][colInicio] = true;

    const direcciones = [
        { fila: -1, col: 0, dir: 'up' },
        { fila: 1, col: 0, dir: 'down' },
        { fila: 0, col: -1, dir: 'left' },
        { fila: 0, col: 1, dir: 'right' }
    ];

    while (cola.length > 0) {
        const actual = cola.shift();
        if (actual.fila === filaObjetivo && actual.col === colObjetivo) {
            return actual.path[0]; // primera dirección del camino hacia Pac-Man
        }

        for (const d of direcciones) {
            const nf = actual.fila + d.fila;
            const nc = actual.col + d.col;
            if (
                nf >= 0 && nf < filas &&
                nc >= 0 && nc < columnas &&
                !visitado[nf][nc] &&
                mapa[nf][nc] !== 0 // no es muro
            ) {
                visitado[nf][nc] = true;
                cola.push({
                    fila: nf,
                    col: nc,
                    path: [...actual.path, d]
                });
            }
        }
    }

    return null; // si no hay camino posible
}

// Movimiento fantasmas
function moverFantasmas() {
    const velocidadBase = 1; // píxeles por frame (ajusta para velocidad normal)
    const FRIGHTENED_SPEED_FACTOR = 0.5; // multiplica velocidad cuando frightened (0.5 = mitad de velocidad)
    const tamCelda = 24.8;

    fantasmas.forEach((f, i) => {
        if (!f.activo || !f.salio) return;

        // --- Si ya hay un objetivo, muévete hacia él ---
        const dx = f.targetX - f.x;
        const dy = f.targetY - f.y;
        const distancia = Math.hypot(dx, dy);

        if (distancia > 0.1) {
            // ajustar velocidad según estado frightened
            const velocidad = f.frightened ? velocidadBase * FRIGHTENED_SPEED_FACTOR : velocidadBase;

            // Mover hacia el objetivo con velocidad constante
            const step = Math.min(velocidad, distancia);
            f.x += (dx / distancia) * step;
            f.y += (dy / distancia) * step;

            // Si queda menos que un step, poner exacto (snap)
            const restante = Math.hypot(f.targetX - f.x, f.targetY - f.y);
            if (restante < 0.5) {
                f.x = f.targetX;
                f.y = f.targetY;
            }

            // Actualizar visual mientras se mueve
            ghostDivs[i].style.transform = `translate(${f.x}px, ${f.y}px)`;
            // Colisión con Pac-Man durante movimiento
            const distPac = Math.hypot(f.x - pacman.columna * tamCelda, f.y - pacman.fila * tamCelda);
            if (distPac < 20) {
                if (f.frightened) {
                    // Pac-Man come al fantasma en movimiento
                    comerFantasma(f, i);
                } else {
                    gameOver();
                }
            }

            // No decidir nueva dirección hasta llegar al objetivo
            return;
        }

        // --- Si estamos en el centro (llegamos al target) decidimos la siguiente celda ---
        // Aseguramos estar exactamente alineados al centro de celda
        const filaActual = Math.round(f.y / tamCelda);
        const columnaActual = Math.round(f.x / tamCelda);
        f.fila = filaActual;
        f.columna = columnaActual;
        f.x = columnaActual * tamCelda;
        f.y = filaActual * tamCelda;
        ghostDivs[i].style.transform = `translate(${f.x}px, ${f.y}px)`;

        // Direcciones posibles
        const direcciones = [
            { fila: -1, columna: 0 }, // arriba
            { fila: 1, columna: 0 },  // abajo
            { fila: 0, columna: -1 }, // izquierda
            { fila: 0, columna: 1 }   // derecha
        ];

        // Filtrar direcciones válidas (no muros)
        let validas = direcciones.filter(d =>
            mapa[filaActual + d.fila] &&
            mapa[filaActual + d.fila][columnaActual + d.columna] !== 0
        );

        // Evitar 180° si hay otras opciones
        const opuesta = { fila: -f.direccion.fila, columna: -f.direccion.columna };
        const sinOpuesta = validas.filter(d => !(d.fila === opuesta.fila && d.columna === opuesta.columna));
        if (sinOpuesta.length > 0) validas = sinOpuesta;

        // Si no hay direcciones válidas (callejón cerrado), permitir la opuesta (vuelta atrás)
        if (validas.length === 0) {
            validas = direcciones.filter(d =>
                mapa[filaActual + d.fila] &&
                mapa[filaActual + d.fila][columnaActual + d.columna] !== 0
            );
        }

        // Si aún no hay ninguna válida (estamos completamente encerrados), quedamos quietos
        if (validas.length === 0) {
            f.direccion = { fila: 0, columna: 0 };
            f.targetX = f.x;
            f.targetY = f.y;
            return;
        }

        // "Inteligencia": 40% intenta acercarse al Pac-Man, 60% al azar
        let elegido;

        if (f.frightened) {
            // 🔹 Modo miedo: alejarse de Pac-Man
            const dx = pacman.columna - columnaActual;
            const dy = pacman.fila - filaActual;
            const distanciaPac = Math.hypot(dx, dy);

            // Buscar la dirección que más ALEJE al fantasma
            let maxDist = -Infinity;
            let mejor = validas[0];
            validas.forEach(d => {
                const nx = columnaActual + d.columna;
                const ny = filaActual + d.fila;
                const dist = Math.hypot(pacman.columna - nx, pacman.fila - ny);
                if (dist > maxDist) {
                    maxDist = dist;
                    mejor = d;
                }
            });
            elegido = mejor;
        } else {
            // 🔹 Modo normal: comportamiento original
            if (Math.random() < dificultad) {
                const dir = direccionHaciaPacman(filaActual, columnaActual, pacman.fila, pacman.columna, f);
                if (dir) {
                    elegido = { fila: dir.fila, columna: dir.col };
                } else {
                    elegido = validas[Math.floor(Math.random() * validas.length)];
                }
            } else {
                elegido = validas[Math.floor(Math.random() * validas.length)];
            }
        }

        // Fijar nueva dirección y objetivo (una celda adelante)
        f.direccion = { fila: elegido.fila, columna: elegido.columna };
        f.targetX = (columnaActual + elegido.columna) * tamCelda;
        f.targetY = (filaActual + elegido.fila) * tamCelda;

        // Por seguridad: si target es muro (no debería), cancelar
        const tfila = filaActual + elegido.fila;
        const tcol = columnaActual + elegido.columna;
        if (!mapa[tfila] || mapa[tfila][tcol] === 0 || mapa[tfila][tcol] === 4 ) {
            // evitar cruzar muros; dejar target en la celda actual
            f.targetX = f.x;
            f.targetY = f.y;
            f.direccion = { fila: 0, columna: 0 };
        }
        // Si la nueva dirección está bien, empezará a moverse en el siguiente frame (por el paso inicial de la función)
    });
}

// Funciones de fin
function gameOver() {
    // Evitar reentradas mientras ya estamos en respawn/animación
    if (isRespawning) return;

    // reducir vida y actualizar visual
    if (vidasActuales > 0) {
        vidasActuales--;
        renderVidas();
    }

    // Si ya no quedan vidas, finalizar partida
    if (vidasActuales === 0) {
        clearInterval(moveInterval);
        clearInterval(timerInterval);
        clearInterval(ghostInterval);
        new Audio('./assets/sounds/Muerte.mp3').play().catch(()=>{});
        const modal = document.getElementById('modal');
        modal.querySelector('.modal-h2').innerText = '¡Perdiste!';
        document.getElementById('finalTime').innerText = `Tiempo: ${tiempoTranscurrido}s`;
        modal.classList.remove('hidden');
        return;
    }

    // Si quedan vidas, reproducir sonido y hacer respawn
    isRespawning = true;
    // detener temporizadores de movimiento
    clearInterval(moveInterval);
    clearInterval(ghostInterval);

    // reproducir sonido de vida perdida (intenta evitar error de autoplay)
    new Audio('./assets/sounds/Muerte.mp3').play().catch(()=>{});

    // ocultar Pac-Man durante la animación de muerte
    pacmanDiv.classList.add('hidden');

    // breve pausa para mostrar la 'muerte'
    setTimeout(() => {
        // Reubicar Pac-Man a la posición inicial
        pacman.fila = 19;
        pacman.columna = 11;
        actualizarPosicion();

        // Reubicar fantasmas a su estado inicial y resetear flags
        fantasmas.forEach((f, i) => {
            const init = ghostInitialState[i];
            f.fila = init.fila;
            f.columna = init.columna;
            f.x = init.x;
            f.y = init.y;
            f.targetX = f.x;
            f.targetY = f.y;
            f.activo = false;
            f.salio = false;
            f.comido = false;
            f.frightened = false;
            ghostDivs[i].classList.remove('frightened');
            ghostDivs[i].style.display = 'block';
            ghostDivs[i].style.transform = `translate(${f.x}px, ${f.y}px)`;
        });

        // Mostrar Pac-Man y reanudar movimiento tras un pequeño retardo
        pacmanDiv.classList.remove('hidden');
        // reanudar intervalos
        moveInterval = setInterval(moverPacman, 400);
        ghostInterval = setInterval(moverFantasmas, 16);
        isRespawning = false;
    }, 1200);
}
// Activar modo poder: fantasmas se vuelven comestibles durante POWER_DURATION
function activarPowerMode() {

    new Audio('./assets/sounds/comerSuper.mp3').play();
    // limpiar timeout previo si existe
    if (powerTimeout) clearTimeout(powerTimeout);
    powerMode = true;
    // Marcar fantasmas como frightened visualmente y lógicamente
    fantasmas.forEach((f, i) => {
        f.frightened = true;
        // añadir clase visual
        ghostDivs[i].classList.add('frightened');
    });

    // Al expirar, devolverlos al estado normal
    powerTimeout = setTimeout(() => {
        powerMode = false;
        fantasmas.forEach((f, i) => {
            f.frightened = false;
            ghostDivs[i].classList.remove('frightened');
        });
        powerTimeout = null;
    }, POWER_DURATION);
}

// Comer un fantasma: sumar puntos, ocultarlo y reubicarlo en el centro (sera reingresado luego)
function comerFantasma(f, i) {
    // evitar comer múltiples veces
    if (f.comido) return;

    f.comido = true;
    f.frightened = false;
    ghostDivs[i].classList.remove('frightened');

    // sumar puntos
    score += 200;
    marcador.innerText = `Score: ${score}`;

    // ocultar temporalmente el fantasma
    ghostDivs[i].style.display = 'none';

    // reiniciar al centro del corral
    const tam = 24.8;
    const centroFila = 12;
    const centroColumna = 11;
    f.x = centroColumna * tam;
    f.y = centroFila * tam;
    f.fila = centroFila;
    f.columna = centroColumna;
    f.targetX = f.x;
    f.targetY = f.y;
    f.direccion = { fila: 0, columna: 0 };
    f.activo = false;
    f.salio = false;

    // reaparición programada
    f.reaparecerAt = Date.now() + 3000;
}

function ganar() {
    clearInterval(moveInterval);
    clearInterval(timerInterval);
    clearInterval(ghostInterval);
    const modal = document.getElementById('modal');
    modal.querySelector('.modal-h2').innerText = '¡Ganaste!';
    document.getElementById('finalTime').innerText = `Tiempo: ${tiempoTranscurrido}s`;
        document.getElementById('finalScore').innerText = `Puntaje: ${score}`;
    modal.classList.remove('hidden');
}

// Controles
document.addEventListener('keydown', e => {
    if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)) return;
    if (e.key === 'ArrowUp' || e.key === 'w') direccion = 'up';
    if (e.key === 'ArrowDown' || e.key === 's') direccion = 'down';
    if (e.key === 'ArrowLeft' || e.key === 'a') direccion = 'left';
    if (e.key === 'ArrowRight' || e.key === 'd') direccion = 'right';

    entradaTeclas.push(e.key);

    if (entradaTeclas.length > codigoKonami.length) entradaTeclas.shift();

    const correcto = codigoKonami.every((tecla, i) => tecla === entradaTeclas[i] ) ||
                     codigoKonami2.every((tecla, i) => tecla === entradaTeclas[i] );
    if (correcto) {
        console.log("🌀 Código Konami activado: Aumentando dificultad");
        dificultad = 0.9; // o cualquier efecto que quieras
        entradaTeclas.length = 0; // limpia el buffer para que no se repita
        konamiText.classList.remove('hidden');
    }
    
    // Iniciar movimiento al primer input
    ready.classList.add('hidden');
    marcador.classList.remove('hidden');
    timer.classList.remove('hidden');

    if (!moving) {
        moving = true;
        if (!tiempoInicio) {
            tiempoInicio = Date.now();
            timerInterval = setInterval(actualizarTimer, 100);
            ghostInterval = setInterval(moverFantasmas, 16);
        }
        moveInterval = setInterval(moverPacman, 350);
    }
});

document.getElementById('retry').addEventListener('click', () => location.reload());

function portal() {
    // Ocultar Pac-Man brevemente, teletransportar y luego mostrar
    pacmanDiv.classList.add('hidden');
    // pequeño retardo para que parezca desaparecer al cruzar
    setTimeout(() => {
        if (pacman.columna < 1) {
            pacman.columna = mapa[0].length - 1;
        } else if (pacman.columna > mapa[0].length - 2) {
            pacman.columna = 0;
        }
        // Actualizar su posición visual y volver a mostrar
        actualizarPosicion();
        pacmanDiv.classList.remove('hidden');
    }, 100); // ajustar ms si quieres un efecto más rápido/lento
}

document.addEventListener('click', function(){
    new Audio('./assets/sounds/inicio.mp3').play();
}, { once: true }); // Solo se ejecuta una vez

