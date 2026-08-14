/**
 * Sonidos del sorteo.
 * - Cuenta regresiva (3, 2, 1): reproduce sorteo.mp3 desde storage
 * - ¡YA! (0): detiene el MP3 y dispara el jackpot sintético
 */

// ─── MP3 de giro de rodillos ──────────────────────────────────────────────────

let reelAudio: HTMLAudioElement | null = null;

function startReelAudio(): void {
    reelAudio = new Audio('/storage/sorteo.mp3');
    reelAudio.loop = true;
    reelAudio.volume = 0.85;
    reelAudio.play().catch(() => {
        // El navegador puede bloquear audio sin interacción previa del usuario.
        // En este contexto el botón ya fue presionado, así que no debería fallar.
    });
}

function stopReelAudio(): void {
    if (!reelAudio) return;
    reelAudio.pause();
    reelAudio.currentTime = 0;
    reelAudio = null;
}

// ─── Jackpot sintético (¡YA!) ─────────────────────────────────────────────────

function getAudioContext(): AudioContext | null {
    try {
        return new AudioContext();
    } catch {
        return null;
    }
}

function scheduleBell(audioCtx: AudioContext, time: number, freq: number, vol = 0.38): void {
    [1, 2.756, 5.404].forEach((ratio, idx) => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq * ratio;
        const gain = audioCtx.createGain();
        const amp = vol / (idx + 1);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(amp, time + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 1.1 - idx * 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 1.2);
    });
}

function scheduleCoin(audioCtx: AudioContext, time: number): void {
    const sr = audioCtx.sampleRate;
    const len = Math.floor(sr * 0.035);
    const buf = audioCtx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.22));
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 4500 + Math.random() * 3500;
    bp.Q.value = 4;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
    src.connect(bp);
    bp.connect(gain);
    gain.connect(audioCtx.destination);
    src.start(time);
    src.stop(time + 0.04);
}

function playJackpot(audioCtx: AudioContext): void {
    const now = audioCtx.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
        scheduleBell(audioCtx, now + i * 0.13, freq);
    });
    for (let i = 0; i < 20; i++) {
        scheduleCoin(audioCtx, now + 0.04 + i * 0.07 + (Math.random() - 0.5) * 0.025);
    }
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Reproduce el sonido correspondiente al valor del conteo.
 * @param count - 3, 2, 1 → MP3 de tragamonedas · 0 → jackpot + detiene el MP3
 */
export function playCountdownSound(count: number): void {
    if (count === 3) {
        startReelAudio();
        return;
    }

    if (count === 0) {
        stopReelAudio();
        const ctx = getAudioContext();
        if (ctx) playJackpot(ctx);
        return;
    }

    // count 2 y 1: el MP3 ya está corriendo, no hacer nada
}

/**
 * Detiene el audio del rodillo si estuviera corriendo
 * (por ejemplo si el usuario cierra el overlay antes de terminar).
 */
export function stopCountdownAudio(): void {
    stopReelAudio();
}
