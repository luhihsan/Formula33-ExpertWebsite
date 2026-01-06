import { database } from "./firebase-config.js";
import {
  ref,
  get,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function truncate(str = "", max = 80) {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}

function refreshDataTable() {
  const $ = window.jQuery;
  if (!$) return; 
  const table = $(".table");
  if ($.fn.DataTable && $.fn.dataTable && $.fn.dataTable.isDataTable) {
    if ($.fn.dataTable.isDataTable(table)) {
      table.DataTable().destroy();
    }
  }

  if ($.fn.DataTable) {
    table.DataTable({
      pageLength: 25,
      lengthChange: false,
      ordering: true,
      autoWidth: false,
    });
  }
}

function enableTooltips(root = document) {
  if (!window.bootstrap) return;
  const triggerList = [].slice.call(
    root.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  triggerList.forEach((el) => new bootstrap.Tooltip(el));
}


async function loadFormulas() {
  const formulaRef = ref(database, "formula");

  try {
    const snapshot = await get(formulaRef);
    const tableBody = document.getElementById("formula-table-body");

    if (!tableBody) {
      console.error("Tabel tidak ditemukan! Pastikan ID #formula-table-body ada.");
      return;
    }

    tableBody.innerHTML = "";

    if (!snapshot.exists()) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td colspan="8" class="text-center text-muted">Belum ada data formula.</td>
      `;
      tableBody.appendChild(row);
      refreshDataTable();
      return;
    }

    const data = snapshot.val();
    const keys = Object.keys(data).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    let rowIndex = 1;

    keys.forEach((formulaId) => {
      const formula = data[formulaId] || {};
      const namaFormula = formulaId;

      const jenisKalimat = formula.jenis_kalimat || "-";
      const aspek = formula.aspek || "-";
      const waktu = formula.waktu || "-";

      // NEW: isi formula (pakai key "isi")
      const isiRaw = formula.isi || "-";
      const isiShort = truncate(String(isiRaw), 60);
      const isiSafe = escapeHTML(isiShort);
      const isiFullSafe = escapeHTML(String(isiRaw));

      const exampleRaw = formula.example || "-";
      const exampleShort = truncate(String(exampleRaw), 80);
      const exampleSafe = escapeHTML(exampleShort);
      const exampleFullSafe = escapeHTML(String(exampleRaw));

      const row = document.createElement("tr");
      row.innerHTML = `
        <th scope="row" class="text-center">${rowIndex++}</th>
        <td>${escapeHTML(namaFormula)}</td>
        <td>${escapeHTML(jenisKalimat)}</td>
        <td>${escapeHTML(aspek)}</td>
        <td>${escapeHTML(waktu)}</td>

        <td>
          <span
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="${isiFullSafe}"
            style="display:inline-block; max-width: 420px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
          >${isiSafe}</span>
        </td>

        <td>
          <span
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="${exampleFullSafe}"
            style="display:inline-block; max-width: 520px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
          >${exampleSafe}</span>
        </td>

        <td class="text-center">
          <button class="btn btn-outline-info btn-rounded me-1" onclick="editFormula('${namaFormula}')">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-outline-danger btn-rounded" onclick="deleteFormula('${namaFormula}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
   });

    enableTooltips(tableBody);
    refreshDataTable();
  } catch (error) {
    console.error("Error mengambil data dari Firebase:", error);
  }
}

window.editFormula = async function (formulaId) {
  const formulaRef = ref(database, `formula/${formulaId}`);

  try {
    const snapshot = await get(formulaRef);
    if (!snapshot.exists()) {
      alert("Data formula tidak ditemukan.");
      return;
    }

    const data = snapshot.val();

    document.getElementById("editFormulaId").value = formulaId;
    document.getElementById("editNamaFormula").value = formulaId;
    document.getElementById("editJenisKalimat").value = data.jenis_kalimat || "";
    document.getElementById("editAspek").value = data.aspek || "";
    document.getElementById("editWaktu").value = data.waktu || "";
    document.getElementById("editIsiFormula").value = data.isi || "";
    document.getElementById("editExample").value = data.example || "";

    new bootstrap.Modal(document.getElementById("editFormulaModal")).show();
  } catch (error) {
    console.error("Error mengambil data formula untuk edit:", error);
  }
};

document
  .getElementById("editFormulaForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const oldFormulaId = document.getElementById("editFormulaId").value;
    const newFormulaId = document.getElementById("editNamaFormula").value.trim();

    const updatedData = {
      jenis_kalimat: document.getElementById("editJenisKalimat").value,
      aspek: document.getElementById("editAspek").value,
      waktu: document.getElementById("editWaktu").value,
      isi: document.getElementById("editIsiFormula").value?.trim() || "",
      example: document.getElementById("editExample").value?.trim() || ""
    };

    try {
      const oldRef = ref(database, `formula/${oldFormulaId}`);

      if (oldFormulaId !== newFormulaId) {
        await update(ref(database, `formula/${newFormulaId}`), updatedData);
        await remove(oldRef);
      } else {
        await update(oldRef, updatedData);
      }

      alert("Formula berhasil diperbarui!");
      loadFormulas();
      bootstrap.Modal.getInstance(
        document.getElementById("editFormulaModal")
      ).hide();
    } catch (error) {
      console.error("Gagal memperbarui formula:", error);
      alert("Terjadi kesalahan saat menyimpan perubahan.");
    }
  });

window.deleteFormula = async function (formulaId) {
  const confirmDelete = confirm(
    `Apakah Anda yakin ingin menghapus formula "${formulaId}"?`
  );
  if (!confirmDelete) return;

  try {
    await remove(ref(database, `formula/${formulaId}`));
    alert(`Formula "${formulaId}" berhasil dihapus.`);
    loadFormulas();
  } catch (error) {
    console.error("Gagal menghapus formula:", error);
    alert("Terjadi kesalahan saat menghapus formula.");
  }
};


document.addEventListener("DOMContentLoaded", () => {
  loadFormulas();
});
