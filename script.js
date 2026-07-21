// ROUTING
function switchView(viewId, btn) {
  document
    .querySelectorAll(".view-section")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById(viewId).classList.add("active");
  if (btn) {
    document
      .querySelectorAll("nav button")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  }
}

function openPaywall() {
  document.getElementById("paywallModal").style.display = "flex";
}
function closePaywall() {
  document.getElementById("paywallModal").style.display = "none";
}

// THREAT CANVAS RADAR
const canvas = document.getElementById("threatMapCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  if (!canvas.parentElement) return;
  canvas.width = canvas.parentElement.clientWidth - 40;
  canvas.height = 320;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let blips = [];
// --- UPDATED THREAT CANVAS RADAR (TRANSPARENT OVERLAY) ---
function drawMap() {
  // Clear the canvas each frame to allow the CSS background map to show through
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Grid Lines over the map
  ctx.strokeStyle = "rgba(0, 243, 255, 0.06)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Spawn threat pulses randomly
  if (Math.random() < 0.06) {
    blips.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 2,
      maxRadius: 20 + Math.random() * 25,
      color: Math.random() > 0.4 ? "#ff0055" : "#00f3ff",
    });
  }

  // Animate threat pulses
  blips.forEach((b, i) => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner glowing core dot
    ctx.beginPath();
    ctx.arc(b.x, b.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();

    b.radius += 0.7;
    if (b.radius > b.maxRadius) blips.splice(i, 1);
  });

  requestAnimationFrame(drawMap);
}
drawMap();

// REAL TIME THREAT FEED
const attackTypes = [
  "DDoS Syn-Flood",
  "Brute Force SSH",
  "SQLi Injection",
  "Ransomware Callback",
  "XSS Payload",
];
const ips = ["192.168.1.45", "10.0.4.12", "185.220.101.5", "45.33.32.156"];
const countries = ["US", "DE", "CN", "RU", "BR", "JP"];

function generateThreatLog() {
  const feed = document.getElementById("threatFeed");
  if (!feed) return;

  const attack = attackTypes[Math.floor(Math.random() * attackTypes.length)];
  const src = ips[Math.floor(Math.random() * ips.length)];
  const country = countries[Math.floor(Math.random() * countries.length)];

  const item = document.createElement("div");
  item.className = "feed-item";
  item.innerHTML = `<strong>[${new Date().toLocaleTimeString()}]</strong> ${attack} targeted from ${src} (${country})`;

  feed.prepend(item);
  if (feed.children.length > 8) feed.removeChild(feed.lastChild);
}
setInterval(generateThreatLog, 2500);

// INTERACTIVE QUIZ ENGINE
const quizData = [
  {
    q: "Which command in Linux changes file ownership?",
    options: ["chmod", "chown", "sudo", "usermod"],
    correct: 1,
  },
  {
    q: "In Cisco IOS, which mode allows global configuration changes?",
    options: [
      "User EXEC mode",
      "Privileged EXEC mode",
      "Global Configuration mode",
      "Interface mode",
    ],
    correct: 2,
  },
  {
    q: "What layer of the OSI model does Wireshark primarily inspect?",
    options: [
      "Layer 1 to Layer 7",
      "Layer 3 only",
      "Layer 4 only",
      "Layer 7 only",
    ],
    correct: 0,
  },
];

let currentQ = 0;
let score = 0;

function loadQuiz() {
  const qData = quizData[currentQ];
  document.getElementById("quizProgress").innerText =
    `Question ${currentQ + 1} of ${quizData.length}`;
  document.getElementById("quizQuestion").innerText = qData.q;

  const optionsBox = document.getElementById("quizOptions");
  optionsBox.innerHTML = "";

  qData.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-opt-btn";
    btn.innerText = `${idx + 1}. ${opt}`;
    btn.onclick = () => selectAnswer(idx, btn);
    optionsBox.appendChild(btn);
  });
  document.getElementById("nextQuizBtn").style.display = "none";
}

function selectAnswer(idx, btn) {
  const qData = quizData[currentQ];
  const allBtns = document.querySelectorAll(".quiz-opt-btn");
  allBtns.forEach((b) => (b.disabled = true));

  if (idx === qData.correct) {
    btn.classList.add("correct");
    score++;
  } else {
    btn.classList.add("wrong");
    allBtns[qData.correct].classList.add("correct");
  }
  document.getElementById("nextQuizBtn").style.display = "block";
}

function nextQuestion() {
  currentQ++;
  if (currentQ < quizData.length) {
    loadQuiz();
  } else {
    document.getElementById("quizBox").innerHTML = `
      <h2 style="color:var(--accent-green); font-family:var(--font-mono);">QUIZ COMPLETE!</h2>
      <p style="margin: 1rem 0;">You scored ${score} out of ${quizData.length}.</p>
      <button class="btn-action" onclick="location.reload()">Restart Quiz</button>
    `;
  }
}
loadQuiz();

// EXPANDED TERMINAL CLI ENGINE
let currentMode = "bash";
let ciscoState = "user"; // 'user', 'privileged', 'config'

function changeCliMode(mode) {
  currentMode = mode;
  const prompt = document.getElementById("cliPrompt");
  const output = document.getElementById("terminalOutput");

  if (mode === "cisco") {
    ciscoState = "user";
    prompt.innerText = "Router>";
    output.innerText +=
      '\n\nSwitched to Cisco IOS Interface.\nType "enable" to enter privileged EXEC mode.\n';
  } else {
    prompt.innerText = "user@cyberlab:~$";
    output.innerText += "\n\nSwitched to Linux / Bash Environment.\n";
  }
}

function handleTerminalKey(e) {
  if (e.key === "Enter") {
    const input = e.target.value.trim();
    const output = document.getElementById("terminalOutput");
    const promptText = document.getElementById("cliPrompt").innerText;

    output.innerText += `\n${promptText} ${input}`;
    if (input !== "") processCommand(input);

    e.target.value = "";
    output.scrollTop = output.scrollHeight;
  }
}

function processCommand(cmd) {
  const output = document.getElementById("terminalOutput");
  const lower = cmd.toLowerCase();

  if (currentMode === "bash") {
    if (lower === "help") {
      output.innerText +=
        "\nAvailable Commands: help, clear, whoami, nmap, cat lesson1.txt, ls";
    } else if (lower === "clear") {
      output.innerText = "";
    } else if (lower === "whoami") {
      output.innerText += "\ncyberlab_student (Security Trainee)";
    } else if (lower === "ls") {
      output.innerText += "\nlesson1.txt   network_scan.sh   exploit.py";
    } else if (lower === "cat lesson1.txt") {
      output.innerText +=
        "\n[LESSON 1]: Permissions division: User, Group, Others (chmod 755).";
    } else if (lower.startsWith("nmap")) {
      output.innerText +=
        "\nStarting Nmap scan on target...\nPORT     STATE SERVICE\n22/tcp   open  ssh\n80/tcp   open  http";
    } else {
      output.innerText += `\nbash: command not found: ${cmd}`;
    }
  } else if (currentMode === "cisco") {
    const prompt = document.getElementById("cliPrompt");

    if (lower === "help") {
      output.innerText +=
        "\nAvailable IOS Commands: enable, configure terminal, vlan [id], show ip interface brief, exit";
    } else if (lower === "enable" && ciscoState === "user") {
      ciscoState = "privileged";
      prompt.innerText = "Router#";
      output.innerText += "\nEntered Privileged EXEC Mode.";
    } else if (
      (lower === "configure terminal" || lower === "conf t") &&
      ciscoState === "privileged"
    ) {
      ciscoState = "config";
      prompt.innerText = "Router(config)#";
      output.innerText += "\nEntered Global Configuration mode.";
    } else if (lower.startsWith("vlan ") && ciscoState === "config") {
      const vlanId = cmd.split(" ")[1];
      output.innerText += `\nCreated VLAN ${vlanId}.`;
    } else if (lower === "show ip interface brief") {
      output.innerText +=
        "\nInterface          IP-Address      OK? Method Status                  Protocol\nGigabitEthernet0/0 192.168.1.1     YES manual up                      up\nGigabitEthernet0/1 unassigned      YES unset  administratively down   down";
    } else if (lower === "exit") {
      if (ciscoState === "config") {
        ciscoState = "privileged";
        prompt.innerText = "Router#";
      } else if (ciscoState === "privileged") {
        ciscoState = "user";
        prompt.innerText = "Router>";
      }
    } else {
      output.innerText += `\n% Invalid input detected at '^' marker.`;
    }
  }
}
