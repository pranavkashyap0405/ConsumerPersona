from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import uuid
from app.database import get_db
from app.chatbot.agent import chat

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
def chat_endpoint(message: str, session_id: str = None, db: Session = Depends(get_db)):
    if not session_id:
        session_id = str(uuid.uuid4())
    return chat(message, session_id, db)
