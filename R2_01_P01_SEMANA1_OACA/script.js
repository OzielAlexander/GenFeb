let timer;
let timeLeft = 25 * 60;
let isRunning = false;
let currentMode = 'pomo';
let sessions = 1;

const modeSettings = {
    pomo: { time: 25 * 60, color: '#ffb7c5', msg: "¡Hora De Chambear!" },
    short: { time: 5 * 60, color: '#c1e7e3', msg: "¡Tómate un descanso!" },
    long: { time: 15 * 60, color: '#c2d4ee', msg: "¡Tómate un descanso!" }
};

const display = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const statusMsg = document.getElementById('statusMsg');
const skipBtn = document.getElementById('skipBtn');
const resetBtn = document.getElementById('resetBtn');
const alarm = document.getElementById('alarmSound');

function updateDisplay() {
    let mins = Math.floor(timeLeft / 60);
    let secs = timeLeft % 60;
    const dMins = mins < 0 ? 0 : mins;
    const dSecs = secs < 0 ? 0 : secs;
    display.textContent = `${dMins.toString().padStart(2, '0')}:${dSecs.toString().padStart(2, '0')}`;
}

function switchMode(mode) {
    currentMode = mode;
    timeLeft = modeSettings[mode].time;
    document.body.className = `mode-${mode}`;
    statusMsg.textContent = modeSettings[mode].msg;
    startBtn.style.color = modeSettings[mode].color; 
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    stopTimer();
    updateDisplay();
}

function stopTimer() {
    clearInterval(timer);
    isRunning = false;
    startBtn.textContent = "Empezar";
    skipBtn.classList.add('hidden');
}

function startTimer() {
    if (isRunning) {
        stopTimer();
        return;
    }
    isRunning = true;
    startBtn.textContent = "STOP";
    skipBtn.classList.remove('hidden');

    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) {
            handleEnd(); // Llamamos a la lógica
        }
    }, 1000);
}

function handleEnd() {
    //sopt relojj
    stopTimer();
    updateDisplay();

    //Reproducir alarma
    if (alarm) {
        alarm.currentTime = 0; 
        alarm.play();
    }

    // confeti
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffffff', modeSettings[currentMode].color]
    });

    // 4. CAMBIO AUTOMÁTICO DE MODO
    let nextMode;
    if (currentMode === 'pomo') {
        sessions++;
        if (document.getElementById('sessionLabel')) {
            document.getElementById('sessionLabel').textContent = `#${sessions}`;
        }
        
        nextMode = (sessions % 4 === 0) ? 'long' : 'short';
    } else {
        nextMode = 'pomo';
    }

    // Cambiamos modo
    switchMode(nextMode);

    // Toast
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });

    Toast.fire({
        icon: 'success',
        title: currentMode === 'pomo' ? '¡Pomodoro terminado!' : '¡Descanso terminado!'
    });
}

// Botón Reiniciar
resetBtn.addEventListener('click', () => {
    stopTimer();
    timeLeft = modeSettings[currentMode].time;
    updateDisplay();
});

// Botón Adelantar 
skipBtn.addEventListener('click', () => {
    if (isRunning) {
        timeLeft = 0;
        handleEnd(); 
    }
});

// Tareas
document.getElementById('openModalBtn').addEventListener('click', async () => {
    const { value: task } = await Swal.fire({
        title: 'Nueva Tarea',
        input: 'text',
        confirmButtonColor: modeSettings[currentMode].color
    });
    if (task) {
        const div = document.createElement('div');
        div.className = 'task-item';
        div.innerHTML = `<span>${task}</span><button class="delete-task">✕</button>`;
        div.onclick = (e) => e.target.tagName !== 'BUTTON' && div.classList.toggle('completed');
        div.querySelector('.delete-task').onclick = () => div.remove();
        document.getElementById('taskList').appendChild(div);
    }
});

startBtn.addEventListener('click', startTimer);
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
});

// Inicialización
switchMode('pomo');