from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.langchain_service import ask_ai

router = APIRouter(
    prefix="/chat",
    tags=["AI Chatbot"]
)


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    response: str


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        answer = ask_ai(request.question)

        return ChatResponse(
            response=answer
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error: {str(e)}"
        )