import os
import sys
import time
import threading
import subprocess
import urllib.request
import webbrowser

def wait_for_backend(url="http://localhost:8000/health", timeout=30):
    start = time.time()
    print("[CLIPMIND AI] Waiting for local AI engine on port 8000...")
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url, timeout=1) as response:
                if response.status == 200:
                    print("[CLIPMIND AI] Backend engine is ready and healthy!")
                    return True
        except Exception:
            time.sleep(0.5)
    print("[CLIPMIND AI] Timeout waiting for backend engine.")
    return False

def start_backend():
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
    sys.path.insert(0, backend_dir)
    os.environ["PYTHONPATH"] = backend_dir

    import uvicorn
    from main import app
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")

def main():
    print("=" * 60)
    print("       CLIPMIND AI - Universal Video Clipping Studio")
    print("=" * 60)

    # 1. Start backend server in a background daemon thread if not already running
    try:
        with urllib.request.urlopen("http://localhost:8000/health", timeout=1) as res:
            server_already_running = (res.status == 200)
    except Exception:
        server_already_running = False

    if not server_already_running:
        print("[CLIPMIND AI] Starting local backend services...")
        t = threading.Thread(target=start_backend, daemon=True)
        t.start()
        if not wait_for_backend():
            print("[CLIPMIND AI] Warning: Backend took longer than expected to start.")
    else:
        print("[CLIPMIND AI] Local backend is already running on port 8000.")

    # 2. Try launching native desktop software window via pywebview
    webview_launched = False
    try:
        import webview
        print("[CLIPMIND AI] Opening native desktop studio window...")
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
        webview_launched = True
    except Exception as e:
        print(f"[CLIPMIND AI] Native window encountered: {e}")
        print("[CLIPMIND AI] Launching via browser mode fallback at http://localhost:8000 ...")

    # 3. If native window didn't run or failed, open default browser and keep server alive
    if not webview_launched:
        webbrowser.open("http://localhost:8000")
        print("[CLIPMIND AI] Studio opened in your web browser at http://localhost:8000")
        print("[CLIPMIND AI] Press Ctrl+C in this terminal window to stop the studio.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("[CLIPMIND AI] Shutting down...")

if __name__ == "__main__":
    main()
