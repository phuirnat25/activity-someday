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

    const historyRef = firebase.database().ref('history/' + inputId);
    historyRef.push({
        inputId: inputId,
        newTime: newTime
    });
}

function getLastTimeFromHistory(inputId) {
    // This function is no longer needed for localStorage, but you can adapt it for Firebase if necessary
    return null;
}

function loadDefaultTimes() {
    return [
        { activity: "Capture Flag", time: "01:00 AM" },
        { activity: "Capture Flag", time: "11:00 AM" },
        { activity: "Airdrop", time: "03:00 PM" },
        { activity: "Capture Flag", time: "05:00 PM" },
        { activity: "Airdrop", time: "09:00 PM" },
        { activity: "Capture Flag", time: "10:30 PM" }
    ];
}

function loadHistoryFromFirebase() {
    const historyRef = firebase.database().ref('history');
    historyRef.on('value', (snapshot) => {
        const historyData = snapshot.val();
        if (historyData) {
            Object.keys(historyData).forEach(inputId => {
                const historyContainer = document.getElementById(`${inputId}-history`);
                historyContainer.innerHTML = ''; // ล้างข้อมูลเก่า
                Object.values(historyData[inputId]).forEach(item => {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    const formattedTime = formatTimeToAMPM(item.newTime);
                    historyItem.textContent = `${formattedTime}`;
                    historyContainer.insertBefore(historyItem, historyContainer.firstChild);
                });
            });
        }
    });
}

function loadDashboardFromFirebase() {
    const historyRef = firebase.database().ref('history');
    historyRef.once('value', (snapshot) => {
        const historyData = snapshot.val();
        let allTimes = loadDefaultTimes(); // เริ่มต้นด้วยข้อมูล Default

        if (historyData) {
            const lastTimes = {};

            Object.keys(historyData).forEach(inputId => {
                let latestTime = '';
                Object.values(historyData[inputId]).forEach(item => {
                    if (!latestTime || latestTime < item.newTime) {
                        latestTime = item.newTime;
                    }
                });
                lastTimes[inputId] = latestTime;
            });

            // แปลงข้อมูลจาก Firebase เป็นรูปแบบเดียวกับข้อมูล Default
            const firebaseTimes = Object.entries(lastTimes).map(([inputId, time]) => {
                const activity = inputId.charAt(0).toUpperCase() + inputId.slice(1).replace('-', ' ');
                return { activity, time: formatTimeToAMPM(time) };
            });

            // รวมข้อมูล Firebase กับข้อมูล Default
            allTimes = allTimes.concat(firebaseTimes);
        }

        // จัดเรียงข้อมูลทั้งหมดตามเวลา
        allTimes.sort((a, b) => {
            const timeA = parseTime(a.time);
            const timeB = parseTime(b.time);
            return timeA - timeB;
        });

        // แสดงข้อมูลในตาราง
        const tbody = document.querySelector('#history-table tbody');
        tbody.innerHTML = ''; // ล้างข้อมูลเก่า

        const now = new Date();
        let closestTimeDiff = Infinity;
        let closestTimeRow = null;

        allTimes.forEach(({ activity, time }) => {
            const row = document.createElement('tr');
            const activityCell = document.createElement('td');
            activityCell.textContent = activity;

            const timeCell = document.createElement('td');
            timeCell.textContent = time;

            // คำนวณเวลาปัจจุบัน
            const timeDiff = Math.abs(parseTime(time) - (now.getHours() * 60 + now.getMinutes()));
            if (timeDiff < closestTimeDiff && parseTime(time) >= (now.getHours() * 60 + now.getMinutes())) {
                closestTimeDiff = timeDiff;
                closestTimeRow = timeCell;
            }

            row.appendChild(activityCell);
            row.appendChild(timeCell);

            tbody.appendChild(row);
        });

        // Highlight ช่องเวลาที่กำลังจะถึง
        if (closestTimeRow) {
            closestTimeRow.classList.add('highlight-upcoming');
        }
    });
}


function clearHistory(inputId) {
    firebase.database().ref('history/' + inputId).remove();

    const historyContainer = document.getElementById(`${inputId}-history`);
    historyContainer.innerHTML = '';
}

function formatTimeToAMPM(time) {
    let [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

function parseTime(timeStr) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) {
        hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
        hours = 0;
    }

    return hours * 60 + minutes;
}

window.onload = function() {
    loadDashboardFromFirebase();
};