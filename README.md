# Drug–Gene–SideEffect Explorer 🧬

A powerful graph-based explorer for discovering relationships between drugs, genes, and side effects. Enter a drug name to instantly visualizes its known side effects and affected genes using a pre-trained graph neural network model.


## 🚀 Features

-   **Instant Search**: Real-time suggestions as you type.
-   **Graph-Based Insights**: Leverages a NetworkX graph model to find direct connections.
-   **Smart Filtering**: Automatically filters out raw Ensembl gene IDs (ENSG00...) for cleaner results.
-   **CSV Export**: Download detailed reports of your findings with one click.
-   **Premium Glassmorphism UI**: A modern, responsive interface with deep gradients and smooth animations.

## 🛠️ Tech Stack

-   **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism), JavaScript (ES6+).
-   **Backend**: Python, Flask, NetworkX.
-   **Data**: Custom graph model (`.pkl` bundle) mapping drugs to genes and side effects.

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/remilsalim/drugnn.git
    cd drugnn
    ```

2.  **Install Backend Dependencies**:
    ```bash
    pip install flask flask-cors networkx
    ```

3.  **Run the Application**:

    *Terminal 1 (Backend):*
    ```bash
    python backend/app.py
    ```

    *Terminal 2 (Frontend):*
    ```bash
    cd frontend
    python -m http.server 8000
    ```

4.  **Open in Browser**:
    Visit `http://localhost:8000`

## 👨‍💻 Author

**Remil Salim**
-   [GitHub](https://github.com/remilsalim)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with passion for data and design.*

