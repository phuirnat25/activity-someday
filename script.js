function addSeconds(inputId, secondsToAdd) {
    const input = document.getElementById(inputId);
    let currentTime = input.value;

    if (!currentTime) {
        currentTime = getLastTimeFromHistory(inputId);
        if (!currentTime) {
            alert('Please set a time first.');
            return;
        }
    }

    let [time, period] = currentTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;

    const totalSeconds = (hours * 3600) + (minutes * 60) + secondsToAdd;

    let newHours = Math.floor(totalSeconds / 3600) % 24;
    let newMinutes = Math.floor(totalSeconds % 3600 / 60);
    let newPeriod = newHours >= 12 ? 'PM' : 'AM';

    if (newHours > 12) newHours -= 12;
    if (newHours === 0) newHours = 12;

    input.value = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')} ${newPeriod}`;
    saveHistory(inputId, input.value);
}

function saveHistory(inputId, newTime) {
    const historyContainer = document.getElementById(`${inputId}-history`);
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.textContent = `${newTime}`;
    historyContainer.insertBefore(historyItem, historyContainer.firstChild);

    const history = JSON.parse(localStorage.getItem('history')) || [];
    history.push({ inputId, newTime });
    localStorage.setItem('history', JSON.stringify(history));
}

function getLastTimeFromHistory(inputId) {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].inputId === inputId) {
            return history[i].newTime;
        }
    }
    return null;
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('history')) || [];

    history.forEach(item => {
        const historyContainer = document.getElementById(`${item.inputId}-history`);
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = `${item.newTime}`;
        historyContainer.insertBefore(historyItem, historyContainer.firstChild);
    });
}

function clearHistory(inputId) {
    let history = JSON.parse(localStorage.getItem('history')) || [];
    history = history.filter(item => item.inputId !== inputId);
    localStorage.setItem('history', JSON.stringify(history));

    const historyContainer = document.getElementById(`${inputId}-history`);
    historyContainer.innerHTML = '';
}

window.onload = loadHistory;
