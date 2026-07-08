import os
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Load environment variables
load_dotenv()

# Get API Key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY not found. Please add it to your .env file."
    )

# Initialize Groq LLM
llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile",
    temperature=0.4,
)

# Prompt Template
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

# Create Chain
chain = prompt | llm | StrOutputParser()


def ask_ai(question: str) -> str:
    """Generate an AI response."""
    try:
        return chain.invoke({"question": question})
    except Exception as e:
        return f"AI Error: {str(e)}"