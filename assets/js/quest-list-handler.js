import { database } from "./firebase-config.js";
import { ref, get, remove, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Fungsi untuk memuat daftar soal dari Firebase
async function loadQuestions() {
    const questionRef = ref(database, "question");

    try {
        const snapshot = await get(questionRef);
        const tableBody = document.getElementById("question-table-body");

        if (!tableBody) {
            console.error("Tabel tidak ditemukan!");
            return;
        }

        tableBody.innerHTML = ""; // Kosongkan tabel sebelum diisi ulang

        if (snapshot.exists()) {
            const data = snapshot.val();
            let rowIndex = 1;

            Object.keys(data).forEach((key) => {
                const soal = data[key];

                const kalimatAsli = soal.kalimat_asli || "-";
                const jenisKalimat = soal.jenis_kalimat || "-";
                const aspek = soal.aspek || "-";
                const waktu = soal.waktu || "-";
                const formula = soal.formula || "-";
                const correctTranslation = soal.correct_translation || "-";
                const incorrectTranslation1 = soal.incorrect_translation?.[0] || "-";
                const incorrectTranslation2 = soal.incorrect_translation?.[1] || "-";
                const level = soal.level || "-"; // Tambahkan ini untuk level

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
                    <td class="text-center">${level}</td> <!-- Tambahkan kolom level -->
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

// Fungsi Menghapus Soal dengan Konfirmasi
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

// Fungsi Menampilkan Data Soal ke Modal Edit
window.editQuestion = async function (questionId) {
    try {
        const questionRef = ref(database, `question/${questionId}`);
        const snapshot = await get(questionRef);

        if (snapshot.exists()) {
            const soal = snapshot.val();

            document.getElementById("edit-question-id").value = questionId;
            document.getElementById("edit-kalimat-asli").value = soal.kalimat_asli || "";
            document.getElementById("edit-jenis-kalimat").value = soal.jenis_kalimat || "";
            document.getElementById("edit-aspek").value = soal.aspek || "";
            document.getElementById("edit-waktu").value = soal.waktu || "";
            document.getElementById("edit-formula").value = soal.formula || "";
            document.getElementById("edit-correct-translation").value = soal.correct_translation || "";
            document.getElementById("edit-incorrect-translation1").value = soal.incorrect_translation?.[0] || "";
            document.getElementById("edit-incorrect-translation2").value = soal.incorrect_translation?.[1] || "";
            document.getElementById("edit-level").value = soal.level || ""; // Tambahkan ini

            const editModal = new bootstrap.Modal(document.getElementById("editQuestionModal"));
            editModal.show();
        } else {
            alert("Data soal tidak ditemukan.");
        }
    } catch (error) {
        console.error("Error saat membuka modal edit:", error);
    }
};

// Fungsi Menyimpan Perubahan Soal
document.getElementById("edit-question-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const questionId = document.getElementById("edit-question-id").value;
    const updatedData = {
        kalimat_asli: document.getElementById("edit-kalimat-asli").value,
        jenis_kalimat: document.getElementById("edit-jenis-kalimat").value,
        aspek: document.getElementById("edit-aspek").value,
        waktu: document.getElementById("edit-waktu").value,
        formula: document.getElementById("edit-formula").value,
        correct_translation: document.getElementById("edit-correct-translation").value,
        incorrect_translation: [
            document.getElementById("edit-incorrect-translation1").value,
            document.getElementById("edit-incorrect-translation2").value,
        ],
        level: document.getElementById("edit-level").value // Tambahkan ini
    };

    try {
        const questionRef = ref(database, `question/${questionId}`);
        await update(questionRef, updatedData);

        alert("Soal berhasil diperbarui.");
        const editModal = bootstrap.Modal.getInstance(document.getElementById("editQuestionModal"));
        editModal.hide();

        loadQuestions();
    } catch (error) {
        console.error("Gagal memperbarui soal:", error);
        alert("Terjadi kesalahan saat memperbarui soal.");
    }
});

// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    loadQuestions();
});
