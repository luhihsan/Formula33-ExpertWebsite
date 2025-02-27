import { database } from "./firebase-config.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

async function simpanFormula(event) {
    event.preventDefault(); 

    const nama_formula = document.querySelector('input[name="nama_formula"]').value.trim();
    const jenis_kalimat = document.querySelector('select[name="jenis_kalimat"]').value;
    const aspek = document.querySelector('select[name="aspek"]').value;
    const waktu = document.querySelector('select[name="waktu"]').value;

    if (!nama_formula) {
        alert("Nama Formula tidak boleh kosong!");
        return;
    }

    const formulaId = nama_formula.replace(/\s+/g, "").toUpperCase();

    const formulaData = {
        aspek: aspek,
        jenis_kalimat: jenis_kalimat,
        waktu: waktu
    };

    await set(ref(database, `formula/${formulaId}`), formulaData)
        .then(() => {
            alert(`Formula berhasil disimpan dengan ID: ${formulaId}`);
            document.querySelector("form").reset();
        })
        .catch(error => {
            console.error("Error menyimpan formula:", error);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    if (form) {
        form.addEventListener("submit", simpanFormula);
    }
});
