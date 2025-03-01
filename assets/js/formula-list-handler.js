import { database } from "./firebase-config.js";
import { ref, get, update, remove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Fungsi untuk memuat daftar formula dari Firebase
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

// Fungsi untuk membuka modal edit dan mengisi data yang akan diedit
window.editFormula = async function (formulaId) {
    const formulaRef = ref(database, `formula/${formulaId}`);

    try {
        const snapshot = await get(formulaRef);
        if (snapshot.exists()) {
            const data = snapshot.val();

            // Mengisi form modal dengan data yang diambil dari database
            document.getElementById("editFormulaId").value = formulaId;
            document.getElementById("editNamaFormula").value = formulaId;
            document.getElementById("editJenisKalimat").value = data.jenis_kalimat || "";
            document.getElementById("editAspek").value = data.aspek || "";
            document.getElementById("editWaktu").value = data.waktu || "";

            // Menampilkan modal
            new bootstrap.Modal(document.getElementById("editFormulaModal")).show();
        } else {
            alert("Data formula tidak ditemukan.");
        }
    } catch (error) {
        console.error("Error mengambil data formula untuk edit:", error);
    }
};

// Fungsi untuk menyimpan perubahan yang diedit ke Firebase
document.getElementById("editFormulaForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const oldFormulaId = document.getElementById("editFormulaId").value;
    const newFormulaId = document.getElementById("editNamaFormula").value.trim(); // Nama baru formula

    const updatedData = {
        jenis_kalimat: document.getElementById("editJenisKalimat").value,
        aspek: document.getElementById("editAspek").value,
        waktu: document.getElementById("editWaktu").value
    };

    try {
        const formulaRef = ref(database, `formula/${oldFormulaId}`);

        if (oldFormulaId !== newFormulaId) {
            // 1. Tambahkan formula baru dengan nama baru
            await update(ref(database, `formula/${newFormulaId}`), updatedData);

            // 2. Hapus formula lama jika berhasil membuat yang baru
            await remove(formulaRef);
        } else {
            // Jika nama formula tidak diubah, cukup update data yang ada
            await update(formulaRef, updatedData);
        }

        alert("Formula berhasil diperbarui!");
        loadFormulas(); // Muat ulang tabel
        bootstrap.Modal.getInstance(document.getElementById("editFormulaModal")).hide(); // Tutup modal
    } catch (error) {
        console.error("Gagal memperbarui formula:", error);
        alert("Terjadi kesalahan saat menyimpan perubahan.");
    }
});

// Fungsi untuk menghapus formula dengan konfirmasi
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

// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    loadFormulas();
});
