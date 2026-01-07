const STORAGE_KEY = "blackBookPlannerV1";
const THEME_KEY = "blackBookTheme";

const motivationLines = [
  "Power is built in the silent hours; show up anyway.",
  "You command the day or the day commands you.",
  "Clarity is kindness. Leadership is action.",
  "Discipline beats motivation; consistency builds empires.",
  "Execute the basics ruthlessly and everything grows.",
  "Focus is the weapon. Protect it.",
];

const defaultData = {
  goals: [],
  finances: [],
  tasks: [],
  core4Log: {},
  thresholds: [],
  calendarNotes: [],
  notes: {
    intention: "",
    wins: "",
  },
  reviews: {
    weekly: {
      wins: "",
      lessons: "",
      priorities: "",
    },
    quarterly: {
      wins: "",
      resets: "",
      focus: "",
    },
    weeklyHistory: [],
    quarterlyHistory: [],
  },
  checks: {
    clarity: false,
    feedback: false,
    momentum: false,
    rest: false,
  },
};

const state = loadData();

const goalForm = document.getElementById("goalForm");
const financeForm = document.getElementById("financeForm");
const taskForm = document.getElementById("taskForm");
const goalList = document.getElementById("goalList");
const financeList = document.getElementById("financeList");
const taskList = document.getElementById("taskList");
const goalSelect = taskForm.querySelector("select[name='goalId']");
const thresholdForm = document.getElementById("thresholdForm");
const thresholdList = document.getElementById("thresholdList");
const core4DateInput = document.getElementById("core4Date");
const core4Checks = [
  { key: "bodyTrain", id: "core4-body-train", label: "Body: Train 10+ min" },
  { key: "bodyFuel", id: "core4-body-fuel", label: "Body: Fuel with intention" },
  { key: "bodyRecover", id: "core4-body-recover", label: "Body: Recover" },
  { key: "beingMeditation", id: "core4-being-meditation", label: "Being: Meditation 10+ min" },
  { key: "beingGratitude", id: "core4-being-gratitude", label: "Being: Gratitude" },
  { key: "beingAlignment", id: "core4-being-alignment", label: "Being: Alignment" },
  { key: "balanceFamily", id: "core4-balance-family", label: "Balance: Family presence" },
  { key: "balanceRelationship", id: "core4-balance-relationship", label: "Balance: Relationship touchpoint" },
  { key: "balanceRest", id: "core4-balance-rest", label: "Balance: Rest" },
  { key: "businessExecution", id: "core4-business-execution", label: "Business: Execute priority" },
  { key: "businessRevenue", id: "core4-business-revenue", label: "Business: Revenue action" },
  { key: "businessLeadership", id: "core4-business-leadership", label: "Business: Leadership action" },
].map((item) => ({ ...item, el: document.getElementById(item.id) }));
const core4Notes = document.getElementById("core4Notes");
const dailyJournal = document.getElementById("dailyJournal");
const core4Score = document.getElementById("core4Score");
const core4Hint = document.getElementById("core4Hint");
const saveCore4Btn = document.getElementById("saveCore4Btn");
const weeklyWins = document.getElementById("weeklyWins");
const weeklyLessons = document.getElementById("weeklyLessons");
const weeklyPriorities = document.getElementById("weeklyPriorities");
const quarterWins = document.getElementById("quarterWins");
const quarterResets = document.getElementById("quarterResets");
const quarterFocus = document.getElementById("quarterFocus");
const saveWeeklyReviewBtn = document.getElementById("saveWeeklyReviewBtn");
const saveQuarterReviewBtn = document.getElementById("saveQuarterReviewBtn");
const calendarGrid = document.getElementById("calendarGrid");
const calendarLabel = document.getElementById("calendarLabel");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const calendarNoteForm = document.getElementById("calendarNoteForm");
const calendarNoteList = document.getElementById("calendarNoteList");
const calendarDateInput = document.getElementById("calendarDate");
const motivationLine = document.getElementById("motivationLine");
const newMotivationBtn = document.getElementById("newMotivationBtn");
const suggestionsEl = document.getElementById("suggestions");
const generatePlanBtn = document.getElementById("generatePlanBtn");
const availableHoursInput = document.getElementById("availableHours");
const startTimeInput = document.getElementById("startTime");
const dailyIntention = document.getElementById("dailyIntention");
const winTracker = document.getElementById("winTracker");
const saveNotesBtn = document.getElementById("saveNotesBtn");
const saveChecksBtn = document.getElementById("saveChecksBtn");
const themeToggle = document.getElementById("themeToggle");
const exportPdfBtn = document.getElementById("exportPdfBtn");

let calendarViewDate = new Date();

init();

function init() {
  applyTheme(loadTheme());
  renderAll();
  hookEvents();
  rotateMotivation();
  registerServiceWorker();
}

function hookEvents() {
  goalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formToObject(goalForm);
    state.goals.push({
      id: makeId(),
      title: data.title,
      motivation: data.motivation,
      target: Number(data.target || 100),
      progress: Number(data.progress || 0),
      priority: Number(data.priority || 3),
      dueDate: data.dueDate || "",
    });
    goalForm.reset();
    saveAndRender();
  });

  financeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formToObject(financeForm);
    state.finances.push({
      id: makeId(),
      title: data.title,
      motivation: data.motivation,
      target: Number(data.target || 0),
      starting: Number(data.starting || 0),
      transactions: [],
      priority: Number(data.priority || 3),
      dueDate: data.dueDate || "",
    });
    financeForm.reset();
    saveAndRender();
  });

  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formToObject(taskForm);
    state.tasks.push({
      id: makeId(),
      title: data.title,
      duration: Number(data.duration || 30),
      energy: data.energy || "medium",
      goalId: data.goalId || "",
      completed: false,
    });
    taskForm.reset();
    saveAndRender();
  });

  thresholdForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formToObject(thresholdForm);
    state.thresholds.push({
      id: makeId(),
      title: data.title,
      domain: data.domain || "Leadership",
      statement: data.statement,
      dueDate: data.dueDate || "",
      crossed: false,
    });
    thresholdForm.reset();
    saveAndRender();
  });

  newMotivationBtn.addEventListener("click", rotateMotivation);

  generatePlanBtn.addEventListener("click", () => {
    const hours = Number(availableHoursInput.value || 8);
    const startTime = startTimeInput.value || "09:00";
    const suggestions = buildAutoPlan(hours, startTime);
    renderSuggestions(suggestions);
  });

  saveNotesBtn.addEventListener("click", () => {
    state.notes.intention = dailyIntention.value.trim();
    state.notes.wins = winTracker.value.trim();
    saveData(state);
  });

  saveChecksBtn.addEventListener("click", () => {
    state.checks = {
      clarity: document.getElementById("chk-clarity").checked,
      feedback: document.getElementById("chk-feedback").checked,
      momentum: document.getElementById("chk-momentum").checked,
      rest: document.getElementById("chk-rest").checked,
    };
    saveData(state);
  });

  saveCore4Btn.addEventListener("click", () => {
    const dateKey = core4DateInput.value || formatDateKey(new Date());
    state.core4Log[dateKey] = {
      checks: Object.fromEntries(core4Checks.map((item) => [item.key, item.el.checked])),
      notes: core4Notes.value.trim(),
      journal: dailyJournal.value.trim(),
    };
    saveAndRender();
  });

  core4DateInput.addEventListener("change", () => {
    loadCore4ForDate(core4DateInput.value);
  });

  saveWeeklyReviewBtn.addEventListener("click", () => {
    const entry = {
      date: formatDateKey(new Date()),
      wins: weeklyWins.value.trim(),
      lessons: weeklyLessons.value.trim(),
      priorities: weeklyPriorities.value.trim(),
    };
    state.reviews.weekly = entry;
    state.reviews.weeklyHistory = state.reviews.weeklyHistory || [];
    state.reviews.weeklyHistory.push(entry);
    saveData(state);
  });

  saveQuarterReviewBtn.addEventListener("click", () => {
    const entry = {
      date: formatDateKey(new Date()),
      wins: quarterWins.value.trim(),
      resets: quarterResets.value.trim(),
      focus: quarterFocus.value.trim(),
    };
    state.reviews.quarterly = entry;
    state.reviews.quarterlyHistory = state.reviews.quarterlyHistory || [];
    state.reviews.quarterlyHistory.push(entry);
    saveData(state);
  });

  prevMonthBtn.addEventListener("click", () => {
    calendarViewDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1);
    renderCalendar();
  });

  nextMonthBtn.addEventListener("click", () => {
    calendarViewDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1);
    renderCalendar();
  });

  calendarNoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formToObject(calendarNoteForm);
    state.calendarNotes.push({
      id: makeId(),
      date: data.date,
      title: data.title,
      notes: data.notes || "",
    });
    calendarNoteForm.reset();
    saveAndRender();
  });

  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });

  exportPdfBtn.addEventListener("click", () => {
    exportToPdf();
  });
}

function renderAll() {
  renderGoals();
  renderFinances();
  renderTasks();
  renderGoalSelect();
  renderThresholds();
  renderNotes();
  renderChecks();
  renderCore4();
  renderReviews();
  renderCalendar();
  renderCalendarNotes();
}

function renderGoals() {
  goalList.innerHTML = "";
  if (!state.goals.length) {
    goalList.appendChild(emptyNote("No power goals yet. Add one to begin."));
    return;
  }
  state.goals.forEach((goal) => {
    const card = buildGoalCard(goal, "goal");
    goalList.appendChild(card);
  });
}

function renderFinances() {
  financeList.innerHTML = "";
  if (!state.finances.length) {
    financeList.appendChild(emptyNote("No financial goals yet. Add one to build wealth."));
    return;
  }
  state.finances.forEach((goal) => {
    const card = buildGoalCard(goal, "finance");
    financeList.appendChild(card);
  });
}

function renderTasks() {
  taskList.innerHTML = "";
  if (!state.tasks.length) {
    taskList.appendChild(emptyNote("No tasks planned yet."));
    return;
  }
  state.tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "card";
    const linkedGoal = findGoalTitle(task.goalId);
    card.innerHTML = `
      <div class="card__row">
        <strong>${escapeHtml(task.title)}</strong>
        <span class="pill">${task.duration} min</span>
      </div>
      <div class="card__row">
        <span>Energy: ${task.energy}</span>
        ${linkedGoal ? `<span class="pill">Goal: ${escapeHtml(linkedGoal)}</span>` : ""}
      </div>
      <div class="card__row">
        <label>
          <input type="checkbox" ${task.completed ? "checked" : ""} data-action="toggle-task" data-id="${task.id}" />
          Completed
        </label>
        <button class="btn btn--ghost" data-action="delete-task" data-id="${task.id}">Remove</button>
      </div>
    `;
    taskList.appendChild(card);
  });

  taskList.querySelectorAll("[data-action='toggle-task']").forEach((input) => {
    input.addEventListener("change", (event) => {
      const id = event.target.dataset.id;
      const task = state.tasks.find((item) => item.id === id);
      if (task) {
        task.completed = event.target.checked;
        saveData(state);
      }
    });
  });

  taskList.querySelectorAll("[data-action='delete-task']").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const id = event.target.dataset.id;
      state.tasks = state.tasks.filter((item) => item.id !== id);
      saveAndRender();
    });
  });
}

function renderGoalSelect() {
  const allGoals = [...state.goals, ...state.finances];
  goalSelect.innerHTML = '<option value="">No linked goal</option>';
  allGoals.forEach((goal) => {
    const option = document.createElement("option");
    option.value = goal.id;
    option.textContent = goal.title;
    goalSelect.appendChild(option);
  });
}

function renderThresholds() {
  thresholdList.innerHTML = "";
  if (!state.thresholds.length) {
    thresholdList.appendChild(emptyNote("No thresholds yet. Define the line you must cross."));
    return;
  }
  state.thresholds.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card__row">
        <strong>${escapeHtml(item.title)}</strong>
        <span class="pill">${escapeHtml(item.domain)}</span>
      </div>
      <div>${escapeHtml(item.statement)}</div>
      <div class="card__row">
        <span>${item.dueDate ? `Due ${item.dueDate}` : "No due date"}</span>
        <label>
          <input type="checkbox" data-action="toggle-threshold" data-id="${item.id}" ${
            item.crossed ? "checked" : ""
          } />
          Crossed
        </label>
      </div>
      <div class="card__row">
        <button class="btn btn--ghost" data-action="delete-threshold" data-id="${item.id}">Remove</button>
      </div>
    `;
    thresholdList.appendChild(card);
  });

  thresholdList.querySelectorAll("[data-action='toggle-threshold']").forEach((input) => {
    input.addEventListener("change", (event) => {
      const id = event.target.dataset.id;
      const item = state.thresholds.find((entry) => entry.id === id);
      if (item) {
        item.crossed = event.target.checked;
        saveData(state);
      }
    });
  });

  thresholdList.querySelectorAll("[data-action='delete-threshold']").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const id = event.target.dataset.id;
      state.thresholds = state.thresholds.filter((entry) => entry.id !== id);
      saveAndRender();
    });
  });
}

function renderNotes() {
  dailyIntention.value = state.notes.intention || "";
  winTracker.value = state.notes.wins || "";
}

function renderChecks() {
  document.getElementById("chk-clarity").checked = state.checks.clarity;
  document.getElementById("chk-feedback").checked = state.checks.feedback;
  document.getElementById("chk-momentum").checked = state.checks.momentum;
  document.getElementById("chk-rest").checked = state.checks.rest;
}

function renderCore4() {
  const todayKey = formatDateKey(new Date());
  if (!core4DateInput.value) {
    core4DateInput.value = todayKey;
  }
  core4Hint.textContent = `${core4Checks.length} checks total`;
  loadCore4ForDate(core4DateInput.value);
}

function loadCore4ForDate(dateKey) {
  const entry = normalizeCore4Entry(state.core4Log[dateKey]);
  core4Checks.forEach((item) => {
    item.el.checked = Boolean(entry.checks[item.key]);
  });
  core4Notes.value = entry.notes || "";
  dailyJournal.value = entry.journal || "";
  updateCore4Score();
}

function updateCore4Score() {
  const checkedCount = core4Checks.reduce(
    (total, item) => total + Number(item.el.checked),
    0
  );
  const percent = Math.round((checkedCount / core4Checks.length) * 100);
  core4Score.textContent = `Score: ${percent}%`;
}

function renderReviews() {
  weeklyWins.value = state.reviews.weekly.wins || "";
  weeklyLessons.value = state.reviews.weekly.lessons || "";
  weeklyPriorities.value = state.reviews.weekly.priorities || "";
  quarterWins.value = state.reviews.quarterly.wins || "";
  quarterResets.value = state.reviews.quarterly.resets || "";
  quarterFocus.value = state.reviews.quarterly.focus || "";
}

function renderCalendar() {
  calendarGrid.innerHTML = "";
  const year = calendarViewDate.getFullYear();
  const month = calendarViewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  calendarLabel.textContent = `${firstDay.toLocaleString("default", { month: "long" })} ${year}`;

  for (let i = 0; i < startDay; i += 1) {
    const blank = document.createElement("div");
    blank.className = "calendar-cell";
    calendarGrid.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dateKey = formatDateKey(date);
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    const dueGoals = goalsDueOn(dateKey);
    const rawCore4 = state.core4Log[dateKey];
    const core4Status = rawCore4 ? normalizeCore4Entry(rawCore4) : null;
    const core4ScoreValue = core4Status ? core4ScoreForDay(core4Status) : null;
    const thresholds = state.thresholds.filter(
      (item) => item.dueDate === dateKey && !item.crossed
    );
    const notes = state.calendarNotes.filter((note) => note.date === dateKey);
    cell.innerHTML = `
      <div class="calendar-cell__date">${day}</div>
      <div class="calendar-cell__notes">
        ${dueGoals.map((goal) => `<div class="calendar-pill">${escapeHtml(goal.title)}</div>`).join("")}
        ${thresholds.map((item) => `<div class="calendar-pill">Threshold: ${escapeHtml(item.title)}</div>`).join("")}
        ${core4ScoreValue !== null ? `<div class="calendar-pill">Core 4: ${core4ScoreValue}%</div>` : ""}
        ${notes.map((note) => `<div>${escapeHtml(note.title)}</div>`).join("")}
      </div>
    `;
    calendarGrid.appendChild(cell);
  }
}

function renderCalendarNotes() {
  calendarNoteList.innerHTML = "";
  if (!state.calendarNotes.length) {
    calendarNoteList.appendChild(emptyNote("No calendar notes yet."));
    return;
  }
  const sorted = [...state.calendarNotes].sort((a, b) => a.date.localeCompare(b.date));
  sorted.forEach((note) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card__row">
        <strong>${escapeHtml(note.title)}</strong>
        <span class="pill">${note.date}</span>
      </div>
      <div>${escapeHtml(note.notes)}</div>
      <div class="card__row">
        <button class="btn btn--ghost" data-action="delete-note" data-id="${note.id}">Remove</button>
      </div>
    `;
    calendarNoteList.appendChild(card);
  });

  calendarNoteList.querySelectorAll("[data-action='delete-note']").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const id = event.target.dataset.id;
      state.calendarNotes = state.calendarNotes.filter((item) => item.id !== id);
      saveAndRender();
    });
  });
}

function buildGoalCard(goal, type) {
  const card = document.createElement("div");
  card.className = "card";
  const moneyLabel = type === "finance";
  const progressValue = moneyLabel ? calcFinanceProgress(goal) : goal.progress;
  const percentage = calcPercent(progressValue, goal.target);
  const due = goal.dueDate ? `Due ${goal.dueDate}` : "No due date";
  card.innerHTML = `
    <div class="card__row">
      <strong>${escapeHtml(goal.title)}</strong>
      <span class="pill">Priority ${goal.priority}</span>
    </div>
    <div>${escapeHtml(goal.motivation)}</div>
    <div class="card__row">
      <span>${moneyLabel ? "$" : ""}${progressValue} / ${moneyLabel ? "$" : ""}${goal.target}</span>
      <span>${due}</span>
    </div>
    <div class="progress"><span style="width:${percentage}%"></span></div>
    <div class="card__row">
      ${
        moneyLabel
          ? `<span class="pill">Starting $${goal.starting || 0}</span>`
          : `<label>
              Progress ( % )
              <input type="number" min="0" value="${goal.progress}" data-action="progress" data-id="${goal.id}" data-type="${type}" />
            </label>`
      }
      <button class="btn btn--ghost" data-action="delete-goal" data-id="${goal.id}" data-type="${type}">
        Remove
      </button>
    </div>
  `;

  if (!moneyLabel) {
    const progressInput = card.querySelector("[data-action='progress']");
    progressInput.addEventListener("change", (event) => {
      const next = Number(event.target.value || 0);
      goal.progress = next;
      saveAndRender();
    });
  }

  const deleteBtn = card.querySelector("[data-action='delete-goal']");
  deleteBtn.addEventListener("click", () => {
    if (type === "finance") {
      state.finances = state.finances.filter((item) => item.id !== goal.id);
    } else {
      state.goals = state.goals.filter((item) => item.id !== goal.id);
    }
    state.tasks = state.tasks.filter((task) => task.goalId !== goal.id);
    saveAndRender();
  });

  if (moneyLabel) {
    const transactionForm = document.createElement("div");
    transactionForm.className = "transaction-form";
    transactionForm.innerHTML = `
      <div class="card__row">
        <label>
          Amount ($)
          <input type="number" step="0.01" min="-1000000" max="1000000" data-action="tx-amount" />
        </label>
        <label>
          Date
          <input type="date" data-action="tx-date" />
        </label>
      </div>
      <label>
        Reason / Note
        <input type="text" data-action="tx-note" placeholder="Deposit, bill, investment, etc." />
      </label>
      <button class="btn btn--ghost" data-action="add-transaction">Add Transaction</button>
    `;
    const list = document.createElement("div");
    list.className = "transaction-list";
    list.innerHTML = buildTransactionList(goal);
    card.appendChild(transactionForm);
    card.appendChild(list);

    transactionForm.querySelector("[data-action='add-transaction']").addEventListener("click", () => {
      const amountInput = transactionForm.querySelector("[data-action='tx-amount']");
      const dateInput = transactionForm.querySelector("[data-action='tx-date']");
      const noteInput = transactionForm.querySelector("[data-action='tx-note']");
      const amount = Number(amountInput.value || 0);
      const date = dateInput.value || formatDateKey(new Date());
      if (!amount) return;
      goal.transactions = goal.transactions || [];
      goal.transactions.push({
        id: makeId(),
        amount,
        date,
        note: noteInput.value || "",
      });
      amountInput.value = "";
      noteInput.value = "";
      saveAndRender();
    });
  }

  return card;
}

function buildAutoPlan(hours, startTime) {
  const minutesAvailable = Math.max(0, Math.round(hours * 60));
  const focusGoals = [...state.goals, ...state.finances]
    .map((goal) => ({
      ...goal,
      score: goal.priority * 10 + dueDateScore(goal.dueDate),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const baseTasks = [
    {
      title: "Leadership scan: check team status and blockers",
      duration: 30,
      energy: "medium",
    },
    {
      title: "Deep work block on highest-priority goal",
      duration: 60,
      energy: "high",
    },
  ];

  const goalTasks = focusGoals.map((goal) => ({
    title: `Advance: ${goal.title}`,
    duration: goal.priority >= 4 ? 50 : 35,
    energy: goal.priority >= 4 ? "high" : "medium",
    goalId: goal.id,
  }));

  const financeTask = state.finances.length
    ? [
        {
          title: "Review budget, reconcile spending, move money toward goals",
          duration: 25,
          energy: "low",
        },
      ]
    : [];

  const combined = [...goalTasks, ...baseTasks, ...financeTask];
  return scheduleTasks(combined, minutesAvailable, startTime);
}

function scheduleTasks(tasks, minutesAvailable, startTime) {
  const schedule = [];
  let remaining = minutesAvailable;
  let currentTime = startTime;
  for (const task of tasks) {
    if (remaining <= 0) break;
    const duration = Math.min(task.duration, remaining);
    schedule.push({
      ...task,
      duration,
      time: currentTime,
    });
    currentTime = addMinutes(currentTime, duration);
    remaining -= duration;
  }
  return schedule;
}

function renderSuggestions(suggestions) {
  suggestionsEl.innerHTML = "";
  if (!suggestions.length) {
    suggestionsEl.appendChild(emptyNote("No suggestions yet. Add goals first."));
    return;
  }
  suggestions.forEach((item) => {
    const el = document.createElement("div");
    el.className = "suggestion";
    el.innerHTML = `
      <strong>${item.time}</strong> — ${escapeHtml(item.title)}
      <div class="card__row">
        <span>${item.duration} min · ${item.energy} energy</span>
        <button class="btn btn--ghost" data-action="add-suggestion">Add</button>
      </div>
    `;
    el.querySelector("[data-action='add-suggestion']").addEventListener("click", () => {
      state.tasks.push({
        id: makeId(),
        title: item.title,
        duration: item.duration,
        energy: item.energy,
        goalId: item.goalId || "",
        completed: false,
      });
      saveAndRender();
    });
    suggestionsEl.appendChild(el);
  });
}

function rotateMotivation() {
  const line = motivationLines[Math.floor(Math.random() * motivationLines.length)];
  motivationLine.textContent = line;
}

function formToObject(form) {
  const data = new FormData(form);
  return Object.fromEntries(data.entries());
}

function calcPercent(progress, target) {
  if (!target) return 0;
  return Math.min(100, Math.round((progress / target) * 100));
}

function dueDateScore(dateString) {
  if (!dateString) return 0;
  const now = new Date();
  const due = new Date(dateString);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return 30;
  if (diffDays <= 30) return 20;
  if (diffDays <= 90) return 10;
  return 5;
}

function addMinutes(timeString, minutes) {
  const [hours, mins] = timeString.split(":").map(Number);
  const total = hours * 60 + mins + minutes;
  const nextHours = Math.floor(total / 60) % 24;
  const nextMins = total % 60;
  return `${String(nextHours).padStart(2, "0")}:${String(nextMins).padStart(2, "0")}`;
}

function makeId() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function emptyNote(text) {
  const note = document.createElement("div");
  note.className = "card";
  note.textContent = text;
  return note;
}

function findGoalTitle(goalId) {
  if (!goalId) return "";
  const allGoals = [...state.goals, ...state.finances];
  const goal = allGoals.find((item) => item.id === goalId);
  return goal ? goal.title : "";
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function goalsDueOn(dateKey) {
  const dueGoals = state.goals.filter((goal) => goal.dueDate === dateKey);
  const dueFinances = state.finances.filter((goal) => goal.dueDate === dateKey);
  return [...dueGoals, ...dueFinances];
}

function core4ScoreForDay(entry) {
  const checks = entry.checks || {};
  const checkedCount = core4Checks.reduce(
    (total, item) => total + Number(checks[item.key]),
    0
  );
  return Math.round((checkedCount / core4Checks.length) * 100);
}

function normalizeCore4Entry(entry) {
  if (!entry) {
    return {
      checks: Object.fromEntries(core4Checks.map((item) => [item.key, false])),
      notes: "",
      journal: "",
    };
  }
  if (entry.checks) {
    return {
      checks: Object.fromEntries(
        core4Checks.map((item) => [item.key, Boolean(entry.checks[item.key])])
      ),
      notes: entry.notes || "",
      journal: entry.journal || "",
    };
  }
  const legacyChecks = {
    bodyTrain: Boolean(entry.body),
    bodyFuel: Boolean(entry.body),
    bodyRecover: Boolean(entry.body),
    beingMeditation: Boolean(entry.being),
    beingGratitude: Boolean(entry.being),
    beingAlignment: Boolean(entry.being),
    balanceFamily: Boolean(entry.balance),
    balanceRelationship: Boolean(entry.balance),
    balanceRest: Boolean(entry.balance),
    businessExecution: Boolean(entry.business),
    businessRevenue: Boolean(entry.business),
    businessLeadership: Boolean(entry.business),
  };
  return {
    checks: legacyChecks,
    notes: entry.notes || "",
    journal: entry.journal || "",
  };
}

function calcFinanceProgress(goal) {
  const base = Number(goal.starting || 0);
  const transactions = goal.transactions || [];
  const total = transactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  return Math.round((base + total) * 100) / 100;
}

function buildTransactionList(goal) {
  const transactions = goal.transactions || [];
  if (!transactions.length) {
    return `<div class="transaction-item">No transactions yet.</div>`;
  }
  return transactions
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(
      (tx) => `
        <div class="transaction-item">
          <span>${tx.date} · ${escapeHtml(tx.note || "Transaction")}</span>
          <strong>${tx.amount >= 0 ? "+" : ""}$${tx.amount}</strong>
        </div>
      `
    )
    .join("");
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function exportToPdf() {
  const dailyEntries = Object.entries(state.core4Log)
    .map(([date, entry]) => ({ date, entry: normalizeCore4Entry(entry) }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const weeklyHistory = state.reviews.weeklyHistory || [];
  const quarterlyHistory = state.reviews.quarterlyHistory || [];
  const progressSnapshot = buildProgressSnapshot();
  const goalsSnapshot = buildGoalsSnapshot();
  const financeSnapshot = buildFinanceSnapshot();
  const taskSnapshot = buildTaskSnapshot();
  const thresholdSnapshot = buildThresholdSnapshot();

  const reportWindow = window.open("", "_blank");
  if (!reportWindow) return;
  const doc = reportWindow.document;
  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Black Book Planner Report</title>
        <style>
          body {
            font-family: "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif;
            background: #0b0c10;
            color: #a9d6ff;
            padding: 32px;
          }
          h1, h2, h3 {
            margin: 0 0 8px;
          }
          .section {
            margin-bottom: 28px;
            padding-bottom: 16px;
            border-bottom: 1px solid rgba(169, 214, 255, 0.25);
          }
          .entry {
            margin: 12px 0;
            padding: 12px;
            border: 1px solid rgba(169, 214, 255, 0.25);
            border-radius: 12px;
          }
          .pill {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            background: rgba(127, 195, 255, 0.2);
            margin-left: 8px;
          }
          .checks {
            margin: 8px 0 0;
          }
          .checks span {
            display: inline-block;
            margin-right: 8px;
          }
          @media print {
            body {
              background: white;
              color: #1c1a16;
            }
            .entry {
              border-color: #c7d7e6;
            }
          }
        </style>
      </head>
      <body>
        <h1>Black Book Planner Report</h1>
        <p>Generated ${new Date().toLocaleString()}</p>

        <div class="section">
          <h2>Progress Snapshot</h2>
          ${renderProgressSnapshot(progressSnapshot)}
        </div>

        <div class="section">
          <h2>Goals Progress</h2>
          ${goalsSnapshot}
        </div>

        <div class="section">
          <h2>Financial Progress</h2>
          ${financeSnapshot}
        </div>

        <div class="section">
          <h2>Daily Tasks</h2>
          ${taskSnapshot}
        </div>

        <div class="section">
          <h2>Thresholds</h2>
          ${thresholdSnapshot}
        </div>

        <div class="section">
          <h2>Daily Core 4 Logs</h2>
          ${dailyEntries.length ? dailyEntries.map((item) => renderDailyEntry(item)).join("") : "<p>No daily logs yet.</p>"}
        </div>

        <div class="section">
          <h2>Weekly Reviews</h2>
          ${weeklyHistory.length ? weeklyHistory.map(renderWeeklyEntry).join("") : "<p>No weekly reviews yet.</p>"}
        </div>

        <div class="section">
          <h2>Quarterly Reviews</h2>
          ${quarterlyHistory.length ? quarterlyHistory.map(renderQuarterlyEntry).join("") : "<p>No quarterly reviews yet.</p>"}
        </div>
      </body>
    </html>
  `;
  doc.open();
  doc.write(html);
  doc.close();
  reportWindow.focus();
  reportWindow.print();
}

function renderDailyEntry(item) {
  const percent = core4ScoreForDay(item.entry);
  const checks = item.entry.checks || {};
  const checkText = core4Checks
    .map((check) => `${checks[check.key] ? "■" : "□"} ${check.label}`)
    .join(" · ");
  return `
    <div class="entry">
      <h3>${item.date} <span class="pill">${percent}%</span></h3>
      <div class="checks">${checkText}</div>
      ${item.entry.notes ? `<p><strong>Notes:</strong> ${escapeHtml(item.entry.notes)}</p>` : ""}
      ${item.entry.journal ? `<p><strong>Journal:</strong> ${escapeHtml(item.entry.journal)}</p>` : ""}
    </div>
  `;
}

function renderWeeklyEntry(entry) {
  return `
    <div class="entry">
      <h3>${entry.date || "Weekly Review"}</h3>
      <p><strong>Wins:</strong> ${escapeHtml(entry.wins || "")}</p>
      <p><strong>Lessons:</strong> ${escapeHtml(entry.lessons || "")}</p>
      <p><strong>Priorities:</strong> ${escapeHtml(entry.priorities || "")}</p>
    </div>
  `;
}

function renderQuarterlyEntry(entry) {
  return `
    <div class="entry">
      <h3>${entry.date || "Quarterly Review"}</h3>
      <p><strong>Wins:</strong> ${escapeHtml(entry.wins || "")}</p>
      <p><strong>Resets:</strong> ${escapeHtml(entry.resets || "")}</p>
      <p><strong>Focus:</strong> ${escapeHtml(entry.focus || "")}</p>
    </div>
  `;
}

function buildProgressSnapshot() {
  const todayKey = formatDateKey(new Date());
  const todayEntry = state.core4Log[todayKey];
  return {
    day: todayEntry ? core4ScoreForDay(normalizeCore4Entry(todayEntry)) : null,
    week: averageCore4Score(7),
    month: averageCore4Score(30),
    tasks: taskCompletionRate(),
  };
}

function renderProgressSnapshot(snapshot) {
  const day = snapshot.day === null ? "N/A" : `${snapshot.day}%`;
  const week = snapshot.week === null ? "N/A" : `${snapshot.week}%`;
  const month = snapshot.month === null ? "N/A" : `${snapshot.month}%`;
  const tasks = snapshot.tasks === null ? "N/A" : `${snapshot.tasks}%`;
  return `
    <div class="entry">
      <p><strong>Core 4 Today:</strong> ${day}</p>
      <p><strong>Core 4 Last 7 Days:</strong> ${week}</p>
      <p><strong>Core 4 Last 30 Days:</strong> ${month}</p>
      <p><strong>Task Completion (current list):</strong> ${tasks}</p>
    </div>
  `;
}

function averageCore4Score(daysBack) {
  const now = new Date();
  const entries = Object.entries(state.core4Log)
    .map(([date, entry]) => ({ date, entry }))
    .filter(({ date }) => {
      const deltaDays = Math.floor((now - new Date(date)) / (1000 * 60 * 60 * 24));
      return deltaDays >= 0 && deltaDays < daysBack;
    })
    .map(({ entry }) => core4ScoreForDay(normalizeCore4Entry(entry)));
  if (!entries.length) return null;
  const total = entries.reduce((sum, score) => sum + score, 0);
  return Math.round(total / entries.length);
}

function taskCompletionRate() {
  if (!state.tasks.length) return null;
  const completed = state.tasks.filter((task) => task.completed).length;
  return Math.round((completed / state.tasks.length) * 100);
}

function buildGoalsSnapshot() {
  if (!state.goals.length) return "<p>No goals yet.</p>";
  return state.goals
    .map((goal) => {
      const percent = calcPercent(goal.progress, goal.target);
      return `
        <div class="entry">
          <h3>${escapeHtml(goal.title)} <span class="pill">${percent}%</span></h3>
          <p>${escapeHtml(goal.motivation || "")}</p>
          <p><strong>${goal.progress}</strong> / <strong>${goal.target}</strong> ${goal.dueDate ? `· Due ${goal.dueDate}` : ""}</p>
        </div>
      `;
    })
    .join("");
}

function buildFinanceSnapshot() {
  if (!state.finances.length) return "<p>No financial goals yet.</p>";
  return state.finances
    .map((goal) => {
      const current = calcFinanceProgress(goal);
      const percent = calcPercent(current, goal.target);
      return `
        <div class="entry">
          <h3>${escapeHtml(goal.title)} <span class="pill">${percent}%</span></h3>
          <p>${escapeHtml(goal.motivation || "")}</p>
          <p><strong>$${current}</strong> / <strong>$${goal.target}</strong> ${goal.dueDate ? `· Due ${goal.dueDate}` : ""}</p>
        </div>
      `;
    })
    .join("");
}

function buildTaskSnapshot() {
  if (!state.tasks.length) return "<p>No tasks yet.</p>";
  return `
    <div class="entry">
      ${state.tasks
        .map(
          (task) =>
            `<p>${task.completed ? "■" : "□"} ${escapeHtml(task.title)} (${task.duration} min)</p>`
        )
        .join("")}
    </div>
  `;
}

function buildThresholdSnapshot() {
  if (!state.thresholds.length) return "<p>No thresholds yet.</p>";
  return `
    <div class="entry">
      ${state.thresholds
        .map(
          (item) =>
            `<p>${item.crossed ? "■" : "□"} ${escapeHtml(item.title)} · ${escapeHtml(
              item.domain
            )} ${item.dueDate ? `· Due ${item.dueDate}` : ""}</p>`
        )
        .join("")}
    </div>
  `;
}

function saveAndRender() {
  saveData(state);
  renderAll();
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultData);
    const parsed = JSON.parse(raw);
    const merged = { ...structuredClone(defaultData), ...parsed };
    merged.finances = (merged.finances || []).map((goal) => ({
      ...goal,
      starting: Number(goal.starting ?? goal.progress ?? 0),
      transactions: goal.transactions || [],
    }));
    merged.thresholds = merged.thresholds || [];
    merged.core4Log = merged.core4Log || {};
    merged.reviews = merged.reviews || structuredClone(defaultData.reviews);
    merged.reviews.weeklyHistory = merged.reviews.weeklyHistory || [];
    merged.reviews.quarterlyHistory = merged.reviews.quarterlyHistory || [];
    return merged;
  } catch (error) {
    return structuredClone(defaultData);
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) || "dark";
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "Toggle Light Mode" : "Toggle Dark Mode";
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }
}

core4Checks.forEach((item) => {
  item.el.addEventListener("change", updateCore4Score);
});
