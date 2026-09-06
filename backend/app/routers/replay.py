import sys
import os
import tempfile
import subprocess
from pathlib import Path
from fastapi import APIRouter

router = APIRouter(prefix="/replay", tags=["Replay"])

SURGE_FILE = Path(tempfile.gettempdir()) / "noah_surge_faults.flag"
active_process = None

@router.post("/start")
def start_replay():
    global active_process
    if active_process and active_process.poll() is None:
        return {"status": "already_running"}
    script_path = Path(__file__).resolve().parent.parent.parent.parent / "pipeline" / "live_replay.py"
    active_process = subprocess.Popen([sys.executable, str(script_path), "--interval", "15"])
    return {"status": "started"}

@router.post("/stop")
def stop_replay():
    global active_process
    if active_process and active_process.poll() is None:
        active_process.terminate()
        active_process = None
        return {"status": "stopped"}
    return {"status": "not_running"}

@router.post("/surge-faults")
def surge_faults():
    SURGE_FILE.touch()
    return {"status": "surge_initiated"}

@router.get("/status")
def replay_status():
    global active_process
    running = active_process is not None and active_process.poll() is None
    return {"running": running}
