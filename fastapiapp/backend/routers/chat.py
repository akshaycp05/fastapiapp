from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.langchain_service import ask_ai

router = APIRouter(
    prefix="/chat",
    tags=["AI Chatbot"]
)


class ChatRequest(BaseModel):
    # accept either 'question' (backend) or 'message' (frontend) for compatibility
    question: Optional[str] = None
    message: Optional[str] = None
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # prefer 'question', fall back to 'message' from frontend
        text = request.question or request.message
        if not text:
            raise HTTPException(status_code=400, detail="No question/message provided")

        answer = ask_ai(text)

        return ChatResponse(response=answer)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error: {str(e)}"
        )