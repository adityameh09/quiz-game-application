/* -----------------------
   Nature Quiz Game
   -----------------------
   - Randomized questions
   - Score tracking + best score (localStorage)
   - Progress bar
   - Per-question nature photo background
   - Review drawer to see your answers
   - Simple confetti on great scores
------------------------*/

// ====== Question Bank (edit/add freely) ======
const QUESTIONS = [
  {
    q: "Which data structure uses First-In-First-Out (FIFO) order?",
    choices: ["Stack", "Queue", "Tree", "Graph"],
    answer: 1
  },
  {
    q: "Which planet is known as the Red Planet?",
    choices: ["Venus", "Mars", "Jupiter", "Mercury"],
    answer: 1
  },
  {
    q: "In HTML, which tag is used to create a hyperlink?",
    choices: ["<link>", "<a>", "<href>", "<url>"],
    answer: 1
  },
  {
    q: "Time complexity of binary search on a sorted array?",
    choices: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    answer: 1
  },
  {
    q: "Which one is NOT an operating system?",
    choices: ["Linux", "Windows", "Oracle", "macOS"],
    answer: 2
  },
  {
    q: "The chemical symbol for Gold is:",
    choices: ["Ag", "Au", "Gd", "Go"],
    answer: 1
  },
  {
    q: "Who proposed the theory of relativity?",
    choices: ["Isaac Newton", "Albert Einstein", "Niels Bohr", "Galileo Galilei"],
    answer: 1
  },
  {
    q: "CSS stands for:",
    choices: [
      "Cascading Style Sheets",
      "Creative Style System",
      "Computer Styled Sections",
      "Colorful Style Sheets"
    ],
    answer: 0
  },
  {
    q: "Which device is used to convert AC to DC?",
    choices: ["Rectifier", "Transformer", "Amplifier", "Oscillator"],
    answer: 0
  },
  {
    q: "Which of the following sorting algorithms is stable?",
    choices: ["Selection Sort", "Quick Sort", "Merge Sort", "Heap Sort"],
    answer: 2
  },
  {
    q: "Which protocol is used to send web pages?",
    choices: ["FTP", "SMTP", "HTTP", "SSH"],
    answer: 2
  },
  {
    q: "Which data structure is best for implementing recursion?",
    choices: ["Queue", "Deque", "Stack", "Hash Table"],
    answer: 2
  },
];

// ====== Stunning Nature Backgrounds (Unsplash) ======
const NATURE_IMAGES = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80"
];

// ====== Elements ======
const questionText = document.getElementById("questionText");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const reviewBtn = document.getElementById("reviewBtn");
const questionCounter = document.getElementById("questionCounter");
const progressBar = document.getElementById("progressBar");
const liveScoreEl = document.getElementById("liveScore");
const bestScoreEl = document.getElementById("bestScore");

const resultModal = document.getElementById("resultModal");
const resultSummary = document.getElementById("resultSummary");
const resultProgress = document.getElementById("resultProgress");
const playAgainBtn = document.getElementById("playAgainBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

const reviewDrawer = document.getElementById("reviewDrawer");
const reviewList = document.getElementById("reviewList");
const closeReviewBtn = document.getElementById("closeReviewBtn");

const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");

// ====== State ======
let order = [];          // randomized index order
let current = 0;         // pointer in order[]
let score = 0;
let answered = false;
let userAnswers = [];    // {idx, chosen, correct}
let backgrounds = [];    // shuffled backgrounds

// ====== Utils ======
const shuffle = arr => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const setBackground = (step) => {
  const img = backgrounds[step % backgrounds.length];
  document.body.style.backgroundImage = `url("${img}")`;
};

const updateProgress = () => {
  const pct = ((current) / order.length) * 100;
  progressBar.style.width = `${pct}%`;
};

const loadBest = () => Number(localStorage.getItem("bestQuizScore") || 0);
const saveBest = (pct) => localStorage.setItem("bestQuizScore", String(pct));

// ====== Rendering ======
function renderQuestion() {
  const idx = order[current];
  const data = QUESTIONS[idx];

  // UI
  questionText.textContent = data.q;
  questionCounter.textContent = `Question ${current + 1}/${order.length}`;
  liveScoreEl.textContent = String(score);

  // Background swap
  setBackground(current);

  // Options
  optionsEl.innerHTML = "";
  const choiceOrder = shuffle(data.choices.map((c, i) => ({ text: c, i })));

  choiceOrder.forEach((choice, pos) => {
    const btn = document.createElement("button");
    btn.className = "btn option";
    btn.setAttribute("role", "option");
    btn.setAttribute("data-choice", String(choice.i));
    btn.setAttribute("aria-selected", "false");
    btn.textContent = choice.text;

    // keyboard select with Enter/Space
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleAnswer(choice.i, btn, data.answer);
      }
    });

    btn.addEventListener("click", () =>)

