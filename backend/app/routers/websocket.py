from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.app.services.websocket import manager


router = APIRouter()


@router.websocket("/ws")
@router.websocket("/ws/live")
async def websocket(websocket: WebSocket):

    await manager.connect(websocket)

    try:
        while True:
            await websocket.receive_text()
    except (WebSocketDisconnect, Exception):
        manager.disconnect(websocket)