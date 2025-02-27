import { database } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

async function loadFormulas() {
    const formulaRef = ref(database, "formula");

    try {
        const snapshot = await get(formulaRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            const tableBody = document.querySelector("table tbody");

            if (!tableBody) {
                console.error("Tabel tidak ditemukan! Pastikan ID tabel benar.");
                return;
            }

            tableBody.innerHTML = ""; // Kosongkan tabel sebelum diisi ulang

            let rowIndex = 1; // Untuk nomor urut

            Object.keys(data).forEach((formulaId) => {
                const formula = data[formulaId];

                // Pastikan nilai ada, jika tidak, gunakan "-"
                const namaFormula = formulaId; // ID digunakan sebagai Nama Formula
                const jenisKalimat = formula.jenis_kalimat || "-";
                const aspek = formula.aspek || "-";
                const waktu = formula.waktu || "-";

                // Buat baris baru dalam tabel
                const row = `
                    <tr>
                        <th scope="row" class="text-center">${rowIndex++}</th>
                        <td>${namaFormula}</td>
                        <td>${jenisKalimat}</td>
                        <td>${aspek}</td>
                        <td>${waktu}</td>
                        <td class="text-center">
                            <button class="btn btn-outline-info btn-rounded" onclick="editFormula('${formulaId}')"><i class="fas fa-pen"></i></button>
                            <button class="btn btn-outline-danger btn-rounded" onclick="deleteFormula('${formulaId}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;

                tableBody.innerHTML += row;
            });

        } else {
            console.log("Tidak ada data formula yang ditemukan di Firebase.");
        }

    } catch (error) {
        console.error("Error mengambil data dari Firebase:", error);
    }
}

// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    loadFormulas();
});
