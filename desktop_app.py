import os
import sys
import time
import threading
import subprocess
import urllib.request
import webview

def wait_for_backend(url="http://localhost:8000/health", timeout=20):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url, timeout=1) as response:
                if response.status == 200:
                    return True
        except Exception:
            time.sleep(0.5)
    return False

def start_backend():
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
    sys.path.insert(0, backend_dir)
    os.environ["PYTHONPATH"] = backend_dir

    import uvicorn
    from main import app
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")

def main():
    # 1. Start backend server in a background daemon thread if not already running
    try:
        with urllib.request.urlopen("http://localhost:8000/health", timeout=1) as res:
            server_already_running = (res.status == 200)
    except Exception:
        server_already_running = False

    if not server_already_running:
        t = threading.Thread(target=start_backend, daemon=True)
        t.start()
        wait_for_backend()

    # 2. Create and launch native desktop software window
    window = webview.create_window(
        title="CLIPMIND AI — Universal Video Clipping Studio",
        url="http://localhost:8000",
        width=1340,
        height=880,
        min_size=(960, 640),
        background_color="#08090d",
        text_select=True,
    )
    webview.start()

if __name__ == "__main__":
    main()
