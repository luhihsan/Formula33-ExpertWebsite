import { database } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

function parseTs(ts) {
  if (!ts) return new Date(0);
  const norm = ts.includes("T") ? ts : ts.replace(" ", "T");
  const d = new Date(norm);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

async function fetchUsers() {
  const snapshot = await get(ref(database, "user"));
  return snapshot.exists() ? snapshot.val() : {};
}

async function fetchQuizResults() {
  const snapshot = await get(ref(database, "quiz_result"));
  return snapshot.exists() ? snapshot.val() : {};
}

let maxAttempts = 0;
let usersWithAttempts = [];
let dataTableInstance = null;

function ensureControls() {
  const tableEl = document.querySelector(".table");
  const cardBody = tableEl.closest(".card-body");

  tableEl.setAttribute("id", "score-table");

  if (cardBody.querySelector("#sorting-controls")) return;

  const controls = document.createElement("div");
  controls.id = "sorting-controls";
  controls.className = "d-flex align-items-center mb-3 gap-2 flex-wrap";

  controls.innerHTML = `
    <label class="form-label mb-0">Urutkan:</label>
    <select id="sort-by" class="form-select form-select-sm w-auto">
      <option value="time-desc" selected>Waktu pengerjaan (terbaru)</option>
      <option value="time-asc">Waktu pengerjaan (terlama)</option>
      <option value="username-asc">Username A → Z</option>
      <option value="username-desc">Username Z → A</option>
      <option value="score-desc">Nilai tertinggi → terendah</option>
      <option value="score-asc">Nilai terendah → tertinggi</option>
    </select>
  `;

  cardBody.insertBefore(controls, cardBody.querySelector(".table-responsive"));

  controls.querySelector("#sort-by").addEventListener("change", () => {
    renderTable(controls.querySelector("#sort-by").value);
  });
}

function buildHeader() {
  const thead = document.getElementById("table-header");
  let headerRow =
    "<tr><th scope='col' class='text-center'>No</th><th scope='col' class='text-center'>Username</th>";
  for (let i = 1; i <= maxAttempts; i++) {
    headerRow += `<th scope='col' class='text-center'>Percobaan ${i}</th>`;
  }
  headerRow += "</tr>";
  thead.innerHTML = headerRow;
}

function destroyDataTableIfAny() {
  if (window.jQuery && jQuery.fn && jQuery.fn.DataTable) {
    const $ = window.jQuery;
    const $tbl = $("#score-table");
    if ($tbl.length && $.fn.DataTable.isDataTable($tbl)) {
      $tbl.DataTable().destroy();
    }
  }
}

function initDataTableIfAny() {
  if (window.jQuery && jQuery.fn && jQuery.fn.DataTable) {
    const $ = window.jQuery;
    $("#score-table").DataTable({
    });
  }
}

function sortData(mode) {
  const arr = [...usersWithAttempts];
  switch (mode) {
    case "username-asc":
      arr.sort((a, b) => a.username.localeCompare(b.username, "id", { sensitivity: "base" }));
      break;
    case "username-desc":
      arr.sort((a, b) => b.username.localeCompare(a.username, "id", { sensitivity: "base" }));
      break;
    case "time-asc":
      arr.sort((a, b) => a.latestTs - b.latestTs);
      break;
    case "time-desc":
      arr.sort((a, b) => b.latestTs - a.latestTs);
      break;
    case "score-asc":
      arr.sort((a, b) => (a.bestScore ?? -Infinity) - (b.bestScore ?? -Infinity));
      break;
    case "score-desc":
      arr.sort((a, b) => (b.bestScore ?? -Infinity) - (a.bestScore ?? -Infinity));
      break;
    default:
      arr.sort((a, b) => b.latestTs - a.latestTs);
  }
  return arr;
}

function renderTable(sortMode = "time-desc") {
  destroyDataTableIfAny();

  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  const sorted = sortData(sortMode);

  let rowIndex = 1;
  for (const u of sorted) {
    let row = `<tr><td class='text-center'>${rowIndex++}</td><td>${u.username}</td>`;

    for (let i = 0; i < maxAttempts; i++) {
      if (i < u.attempts.length) {
        const { score, timestamp } = u.attempts[i];
        const checkImg =
          score >= 70
            ? `<br><img src="assets/img/check.png" alt="Check" style="width:20px; height:20px; margin-top:5px;">`
            : "";
        row += `<td class="text-center"><b>${score}</b>${checkImg}<br><small>${timestamp || "-"}</small></td>`;
      } else {
        row += `<td class="text-center">-</td>`;
      }
    }

    row += "</tr>";
    tbody.insertAdjacentHTML("beforeend", row);
  }

  initDataTableIfAny();
}

async function loadQuizResults() {
  const [users, quizResults] = await Promise.all([fetchUsers(), fetchQuizResults()]);
  maxAttempts = 0;
  Object.keys(quizResults || {}).forEach((userId) => {
    const attempts = Object.keys(quizResults[userId]?.quizHistory || {}).length;
    if (attempts > maxAttempts) maxAttempts = attempts;
  });
  usersWithAttempts = Object.keys(quizResults || {}).map((userId) => {
    const username = users[userId]?.username || "Unknown User";
    const quizHistory = quizResults[userId]?.quizHistory || {};

    const attempts = Object.entries(quizHistory)
      .map(([, d]) => ({
        score: d?.score ?? null,
        timestamp: d?.timestamp ?? null,
        tsDate: parseTs(d?.timestamp),
      }))
      .sort((a, b) => a.tsDate - b.tsDate);

    const latestTs = attempts.length ? attempts[attempts.length - 1].tsDate : new Date(0);
    const bestScore = attempts.length ? Math.max(...attempts.map((a) => a.score ?? -Infinity)) : null;

    return { userId, username, attempts, latestTs, bestScore };
  });

  ensureControls();
  buildHeader();
  renderTable("time-desc");
}

document.addEventListener("DOMContentLoaded", () => {
  loadQuizResults();
});
