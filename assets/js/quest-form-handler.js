import { database } from "./firebase-config.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const buildCodes = (prefix) => Array.from({ length: 11 }, (_, i) => `${prefix}${String(i+1).padStart(2,"0")}`);
const FORMULA_MAP = {
  Verbal: buildCodes("V"),
  Pasif: buildCodes("P"),
  Nomina: buildCodes("N"),
};

function ensureFormulaSelect() {
  const oldInput = document.querySelector('input[name="formula"]');
  const existingSelect = document.querySelector('select[name="formula"]');

  if (existingSelect) {
    existingSelect.disabled = true;
    if (!existingSelect.options.length) {
      const ph = new Option("Pilih jenis kalimat dulu", "");
      existingSelect.add(ph);
    }
    return existingSelect;
  }

  if (!oldInput) return null;

  const sel = document.createElement("select");
  sel.name = "formula";
  sel.id = "formula-select";
  sel.required = oldInput.required || true;
  if (oldInput.classList.contains("form-control")) {
    sel.classList.add("form-select");
  } else {
    oldInput.classList.forEach((c) => sel.classList.add(c));
    sel.classList.add("form-select");
  }
  sel.appendChild(new Option("Pilih jenis kalimat dulu", ""));
  sel.disabled = true;
  oldInput.parentNode.replaceChild(sel, oldInput);
  return sel;
}

function populateFormulaOptions(jenisValue) {
  const sel = document.querySelector('select[name="formula"]');
  if (!sel) return;

  sel.innerHTML = "";
  if (!jenisValue || !FORMULA_MAP[jenisValue]) {
    sel.appendChild(new Option("Pilih jenis kalimat dulu", ""));
    sel.disabled = true;
    return;
  }

  sel.appendChild(new Option(`Pilih formula ${jenisValue} yang sesuai`, ""));
  FORMULA_MAP[jenisValue].forEach((code) => sel.appendChild(new Option(code, code)));
  sel.disabled = false;
}

async function simpanSoal(event) {
  event.preventDefault();

  const kalimat_asli     = document.querySelector('input[name="kalimat_asli"]')?.value?.trim();
  const jenis_kalimat    = document.querySelector('select[name="jenis_kalimat"]')?.value;
  const aspek            = document.querySelector('select[name="aspek"]')?.value;
  const waktu            = document.querySelector('select[name="waktu"]')?.value;
  const formula          = document.querySelector('[name="formula"]')?.value;
  const correct_trans    = document.querySelector('input[name="correct_trans"]')?.value?.trim();
  const incorrect_trans1 = document.querySelector('input[name="incorrect_trans1"]')?.value?.trim();
  const incorrect_trans2 = document.querySelector('input[name="incorrect_trans2"]')?.value?.trim();

  if (
    !kalimat_asli || !jenis_kalimat || !aspek || !waktu ||
    !formula || !correct_trans || !incorrect_trans1 || !incorrect_trans2
  ) {
    alert("Semua field harus diisi!");
    return;
  }

  const questionRef = ref(database, "question");

  try {
    const snapshot = await get(questionRef);
    let lastId = 0;

    if (snapshot.exists()) {
      const data = snapshot.val();
      const keys = Object.keys(data);
      keys.forEach((key) => {
        const num = parseInt(key.replace("kalimat", ""), 10);
        if (!Number.isNaN(num) && num > lastId) lastId = num;
      });
    }

    const newId = `kalimat${String(lastId + 1).padStart(2, "0")}`;

    const soalData = {
      aspek: aspek,
      correct_translation: correct_trans,
      formula: formula, 
      incorrect_translation: [incorrect_trans1, incorrect_trans2],
      jenis_kalimat: jenis_kalimat,
      kalimat_asli: kalimat_asli,
      waktu: waktu
    };

    await set(ref(database, `question/${newId}`), soalData);

    alert(`Soal berhasil disimpan dengan ID: ${newId}`);
    event.target.reset();
    populateFormulaOptions("");
  } catch (error) {
    console.error("Error menyimpan soal:", error);
    alert("Terjadi error saat menyimpan soal. Silakan coba lagi.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const jenisSelect = document.querySelector('select[name="jenis_kalimat"]');
  
  ensureFormulaSelect();
  populateFormulaOptions("");

  if (jenisSelect) {
    jenisSelect.addEventListener("change", (e) => populateFormulaOptions(e.target.value));
  }
  if (form) form.addEventListener("submit", simpanSoal);
});