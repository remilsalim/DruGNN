# backend/app.py

from flask import Flask, jsonify, request
from flask_cors import CORS
from utils.graph_utils import load_and_remap_graph

import logging

# --- App Setup ---
app = Flask(__name__)
CORS(app)  # You can limit with CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# --- Logging ---
logging.basicConfig(level=logging.INFO)

# --- Load Graph Data ---
try:
    G, drug_names, name_map = load_and_remap_graph()
    logging.info("Graph model loaded successfully.")
except Exception as e:
    logging.error(f"Failed to load graph model: {e}")
    G, drug_names, name_map = None, [], {}

# --- Routes ---
@app.route("/api/search")
def search():
    query = request.args.get("q", "").strip().lower()
    if not query:
        return jsonify([])

    matches = [name for name in drug_names if query in name.lower()]
    return jsonify(matches)


@app.route("/api/drug-info")
def drug_info():
    drug = request.args.get("name")

    if not drug:
        return jsonify({"error": "Drug name not provided"}), 400

    if G is None or drug not in G:
        return jsonify({"error": "Drug not found in the graph"}), 404

    side_effects = []
    genes = []

    for neighbor in G.neighbors(drug):
        edge_data = G[drug][neighbor]
        edge_type = edge_data.get("edge_type")
        label = name_map.get(neighbor, neighbor)

        if edge_type == "drug-se":
            side_effects.append(label)
        elif edge_type == "drug-gene":
            if not label.startswith("ENSG00") and not label.startswith("LOC"):
                genes.append(label)

    return jsonify({
        "side_effects": sorted(side_effects),
        "genes": sorted(genes)
    })


# --- Start the Server ---
if __name__ == "__main__":
    app.run(debug=True)
