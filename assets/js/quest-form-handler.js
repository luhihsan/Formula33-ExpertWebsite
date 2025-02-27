import { database } from "./firebase-config.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

async function simpanSoal(event) {
    event.preventDefault(); // Mencegah form submit default

    // Ambil nilai dari form
    const kalimat_asli = document.querySelector('input[name="kalimat_asli"]').value;
    const jenis_kalimat = document.querySelector('select[name="jenis_kalimat"]').value;
    const aspek = document.querySelector('select[name="aspek"]').value;
    const waktu = document.querySelector('select[name="waktu"]').value;
    const formula = document.querySelector('input[name="formula"]').value;
    const correct_trans = document.querySelector('input[name="correct_trans"]').value;
    const incorrect_trans1 = document.querySelector('input[name="incorrect_trans1"]').value;
    const incorrect_trans2 = document.querySelector('input[name="incorrect_trans2"]').value;

    // Ambil referensi ke database
    const questionRef = ref(database, "question");

    try {
        // Ambil semua data soal yang ada
        const snapshot = await get(questionRef);
        let lastId = 0;

        if (snapshot.exists()) {
            const data = snapshot.val();
            const keys = Object.keys(data);

            // Cari ID terakhir dengan format "kalimatXX"
            keys.forEach((key) => {
                const num = parseInt(key.replace("kalimat", ""), 10);
                if (num > lastId) {
                    lastId = num;
                }
            });
        }

        // Tentukan ID baru dengan format "kalimatXX"
        const newId = `kalimat${(lastId + 1).toString().padStart(2, "0")}`; // Format tetap dua digit

        // Struktur data yang akan dikirim ke Firebase
        const soalData = {
            aspek: aspek,
            correct_translation: correct_trans,
            formula: formula,
            incorrect_translation: [incorrect_trans1, incorrect_trans2], // Masukkan sebagai array
            jenis_kalimat: jenis_kalimat,
            kalimat_asli: kalimat_asli,
            waktu: waktu
        };

        // Simpan data ke Firebase dengan ID yang sudah ditentukan
        await set(ref(database, `question/${newId}`), soalData);

        alert(`Soal berhasil disimpan dengan ID: ${newId}`);
        document.querySelector("form").reset(); // Reset form setelah submit
    } catch (error) {
        console.error("Error menyimpan soal:", error);
    }
}

// Tambahkan event listener ke tombol submit
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    form.addEventListener("submit", simpanSoal);
});
