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

    const [hours, minutes] = currentTime.split(':').map(Number);
    const totalSeconds = (hours * 3600) + (minutes * 60) + secondsToAdd;

    const newHours = Math.floor(totalSeconds / 3600) % 24;
    const newMinutes = Math.floor(totalSeconds % 3600 / 60);

    input.value = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    saveHistory(inputId, input.value);
}

function saveHistory(inputId, newTime) {
    const historyContainer = document.getElementById(`${inputId}-history`);
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    const formattedTime = formatTimeToAMPM(newTime);
    historyItem.textContent = `${formattedTime}`;
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
        const formattedTime = formatTimeToAMPM(item.newTime);
        historyItem.textContent = `${formattedTime}`;
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

function formatTimeToAMPM(time) {
    let [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

window.onload = loadHistory;
