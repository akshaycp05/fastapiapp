import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

try:
    from langchain_groq import ChatGroq
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import StrOutputParser
except ImportError:  # pragma: no cover - gracefully handles missing optional deps
    ChatGroq = None
    ChatPromptTemplate = None
    StrOutputParser = None

_chain = None


def _build_chain():
    global _chain
    if _chain is not None:
        return _chain

    if not GROQ_API_KEY or ChatGroq is None or ChatPromptTemplate is None or StrOutputParser is None:
        return None

    llm = ChatGroq(
        groq_api_key=GROQ_API_KEY,
        model_name="llama-3.3-70b-versatile",
        temperature=0.4,
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                You are TalentSpark AI.

                You are an AI Career Assistant.

                You help users with:
                - Resume Analysis
                - Career Guidance
                - Job Recommendations
                - Interview Preparation
                - ATS Resume Tips
                - AI/ML Learning Roadmaps

                Always give clear, short and professional answers.
                """,
            ),
            ("human", "{question}"),
        ]
    )

    _chain = prompt | llm | StrOutputParser()
    return _chain


def ask_ai(question: str) -> str:
    """Generate an AI response with a helpful fallback when the provider is unavailable."""
    chain = _build_chain()

    if chain is None:
        return (
            "TalentSpark AI is currently unavailable, but I can still help with job search tips, "
            "resume guidance, and interview prep. "
            f"You asked: {question}"
        )

    try:
        return chain.invoke({"question": question})
    except Exception as e:
        return (
            "The AI assistant hit a temporary issue. Please try again in a moment. "
            f"Details: {e}"
        )