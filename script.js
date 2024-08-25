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

    const [time, period] = currentTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;

    const totalSeconds = (hours * 3600) + (minutes * 60) + secondsToAdd;

    let newHours = Math.floor(totalSeconds / 3600) % 24;
    let newMinutes = Math.floor(totalSeconds % 3600 / 60);

    const newPeriod = newHours >= 12 ? 'PM' : 'AM';
    newHours = newHours % 12 || 12;

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

function formatTimeToAMPM(time) {
    let [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

function showTimePicker(inputId) {
    const input = document.getElementById(inputId);
    input.type = 'time';
    input.step = '60'; // Step to allow selecting minutes
    input.onblur = function() {
        const [hours, minutes] = input.value.split(':');
        let formattedTime = formatTimeToAMPM(`${hours}:${minutes}`);
        input.value = formattedTime;
        input.type = 'text'; // Switch back to text type after selection
    };
}

window.onload = loadHistory;
