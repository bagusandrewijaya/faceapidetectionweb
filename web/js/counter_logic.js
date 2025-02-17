// State counter
let counterValue = 0;
let secondsElapsed = 0;
let currentTime = "";

// Fungsi increment
function incrementCounter() {
    counterValue++;
    updateFlutterUI();
}

// Fungsi decrement
function decrementCounter() {
    counterValue--;
    updateFlutterUI();
}

// Fungsi untuk menghitung detik terus menerus
function startCountingSeconds() {
    setInterval(() => {
        secondsElapsed++;
        updateFlutterUI();
    }, 1000);
    
    // Start updating the current time every second
    setInterval(() => {
        updateCurrentTime();
    }, 1000);
}

// Fungsi untuk mendapatkan waktu saat ini
function updateCurrentTime() {
    const now = new Date();
    currentTime = now.toLocaleTimeString();
    updateFlutterUI();
}

// Update UI Flutter
function updateFlutterUI() {
    if (window.updateFlutterCounter) {
        window.updateFlutterCounter(counterValue);
    }
    if (window.updateFlutterSeconds) {
        window.updateFlutterSeconds(secondsElapsed);
    }
    if (window.updateFlutterTime) {
        window.updateFlutterTime(currentTime);
    }
}

function helloWorld() {
    return "Hello, WoSSrld!";
}

// Export fungsi ke global scope
window.incrementCounter = incrementCounter;
window.decrementCounter = decrementCounter;
window.startCountingSeconds = startCountingSeconds;