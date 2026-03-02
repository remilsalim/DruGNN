document.addEventListener("DOMContentLoaded", () => {
    // API Configuration - Attempt to resolve correctly for local environments
    const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
        ? "http://127.0.0.1:5000/api" 
        : "/api";

    const input = document.getElementById("searchBox");
    const suggestions = document.getElementById("suggestions");
    const suggestionsWrapper = document.getElementById("suggestionsWrapper");
    const loader = document.getElementById("loader");
    
    // View Elements
    const welcomeView = document.getElementById("welcomeView");
    const resultsView = document.getElementById("resultsView");
    const errorView = document.getElementById("errorView");
    
    // Result Detail Elements
    const activeDrugName = document.getElementById("activeDrugName");
    const resultCountBadge = document.getElementById("resultCountBadge");
    const sideEffectsList = document.getElementById("sideEffectsList");
    const seCount = document.getElementById("seCount");
    const genesList = document.getElementById("genesList");
    const geneCount = document.getElementById("geneCount");
    const downloadBtn = document.getElementById("downloadBtn");

    let currentData = null;
    let searchTimeout = null;

    // --- Search with Debouncing ---
    input.addEventListener("input", () => {
        const query = input.value.trim();
        
        // Clear previous state
        if (!query) {
            suggestions.innerHTML = "";
            suggestionsWrapper.style.display = "none";
            return;
        }

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchSuggestions(query);
        }, 300);
    });

    async function fetchSuggestions(query) {
        try {
            loader.style.display = "block";
            const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            
            suggestions.innerHTML = "";
            if (data.length > 0) {
                suggestionsWrapper.style.display = "block";
                data.slice(0, 8).forEach(drug => {
                    const li = document.createElement("li");
                    li.textContent = drug;
                    li.onclick = () => selectDrug(drug);
                    suggestions.appendChild(li);
                });
            } else {
                suggestionsWrapper.style.display = "none";
            }
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            loader.style.display = "none";
        }
    }

    function selectDrug(drug) {
        input.value = drug;
        suggestionsWrapper.style.display = "none";
        fetchDrugInfo(drug);
    }

    async function fetchDrugInfo(drug) {
        switchView("loading");
        
        try {
            const res = await fetch(`${API_BASE}/drug-info?name=${encodeURIComponent(drug)}`);
            const data = await res.json();

            if (data.error) {
                showError(data.error);
                return;
            }

            renderResults(drug, data);
        } catch (err) {
            console.error("Info fetch error:", err);
            showError("The server could not be reached. Please ensure the backend is running.");
        }
    }

    function renderResults(drug, data) {
        currentData = { drug, ...data };
        
        activeDrugName.textContent = drug;
        const totalRels = data.side_effects.length + data.genes.length;
        resultCountBadge.textContent = `${totalRels} Relationships`;

        // Render Side Effects
        seCount.textContent = data.side_effects.length;
        sideEffectsList.innerHTML = data.side_effects.length 
            ? data.side_effects.map(se => `<span>${se}</span>`).join("")
            : "<p class='no-data'>No documented side effects found.</p>";

        // Render Genes
        geneCount.textContent = data.genes.length;
        genesList.innerHTML = data.genes.length 
            ? data.genes.map(g => `<span>${g}</span>`).join("")
            : "<p class='no-data'>No gene interactions found.</p>";

        switchView("results");
    }

    function switchView(viewName) {
        welcomeView.style.display = "none";
        resultsView.style.display = "none";
        errorView.style.display = "none";

        if (viewName === "results") {
            resultsView.style.display = "block";
        } else if (viewName === "error") {
            errorView.style.display = "block";
        } else if (viewName === "loading") {
            // We could add a full page blur/loader here if desired
            loader.style.display = "block";
        }
    }

    function showError(msg) {
        document.getElementById("errorMessage").textContent = msg;
        switchView("error");
        loader.style.display = "none";
    }

    // --- CSV Export ---
    downloadBtn.addEventListener("click", () => {
        if (!currentData) return;
        const { drug, side_effects, genes } = currentData;

        let csv = `Drug,Type,Entity\n`;
        side_effects.forEach(se => csv += `"${drug}","Side Effect","${se}"\n`);
        genes.forEach(g => csv += `"${drug}","Gene Interaction","${g}"\n`);

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `DrugNN_${drug.replace(/\s+/g, "_")}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Close suggestions when clicking outside
    document.addEventListener("click", (e) => {
        if (!input.contains(e.target) && !suggestions.contains(e.target)) {
            suggestionsWrapper.style.display = "none";
        }
    });
});

