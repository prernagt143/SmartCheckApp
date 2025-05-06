const attendanceData = [];

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');

// Start video stream from webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error('❌ Cannot access webcam:', err);
  });

function markAttendance() {
  const emailInput = document.getElementById('studentEmail');
  const result = document.getElementById('result');
  const email = emailInput.value.trim();

  if (!email || !email.endsWith('@navgurukul.org')) {
    result.textContent = '❌ Please enter a valid Navgurukul email address.';
    result.style.color = 'red';
    return;
  }

  // Capture the photo
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const photo = canvas.toDataURL('image/png'); // base64 image

  const now = new Date();
  const time = now.toLocaleTimeString();
  const date = now.toLocaleDateString();

  attendanceData.push({ email, time, date });

  // Update the HTML table
  const table = document.getElementById('attendanceTable');
  const newRow = table.insertRow();
  newRow.insertCell(0).textContent = email;
  newRow.insertCell(1).textContent = time;

  result.style.color = '#2e7d32';
  result.textContent = `✅ Marked successfully at ${time}`;
  emailInput.value = '';

  // Send data to Google Sheets via Apps Script Web App
  const formData = new FormData();
  formData.append('email', email);
  formData.append('time', time);
  formData.append('date', date);
  formData.append('photo', photo);

  fetch('https://script.google.com/macros/s/AKfycbx6rvE1Z6hqnsmyUYOgsLBQFl3R1q9uUnBeh7-8wVTJyE4MBrXBcJfCbyieLTg-o5Wy/exec', {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  })
    .then(() => {
      console.log('✅ Attendance + Photo sent to Google Sheet.');
    })
    .catch((error) => {
      console.error('❌ Error sending attendance:', error);
    });
}
