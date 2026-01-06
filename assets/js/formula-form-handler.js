import { database } from "./firebase-config.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

async function simpanFormula(event) {
    event.preventDefault();

    const nama_formula = document.querySelector('input[name="nama_formula"]').value.trim();
    const jenis_kalimat = document.querySelector('select[name="jenis_kalimat"]').value;
    const aspek = document.querySelector('select[name="aspek"]').value;
    const waktu = document.querySelector('select[name="waktu"]').value;
    const isi_formula = document.querySelector('input[name="isi_formula"]').value.trim();
    const contoh_kalimat = document.querySelector('input[name="contoh_kalimat"]').value.trim();

    if (!nama_formula) {
        alert("Nama Formula tidak boleh kosong!");
        return;
    }

    if (!isi_formula) {
        alert("Isi Formula tidak boleh kosong!");
        return;
    }

    if (!contoh_kalimat) {
        alert("Contoh kalimat tidak boleh kosong!");
        return;
    }

    const formulaId = nama_formula.replace(/\s+/g, "").toUpperCase();

    const formulaData = {
        jenis_kalimat: jenis_kalimat,
        aspek: aspek,
        waktu: waktu,
        isi: isi_formula,
        example: contoh_kalimat
    };

    try {
        await set(ref(database, `formula/${formulaId}`), formulaData);
        alert(`Formula berhasil disimpan dengan ID: ${formulaId}`);
        document.querySelector("form").reset();
    } catch (error) {
        console.error("Error menyimpan formula:", error);
        alert("Gagal menyimpan formula!");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    if (form) {
        form.addEventListener("submit", simpanFormula);
    }
});
