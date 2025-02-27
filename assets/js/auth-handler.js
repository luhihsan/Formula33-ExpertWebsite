import { database } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function login(event) {
    event.preventDefault(); 

    const usernameInput = document.getElementById("username").value.trim();
    const passwordInput = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("error-message");

    if (!usernameInput || !passwordInput) {
        errorMessage.innerText = "Username dan Password wajib diisi!";
        return;
    }

    try {
        const userRef = ref(database, "user");
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            errorMessage.innerText = "Data pengguna tidak ditemukan!";
            return;
        }

        const users = snapshot.val();
        let userFound = null;

        Object.values(users).forEach(user => {
            if (user.username.toLowerCase() === usernameInput.toLowerCase()) {
                userFound = user;
            }
        });

        if (!userFound) {
            errorMessage.innerText = "Username tidak ditemukan!";
            return;
        }

        const hashedPassword = await hashPassword(passwordInput);

        if (hashedPassword === userFound.password) {
            localStorage.setItem("user", JSON.stringify(userFound));
            window.location.href = "index.html";
        } else {
            errorMessage.innerText = "Password salah!";
        }

    } catch (error) {
        console.error("Error saat login:", error);
        errorMessage.innerText = "Terjadi kesalahan saat login.";
    }
}

document.getElementById("login-form").addEventListener("submit", login);
