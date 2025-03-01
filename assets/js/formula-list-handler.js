import { database } from "./firebase-config.js";
import { ref, get, remove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

async function loadFormulas() {
    const formulaRef = ref(database, "formula");

    try {
        const snapshot = await get(formulaRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            const tableBody = document.getElementById("formula-table-body");

            if (!tableBody) {
                console.error("Tabel tidak ditemukan! Pastikan ID tabel benar.");
                return;
            }

            tableBody.innerHTML = ""; 

            let rowIndex = 1;

            Object.keys(data).forEach((formulaId) => {
                const formula = data[formulaId];

                const namaFormula = formulaId; 
                const jenisKalimat = formula.jenis_kalimat || "-";
                const aspek = formula.aspek || "-";
                const waktu = formula.waktu || "-";

                const row = document.createElement("tr");
                row.innerHTML = `
                    <th scope="row" class="text-center">${rowIndex++}</th>
                    <td>${namaFormula}</td>
                    <td>${jenisKalimat}</td>
                    <td>${aspek}</td>
                    <td>${waktu}</td>
                    <td class="text-center">
                        <button class="btn btn-outline-info btn-rounded" onclick="editFormula('${formulaId}')"><i class="fas fa-pen"></i></button>
                        <button class="btn btn-outline-danger btn-rounded" onclick="deleteFormula('${formulaId}')"><i class="fas fa-trash"></i></button>
                    </td>
                `;

                tableBody.appendChild(row);
            });

        } else {
            console.log("Tidak ada data formula yang ditemukan di Firebase.");
        }

    } catch (error) {
        console.error("Error mengambil data dari Firebase:", error);
    }
}

window.deleteFormula = async function (formulaId) {
    const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus formula "${formulaId}"?`);

    if (confirmDelete) {
        try {
            const formulaRef = ref(database, `formula/${formulaId}`);
            await remove(formulaRef);
            alert(`Formula "${formulaId}" berhasil dihapus.`);
            loadFormulas();
        } catch (error) {
            console.error("Gagal menghapus formula:", error);
            alert("Terjadi kesalahan saat menghapus formula.");
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    loadFormulas();
});
