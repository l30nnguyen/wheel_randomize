// wheel.js

// Get canvas element and context
var canvas = document.getElementById('wheelCanvas');
var ctx = canvas.getContext('2d');


// Variables for the wheel
var names = [];
var startAngle = 0;
var arc = 0;
var spinTimeout = null;
var spinTime = 0;
var spinTimeTotal = 0;

// Variables for spinning animation
var totalRotation = 0;
var initialStartAngle = 0;

// Rigged winner variables
var isRigging = false;
var riggedWinner = '';
var riggedInput = '';

let triggerMode = false;
let triggerNumber = '';
let isInputFocused = false;

// Add event listeners for input focus and blur
document.getElementById('namesInput').addEventListener('focus', () => {
  isInputFocused = true;
});

document.getElementById('namesInput').addEventListener('blur', () => {
  isInputFocused = false;
});

// Modify the keydown event listener
document.addEventListener('keydown', (event) => {
  if (!isInputFocused) {
    if (event.code === 'Space') {
      event.preventDefault(); // Prevent default space bar behavior
      triggerMode = !triggerMode;
      triggerNumber = '';
      console.log(triggerMode ? 'Trigger mode activated' : 'Trigger mode deactivated');
    } else if (triggerMode && event.key >= '0' && event.key <= '9') {
      triggerNumber += event.key;
      console.log('Current trigger number:', triggerNumber);
    }
  }
});

// Set canvas dimensions based on viewport
function setCanvasSize() {
  var containerWidth = canvas.parentElement.clientWidth;
  var containerHeight = window.innerHeight;

  var size = Math.min(containerWidth, containerHeight * 0.8); // Increased from 0.7

  canvas.width = size;
  canvas.height = size;

  console.log('Canvas size:', size);
}

function resetResult() {
  let table = document.getElementById("dynamicTable");
  table.innerHTML = "";
  document.getElementById("columnsInput").value = 1;
  document.getElementById('namesInput').value = "";
  document.getElementById('dynamicTable').classList.remove('show');
  drawWheel();
    setTimeout(() => {
      canvas.classList.remove("hidden"); // Apply fade-in effect
    }, 10);
}

// Function to update the wheel with names
function updateWheel() {
  var columns = document.getElementById("columnsInput").value;
  var input = document.getElementById('namesInput').value;
  names = input.split('\n'); // Split by line breaks
  names = names.map(function(name) {
    return name.trim();
  });
  names = names.filter(function(name) {
    return name !== '';
  });
  startAngle = 0; // Reset the start angle
  setCanvasSize(); // Update canvas size
  drawWheel();
  // Save names to localStorage
  localStorage.setItem('tableCol', columns);
  localStorage.setItem('wheelNames', JSON.stringify(names));
  console.log('Wheel updated with names:', names);
  console.log('Table update with columns :', columns);
}

function generateHeaders(n) {
  let headers = [];
  for (let i = 0; i < n; i++) {
    headers.push(String.fromCharCode(65 + i));
  }
  return headers;
}

function drawTable(item_list) {
  let columns = Math.max(1, document.getElementById("columnsInput").value);
  let headers = generateHeaders(columns)
  let rows = item_list.length/columns;
  let table = document.getElementById("dynamicTable");
  table.innerHTML = "";

  let thead = document.createElement("thead");
  let headerRow = document.createElement("tr");
  headers.forEach(header => {
    let th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  for (let i = 0; i < rows; i++) {
    let tr = document.createElement("tr");
    for (let j = 0; j < columns; j++) {
      let td = document.createElement("td");
      let input = document.createElement("input");
      input.type = "text";
      if(item_list[i * columns + j])
        input.placeholder = `${item_list[i * columns + j]}`;
      else
        input.placeholder = "";
      input.oninput = () => updateTableContent(); // Call function on input
      td.appendChild(input);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

function updateTableContent() {
  let table = document.getElementById("dynamicTable");
  let content = [];

  // Loop through table rows
  for (let i = 0; i < table.rows.length; i++) {
    let rowData = [];
    for (let j = 0; j < table.rows[i].cells.length; j++) {
      let cellInput = table.rows[i].cells[j].querySelector("input");
      rowData.push(cellInput ? cellInput.value : "");
    }
    content.push(rowData);
  }

  console.log("Table Content:", content); // Log table data to console
}

// Function to draw the wheel
function drawWheel() {
  // Adjusted to use dynamic canvas size
  var outsideRadius = canvas.width / 2 - 20;
  var textRadius = outsideRadius - 30;
  var insideRadius = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (names.length === 0) {
    // If no names are available, display a message
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('No names available!', canvas.width / 2 - ctx.measureText('No names available!').width / 2, canvas.height / 2);
    return;
  }

  var numSegments = names.length;
  arc = 2 * Math.PI / numSegments;

  for (var i = 0; i < numSegments; i++) {
    var angle = startAngle + i * arc;
    var color = getColor(i, numSegments);
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(canvas.width / 2, canvas.height / 2, outsideRadius, angle, angle + arc, false);
    ctx.lineTo(canvas.width / 2, canvas.height / 2);
    ctx.fill();

    // Convert HSL to RGB for text color calculation
    var rgb = hslToRgb(i * (360 / numSegments) / 360, 1, 0.5);
    var rgbString = 'rgb(' + Math.round(rgb.r * 255) + ',' + Math.round(rgb.g * 255) + ',' + Math.round(rgb.b * 255) + ')';
    var textColor = getContrastingTextColor(rgbString);

    ctx.fillStyle = textColor;
    ctx.save();
    ctx.translate(
        canvas.width / 2 + Math.cos(angle + arc / 2) * textRadius,
        canvas.height / 2 + Math.sin(angle + arc / 2) * textRadius
    );
    ctx.rotate(angle + arc / 2 + Math.PI / 2);
    var text = names[i];
    ctx.font = 'bold ' + Math.max(12, outsideRadius / 15) + 'px Arial';
    ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
    ctx.restore();
  }

  // Draw arrow pointing down at the top of the wheel
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 10, canvas.height / 2 - (outsideRadius + 20));
  ctx.lineTo(canvas.width / 2 + 10, canvas.height / 2 - (outsideRadius + 20));
  ctx.lineTo(canvas.width / 2, canvas.height / 2 - (outsideRadius + 10));
  ctx.closePath();
  ctx.fill();
}

// Function to generate colors for the wheel segments
function getColor(item, maxitem) {
  var hue = item * (360 / maxitem);
  return 'hsl(' + hue + ', 100%, 50%)';
}

// Function to determine the contrasting text color
function getContrastingTextColor(backgroundColor) {
  // Extract RGB values from the background color string
  var rgb = backgroundColor.match(/\d+/g).map(Number);
  
  // Calculate relative luminance
  var luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;

  // Return black for light backgrounds and white for dark backgrounds
  return luminance > 0.5 ? 'black' : 'white';
}

// Function to convert HSL to RGB
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: r,
    g: g,
    b: b
  };
}

// Function to start spinning the wheel
function spin() {
    if (names.length === 0) {
      alert("No names available to spin!");
      return;
    }
  
    spinTime = 0;
    spinTimeTotal = 5000; // Total spin time in milliseconds
    initialStartAngle = startAngle;
  
    var rotations = Math.floor(Math.random() * 3) + 3; // 3 to 5 rotations
  
    if (triggerMode && triggerNumber !== '') {
      const index = parseInt(triggerNumber) - 1;
      if (index >= 0 && index < names.length) {
        console.log('Triggering spin to:', names[index]);
        var desiredAngle = (names.length - index) * arc - (arc / 2);
        desiredAngle = desiredAngle % (2 * Math.PI);
  
        var currentAngle = (startAngle + Math.PI / 2) % (2 * Math.PI); // Adjust for arrow at 90 degrees
  
        var angleDifference = (desiredAngle - currentAngle + 2 * Math.PI) % (2 * Math.PI);
  
        totalRotation = rotations * 2 * Math.PI + angleDifference;
      } else {
        console.log('Invalid trigger number, spinning randomly');
        totalRotation = rotations * 2 * Math.PI + Math.random() * 2 * Math.PI;
      }
      triggerMode = false;
      triggerNumber = '';
    } else {
      totalRotation = rotations * 2 * Math.PI + Math.random() * 2 * Math.PI;
    }

  // Disable spin button
  document.getElementById('spinBtn').disabled = true;
  document.getElementById('resetBtn').disabled = true;
  setTimeout(() => {
    canvas.classList.remove("hidden"); // Apply fade-in effect
  }, 10);
  rotateWheel();
  document.getElementById('dynamicTable').classList.add('show');
}

// Function to rotate the wheel
function rotateWheel() {
  spinTime += 30;
  if (spinTime >= spinTimeTotal) {
    startAngle = initialStartAngle + totalRotation;
    startAngle = startAngle % (2 * Math.PI); // Normalize the angle
    stopRotateWheel();
    return;
  }

  var t = spinTime / spinTimeTotal;
  var easedT = easeOut(t);

  startAngle = initialStartAngle + easedT * totalRotation;
  drawWheel();
  drawTable(shuffleNames(names));
  spinTimeout = setTimeout(rotateWheel, 30);
}

function shuffleNames(data_list) {
  let shuffled = [...data_list]; // Copy the original array
  for (let i = shuffled.length - 1; i > 0; i--) {
    let j = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (2 ** 32) * (i + 1)); // Secure random index
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
  }
  return shuffled;
}

// Function to stop the wheel and display the selected name
function stopRotateWheel() {
  console.log('Stopping wheel rotation');
  clearTimeout(spinTimeout);

  // Clear the rigged winner after spinning
  riggedWinner = '';

  // Enable spin button
  document.getElementById('spinBtn').disabled = false;
  document.getElementById('resetBtn').disabled = false;
  canvas.classList.add("hidden"); // Hide with fade-out
  // console.log('Starting fireworks');
  // startFireworks();

  // Redraw the wheel after a delay
  // setTimeout(() => {
  //   console.log('Redrawing wheel after fireworks');
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);
  //   drawWheel();
  // }, 3000);
}

// Easing function for spin animation
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Load names from localStorage on page load
window.addEventListener('load', function() {
  setCanvasSize();
  var columns = localStorage.getItem("tableCol");
  var storedNames = localStorage.getItem('wheelNames');
  if (storedNames) {
    names = JSON.parse(storedNames);
    document.getElementById('namesInput').value = names.join('\n');
    document.getElementById("columnsInput").value = columns;
    startAngle = 0;
    drawWheel();
  } else {
    // Initial draw if no names are in localStorage
    drawWheel();
  }
});

// Adjust canvas size on window resize
window.addEventListener('resize', function() {
  setCanvasSize();
  drawWheel();
});

// Make sure the event listener is properly set
document.getElementById('updateWheelBtn').addEventListener('click', updateWheel);
document.getElementById('spinBtn').addEventListener('click', spin);
document.getElementById('resetBtn').addEventListener('click', resetResult);

// Function to create a firework
function createFirework(x, y) {
  const firework = document.createElement('div');
  firework.className = 'firework';
  firework.style.left = `${x}px`;
  firework.style.top = `${y}px`;

  const colors = ['#ff0', '#ff3', '#f90', '#f09', '#90f', '#0ff', '#f0f', '#0f0'];
  
  for (let i = 0; i < 80; i++) { // Tăng số lượng hạt từ 50 lên 80
    const particle = document.createElement('div');
    particle.className = 'particle';
    const color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.backgroundColor = color;
    
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 80 + 80; // Tăng tốc độ và khoảng cách
    const translateY = Math.sin(angle) * speed;
    const translateX = Math.cos(angle) * speed;
    
    particle.style.setProperty('--translateY', `${translateY}px`);
    particle.style.setProperty('--translateX', `${translateX}px`);
    
    firework.appendChild(particle);
  }

  document.getElementById('fireworks-container').appendChild(firework);

  setTimeout(() => {
    firework.remove();
  }, 1500); // Tăng thời gian hiển thị
}

// Function to start fireworks
function startFireworks() {
  const container = document.querySelector('.col-md-8');
  const containerRect = container.getBoundingClientRect();

  const fireworksInterval = setInterval(() => {
    for (let i = 0; i < 3; i++) { // Tạo 3 pháo hoa mỗi lần
      const x = Math.random() * containerRect.width;
      const y = Math.random() * containerRect.height;
      createFirework(x, y);
    }
  }, 200); // Giảm khoảng thời gian giữa các đợt pháo hoa

  setTimeout(() => {
    clearInterval(fireworksInterval);
  }, 3000);
}