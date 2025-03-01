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

// Fungsi untuk mendapatkan pengguna dengan nilai tertinggi dan nilai terendah
async function fetchTopAndLowestScorer() {
    const quizRef = ref(database, "quiz_result");
    const userRef = ref(database, "user");
    const quizSnapshot = await get(quizRef);
    const userSnapshot = await get(userRef);

    if (!quizSnapshot.exists() || !userSnapshot.exists()) return { top: null, lowest: null };

    const quizData = quizSnapshot.val();
    const usersData = userSnapshot.val();

    let topScorer = { username: "Tidak Ada", score: 0 };
    let lowestScore = Infinity;

    Object.keys(quizData).forEach(userId => {
        const userQuiz = quizData[userId].quizHistory;
        if (userQuiz) {
            const scores = Object.values(userQuiz).map(q => q.score);
            const highestScore = Math.max(...scores);
            const lowestUserScore = Math.min(...scores);

            // Update Top Scorer jika menemukan skor lebih tinggi
            if (highestScore > topScorer.score) {
                topScorer = {
                    username: usersData[userId]?.username || "Unknown",
                    score: highestScore
                };
            }

            // Update nilai terendah jika menemukan skor lebih rendah
            if (lowestUserScore < lowestScore) {
                lowestScore = lowestUserScore;
            }
        }
    });

    return { top: topScorer, lowest: lowestScore };
}

// Fungsi untuk menghitung jumlah pengguna yang memiliki setidaknya satu nilai >= 20
async function fetchUsersAboveAverage() {
    const quizRef = ref(database, "quiz_result");
    const snapshot = await get(quizRef);
    if (!snapshot.exists()) return { count: 0, totalUsers: 0 };

    let totalUsers = Object.keys(snapshot.val()).length;
    let usersAboveAverage = 0;

    Object.values(snapshot.val()).forEach(user => {
        if (user.quizHistory) {
            const hasAboveAverage = Object.values(user.quizHistory).some(q => q.score >= 20);
            if (hasAboveAverage) {
                usersAboveAverage++;
            }
        }
    });

    return { count: usersAboveAverage, totalUsers: totalUsers };
}

// Fungsi untuk menghitung rata-rata jumlah percobaan quiz pengguna
async function fetchAverageQuizAttempts() {
    const quizRef = ref(database, "quiz_result");
    const snapshot = await get(quizRef);
    if (!snapshot.exists()) return 0;

    let totalAttempts = 0;
    let totalUsers = 0;

    Object.values(snapshot.val()).forEach(user => {
        if (user.quizHistory) {
            totalAttempts += Object.keys(user.quizHistory).length;
            totalUsers++;
        }
    });

    return totalUsers > 0 ? Math.round(totalAttempts / totalUsers) : 0;
}

async function loadDashboardData() {
    try {
        const userCount = await fetchUserCount();
        const questionCount = await fetchQuestionCount();
        const formulaCount = await fetchFormulaCount();
        const avgScore = await fetchAverageQuizScore();
        const { top, lowest } = await fetchTopAndLowestScorer();
        const { count: usersAboveAvg, totalUsers } = await fetchUsersAboveAverage();
        const avgAttempts = await fetchAverageQuizAttempts();

        document.getElementById("user-count").textContent = userCount;
        document.getElementById("question-count").textContent = questionCount;
        document.getElementById("formula-count").textContent = formulaCount;
        document.getElementById("avg-score").textContent = avgScore;

        document.getElementById("top-scorer-name").textContent = top.username;
        document.getElementById("top-scorer-score").textContent = top.score;
        document.getElementById("lowest-scorer-score").textContent = lowest;

        document.getElementById("users-above-avg").textContent = usersAboveAvg;
        document.getElementById("users-above-avg-footer").textContent = `Dari keseluruhan jumlah ${userCount} user `;

        document.getElementById("avg-quiz-attempts").textContent = avgAttempts;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    }
}

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData();
});


