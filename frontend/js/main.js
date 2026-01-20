document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchBox");
  const suggestions = document.getElementById("suggestions");
  const results = document.getElementById("results");
  const downloadBtn = document.getElementById("downloadBtn");
  let currentData = null; // Store latest drug data

  input.addEventListener("input", () => {
    const query = input.value.trim();
    results.innerHTML = "";
    downloadBtn.style.display = "none";
    currentData = null;

    if (!query) {
      suggestions.innerHTML = "";
      return;
    }

    fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        suggestions.innerHTML = "";
        if (data.length === 0) {
          const li = document.createElement("li");
          li.textContent = "No matches found.";
          li.style.color = "gray";
          suggestions.appendChild(li);
          return;
        }

        data.forEach((drug) => {
          const li = document.createElement("li");
          li.textContent = drug;
          li.style.cursor = "pointer";
          li.onclick = () => {
            input.value = drug;
            suggestions.innerHTML = "";
            fetchDrugInfo(drug);
          };
          suggestions.appendChild(li);
        });
      })
      .catch((err) => {
        console.error("Search error:", err);
        suggestions.innerHTML =
          "<li style='color:red'>Error fetching suggestions.</li>";
      });
  });

  function fetchDrugInfo(drug) {
    fetch(
      `http://localhost:5000/api/drug-info?name=${encodeURIComponent(drug)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          results.innerHTML = `<p style="color:red">${data.error}</p>`;
          downloadBtn.style.display = "none";
          currentData = null;
          return;
        }

        currentData = { drug, ...data }; // Store data for download
        downloadBtn.style.display = "inline-block";

        const sideEffects = data.side_effects.length
          ? `<ul>${data.side_effects
              .map((se) => `<li>${se}</li>`)
              .join("")}</ul>`
          : "<p>None found.</p>";

        const genes = data.genes.length
          ? `<ul>${data.genes.map((g) => `<li>${g}</li>`).join("")}</ul>`
          : "<p>None found.</p>";

        results.innerHTML = `
                    <h3>💊 Side Effects (${data.side_effects.length})</h3>
                    ${sideEffects}
                    <h3>🧬 Affected Genes (${data.genes.length})</h3>
                    ${genes}
                `;
      })
      .catch((err) => {
        console.error("Drug info error:", err);
        results.innerHTML =
          "<p style='color:red'>Failed to load drug information.</p>";
        downloadBtn.style.display = "none";
        currentData = null;
      });
  }

  downloadBtn.addEventListener("click", () => {
    if (!currentData) return;

    const { drug, side_effects, genes } = currentData;

    let csv = `Drug,Type,Item\n`;
    side_effects.forEach((se) => {
      csv += `"${drug}","Side Effect","${se}"\n`;
    });
    genes.forEach((g) => {
      csv += `"${drug}","Gene","${g}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${drug.replace(/\s+/g, "_")}_info.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
