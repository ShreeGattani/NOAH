from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.app.services.websocket import manager


router = APIRouter()


@router.websocket("/ws")
async def websocket(websocket: WebSocket):

    await manager.connect(websocket)

    try:
        while True:
            await websocket.receive()

    except WebSocketDisconnect:
        manager.disconnect(websocket)