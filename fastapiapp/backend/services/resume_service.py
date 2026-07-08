import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.3,
)

resume_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a professional resume analyser.
Analyse the given resume text and provide:
1. Key Skills found
2. Experience Level (Junior/Mid/Senior)
3. Strengths
4. Areas to Improve
5. Suggested Job Roles

Keep the analysis short and structured."""),
    ("human", "{resume_text}")
])

resume_chain = resume_prompt | llm


def analyse_resume(resume_text: str) -> str:
    response = resume_chain.invoke({"resume_text": resume_text})
    return response.content


    #             User
    #               │
    #               ▼
    #       Upload Resume
    #               │
    #               ▼
    #     Extract Resume Text
    #               │
    #               ▼
    #  analyse_resume(resume_text)
    #               │
    #               ▼
    #   ChatPromptTemplate
    #   ┌────────────────────────────┐
    #   │ System Message             │
    #   │ Resume Text                │
    #   └────────────────────────────┘
    #               │
    #               ▼
    #     ChatGroq (Llama 3.3 70B)
    #               │
    #               ▼
    #   Resume Analysis Generated
    #               │
    #               ▼
    #      response.content
    #               │
    #               ▼
    #      Return to FastAPI
    #               │
    #               ▼
    #     Display to the User