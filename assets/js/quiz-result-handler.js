import { database } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Fungsi untuk mengambil data pengguna
async function fetchUsers() {
    const userRef = ref(database, "user");
    const snapshot = await get(userRef);
    if (!snapshot.exists()) return {};
    return snapshot.val(); // Mengembalikan objek user dengan ID sebagai key
}

// Fungsi untuk mengambil data hasil quiz
async function fetchQuizResults() {
    const quizRef = ref(database, "quiz_result");
    const snapshot = await get(quizRef);
    if (!snapshot.exists()) return {};
    return snapshot.val(); // Mengembalikan data quiz_result
}

// Fungsi utama untuk menampilkan data ke dalam tabel
async function loadQuizResults() {
    const users = await fetchUsers();
    const quizResults = await fetchQuizResults();

    let maxAttempts = 0; // Menyimpan jumlah percobaan tertinggi
    let tableBody = document.querySelector("table tbody");
    let tableHead = document.querySelector("table thead");

    tableBody.innerHTML = ""; // Kosongkan tabel sebelum mengisi ulang
    tableHead.innerHTML = ""; // Kosongkan header tabel

    let headerRow = "<tr><th scope='col' class='text-center'>No</th><th scope='col' class='text-center'>Username</th>";

    // Hitung percobaan terbanyak di semua pengguna
    Object.keys(quizResults).forEach(userId => {
        const attempts = Object.keys(quizResults[userId].quizHistory || {}).length;
        if (attempts > maxAttempts) maxAttempts = attempts;
    });

    // Tambahkan kolom header untuk setiap percobaan
    for (let i = 1; i <= maxAttempts; i++) {
        headerRow += `<th scope='col' class='text-center'>Percobaan ${i}</th>`;
    }
    headerRow += "</tr>";
    tableHead.innerHTML = headerRow;

    let rowIndex = 1;

    // Loop untuk setiap pengguna yang memiliki hasil quiz
    Object.keys(quizResults).forEach(userId => {
        const username = users[userId] ? users[userId].username : "Unknown User";
        const quizHistory = quizResults[userId].quizHistory || {};
        let row = `<tr><td class='text-center'>${rowIndex++}</td><td>${username}</td>`;

        // Ambil percobaan quiz secara berurutan berdasarkan timestamp
        const attempts = Object.entries(quizHistory).map(([key, data]) => ({
            score: data.score,
            timestamp: data.timestamp
        })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); 

        for (let i = 0; i < maxAttempts; i++) {
            if (i < attempts.length) {
                const score = attempts[i].score;
                const timestamp = attempts[i].timestamp;
                const checkImg = score >= 70 
                    ? `<br><img src="assets/img/check.png" alt="Check" style="width:20px; height:20px; margin-top:5px;">` 
                    : "";
                row += `<td class="text-center">
                            <b>${score}</b>${checkImg}<br>
                            <small>${timestamp}</small>
                        </td>`;
            } else {
                row += `<td class="text-center">-</td>`;
            }
        }

        row += "</tr>";
        tableBody.innerHTML += row;
    });
}

// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    loadQuizResults();
});
