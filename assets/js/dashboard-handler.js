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

// Fungsi untuk menghitung akurasi jawaban pengguna
async function fetchAccuracyPercentage() {
    const quizRef = ref(database, "quiz_result");
    const snapshot = await get(quizRef);
    if (!snapshot.exists()) return 0;

    let totalScore = 0;
    let totalMaxScore = 0;

    Object.values(snapshot.val()).forEach(user => {
        if (user.quizHistory) {
            const attempts = Object.values(user.quizHistory);
            totalScore += attempts.reduce((sum, attempt) => sum + attempt.score, 0);
            totalMaxScore += attempts.length * 100; // Anggap setiap quiz memiliki nilai maksimal 100
        }
    });

    return totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(2) : 0;
}

// Fungsi untuk mendapatkan percobaan quiz tertinggi
async function fetchHighestQuizAttempts() {
    const quizRef = ref(database, "quiz_result");
    const snapshot = await get(quizRef);
    if (!snapshot.exists()) return 0;

    let maxAttempts = 0;

    Object.values(snapshot.val()).forEach(user => {
        if (user.quizHistory) {
            const attemptCount = Object.keys(user.quizHistory).length;
            if (attemptCount > maxAttempts) {
                maxAttempts = attemptCount;
            }
        }
    });

    return maxAttempts;
}

// Fungsi untuk mendapatkan percobaan quiz terendah
async function fetchLowestQuizAttempts() {
    const quizRef = ref(database, "quiz_result");
    const snapshot = await get(quizRef);
    if (!snapshot.exists()) return 0;

    let minAttempts = Infinity;

    Object.values(snapshot.val()).forEach(user => {
        if (user.quizHistory) {
            const attemptCount = Object.keys(user.quizHistory).length;
            if (attemptCount < minAttempts) {
                minAttempts = attemptCount;
            }
        }
    });

    return minAttempts === Infinity ? 0 : minAttempts;
}

// Fungsi untuk menghitung jumlah percobaan dengan nilai sempurna (100)
async function fetchPerfectScoreAttempts() {
    const quizRef = ref(database, "quiz_result");
    const snapshot = await get(quizRef);
    if (!snapshot.exists()) return 0;

    let perfectAttempts = 0;

    Object.values(snapshot.val()).forEach(user => {
        if (user.quizHistory) {
            perfectAttempts += Object.values(user.quizHistory).filter(q => q.score === 100).length;
        }
    });

    return perfectAttempts;
}

// Fungsi untuk menghitung Distribusi Skor
async function fetchScoreDistribution() {
    const quizRef = ref(database, "quiz_result");
    const snapshot = await get(quizRef);
    if (!snapshot.exists()) return [0, 0, 0, 0];

    let scoreBuckets = [0, 0, 0, 0]; // 0-50, 51-70, 71-85, 86-100

    Object.values(snapshot.val()).forEach(user => {
        if (user.quizHistory) {
            Object.values(user.quizHistory).forEach(attempt => {
                let score = attempt.score;
                if (score <= 50) scoreBuckets[0]++;
                else if (score <= 70) scoreBuckets[1]++;
                else if (score <= 85) scoreBuckets[2]++;
                else scoreBuckets[3]++;
            });
        }
    });

    return scoreBuckets;
}

// Fungsi untuk menghitung Tren Rata-rata Skor dari Waktu ke Waktu
async function fetchAverageScoreOverTime() {
    const quizRef = ref(database, "quiz_result");
    const snapshot = await get(quizRef);
    if (!snapshot.exists()) return { dates: [], averages: [] };

    let scoreData = {}; // { "2025-02-01": [22, 45], "2025-02-02": [50] }

    Object.values(snapshot.val()).forEach(user => {
        if (user.quizHistory) {
            Object.values(user.quizHistory).forEach(attempt => {
                let date = attempt.timestamp.split(" ")[0]; // Ambil tanggal dari timestamp
                if (!scoreData[date]) {
                    scoreData[date] = [];
                }
                scoreData[date].push(attempt.score);
            });
        }
    });

    let sortedDates = Object.keys(scoreData).sort(); // Urutkan tanggal
    let averages = sortedDates.map(date => {
        let scores = scoreData[date];
        return scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    return { dates: sortedDates, averages: averages };
}

// Fungsi untuk menggambar chart menggunakan Chart.js
async function renderCharts() {
    const scoreDistribution = await fetchScoreDistribution();
    const { dates, averages } = await fetchAverageScoreOverTime();

    // Chart 1: Distribusi Skor
    new Chart(document.getElementById("scoreDistributionChart"), {
        type: "bar",
        data: {
            labels: ["0-50 (Kurang)", "51-70 (Cukup)", "71-85 (Baik)", "86-100 (Sangat Baik)"],
            datasets: [{
                label: "Jumlah Pengguna",
                data: scoreDistribution,
                backgroundColor: ["#ff4d4d", "#ffcc00", "#66cc66", "#0080ff"],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Chart 2: Tren Rata-rata Skor dari Waktu ke Waktu
    new Chart(document.getElementById("averageScoreChart"), {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                label: "Rata-rata Skor",
                data: averages,
                borderColor: "#007bff",
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: "Tanggal" } },
                y: { title: { display: true, text: "Rata-rata Skor" } }
            }
        }
    });
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
        const accuracy = await fetchAccuracyPercentage();
        const highestAttempts = await fetchHighestQuizAttempts();
        const lowestAttempts = await fetchLowestQuizAttempts();
        const perfectScoreAttempts = await fetchPerfectScoreAttempts();


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
        document.getElementById("accuracy-percentage").textContent = accuracy + "%";
        document.getElementById("highest-attempts").textContent = highestAttempts;
        document.getElementById("lowest-attempts").textContent = lowestAttempts;
        document.getElementById("perfect-score-attempts").textContent = perfectScoreAttempts;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    }
}

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData();
    renderCharts();
});


