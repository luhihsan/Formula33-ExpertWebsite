import { database } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Fungsi untuk mengambil jumlah pengguna dari Firebase
async function fetchUserCount() {
    const userRef = ref(database, "user");
    const snapshot = await get(userRef);
    return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
}

// Fungsi untuk mengambil jumlah soal quiz dari Firebase
async function fetchQuestionCount() {
    const questionRef = ref(database, "question");
    const snapshot = await get(questionRef);
    return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
}

// Fungsi untuk mengambil jumlah formula dari Firebase
async function fetchFormulaCount() {
    const formulaRef = ref(database, "formula");
    const snapshot = await get(formulaRef);
    return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
}

// Fungsi untuk menghitung rata-rata dari semua nilai quiz
async function fetchAverageQuizScore() {
    const quizRef = ref(database, "quiz_result");
    const snapshot = await get(quizRef);
    if (!snapshot.exists()) return 0;

    let totalScore = 0;
    let totalAttempts = 0;

    Object.values(snapshot.val()).forEach(user => {
        if (user.quizHistory) {
            Object.values(user.quizHistory).forEach(attempt => {
                totalScore += attempt.score;
                totalAttempts++;
            });
        }
    });

    return totalAttempts > 0 ? (totalScore / totalAttempts).toFixed(2) : 0;
}

// Fungsi utama untuk mengambil dan menampilkan data di dashboard
async function loadDashboardData() {
    try {
        const userCount = await fetchUserCount();
        const questionCount = await fetchQuestionCount();
        const formulaCount = await fetchFormulaCount();
        const avgScore = await fetchAverageQuizScore();

        document.getElementById("user-count").textContent = userCount;
        document.getElementById("question-count").textContent = questionCount;
        document.getElementById("formula-count").textContent = formulaCount;
        document.getElementById("avg-score").textContent = avgScore;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    }
}

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData();
});
