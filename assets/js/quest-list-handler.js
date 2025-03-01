import { database } from "./firebase-config.js";
import { ref, get, remove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

async function loadQuestions() {
    const questionRef = ref(database, "question");

    try {
        const snapshot = await get(questionRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            const tableBody = document.querySelector("table tbody");

            tableBody.innerHTML = ""; // Kosongkan tabel sebelum diisi ulang

            let rowIndex = 1; // Untuk nomor urut

            Object.keys(data).forEach((key) => {
                const soal = data[key];

                // Pastikan nilai ada, jika tidak, berikan nilai default
                const kalimatAsli = soal.kalimat_asli || "-";
                const jenisKalimat = soal.jenis_kalimat || "-";
                const aspek = soal.aspek || "-";
                const waktu = soal.waktu || "-";
                const formula = soal.formula || "-";
                const correctTranslation = soal.correct_translation || "-";
                
                // Pastikan incorrect_translation berbentuk array dan memiliki setidaknya 2 nilai
                const incorrectTranslation1 = soal.incorrect_translation && soal.incorrect_translation[0] ? soal.incorrect_translation[0] : "-";
                const incorrectTranslation2 = soal.incorrect_translation && soal.incorrect_translation[1] ? soal.incorrect_translation[1] : "-";

                // Buat baris baru dalam tabel
                const row = document.createElement("tr");
                row.innerHTML = `
                    <th scope="row" class="text-center">${rowIndex++}</th>
                    <td>${kalimatAsli}</td>
                    <td>${jenisKalimat}</td>
                    <td>${aspek}</td>
                    <td>${waktu}</td>
                    <td>${formula}</td>
                    <td>${correctTranslation}</td>
                    <td>${incorrectTranslation1}</td>
                    <td>${incorrectTranslation2}</td>
                    <td class="text-center">
                        <button class="btn btn-outline-info btn-rounded" onclick="editQuestion('${key}')"><i class="fas fa-pen"></i></button>
                        <button class="btn btn-outline-danger btn-rounded" onclick="deleteQuestion('${key}')"><i class="fas fa-trash"></i></button>
                    </td>
                `;

                tableBody.appendChild(row);
            });

        } else {
            console.log("Tidak ada data soal yang ditemukan.");
        }

    } catch (error) {
        console.error("Error mengambil data dari Firebase:", error);
    }
}

// Fungsi Hapus Soal Quiz dengan Konfirmasi
window.deleteQuestion = async function (questionId) {
    const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus soal ini?`);

    if (confirmDelete) {
        try {
            const questionRef = ref(database, `question/${questionId}`);
            await remove(questionRef);
            alert(`Soal berhasil dihapus.`);
            loadQuestions(); // Refresh daftar soal
        } catch (error) {
            console.error("Gagal menghapus soal:", error);
            alert("Terjadi kesalahan saat menghapus soal.");
        }
    }
};

// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    loadQuestions();
});
