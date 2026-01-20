import os
import pickle
import networkx as nx

# Get absolute path to current directory
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

def load_graph_model(path="graph_model_bundle.pkl"):
    full_path = os.path.join(DATA_DIR, path)
    with open(full_path, "rb") as f:
        data = pickle.load(f)
    return data["graph"], data["name_map"], data["node_type_map"]

def load_id_to_name_mapping(path="drug_id_to_name_854.pkl"):
    full_path = os.path.join(DATA_DIR, path)
    with open(full_path, "rb") as f:
        return pickle.load(f)

def load_and_remap_graph():
    raw_G, name_map, node_type_map = load_graph_model()
    id_to_name = load_id_to_name_mapping()

    G = nx.Graph()
    for u, v, data in raw_G.edges(data=True):
        u_label = id_to_name.get(u, u) if node_type_map.get(u) == "drug" else u
        v_label = id_to_name.get(v, v) if node_type_map.get(v) == "drug" else v
        G.add_edge(u_label, v_label, **data)

    drug_names = sorted([
        id_to_name[did] for did, ntype in node_type_map.items()
        if ntype == "drug" and did in id_to_name
    ])

    return G, drug_names, name_map
