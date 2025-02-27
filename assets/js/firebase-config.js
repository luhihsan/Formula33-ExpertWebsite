import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyARfHxrgbyyxS-DZxiUuILhYusWASFdgPg",
    authDomain: "formula33-v2.firebaseapp.com",
    databaseURL: "https://formula33-v2-default-rtdb.firebaseio.com",
    projectId: "formula33-v2",
    storageBucket: "formula33-v2.firebasestorage.app",
    messagingSenderId: "961836629104",
    appId: "1:961836629104:web:38e7a805db3f4fe3f0c8b5",
    measurementId: "G-173QEYKY2G"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
