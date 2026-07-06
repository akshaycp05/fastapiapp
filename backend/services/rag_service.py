import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from services.qdrant_service import search_jobs

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.3,
)

rag_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a job search assistant.
Use the following job listings retrieved from the database to answer the user's question.
If no relevant jobs are found, say so clearly.

Retrieved Jobs:
{context}"""),
    ("human", "{question}")
])

rag_chain = rag_prompt | llm


def rag_job_search(question: str) -> str:
    results = search_jobs(question, top_k=5)

    if not results:
        return "No jobs found in the database. Please embed jobs first using the /rag/embed-jobs endpoint."

    context = "\n".join([
        f"- {r['title']}: {r['description']} (Salary: {r['salary']}, Match: {r['score']})"
        for r in results
    ])

    response = rag_chain.invoke({"context": context, "question": question})
    return response.content

    #             User
    #               │
    #               ▼
    #  "Find Python Backend Jobs"
    #               │
    #               ▼
    #      rag_job_search()
    #               │
    #               ▼
    #   search_jobs(question)
    #               │
    #               ▼
    #     Convert Query to Embedding
    #               │
    #               ▼
    #   Qdrant Vector Search (Top 5)
    #               │
    #               ▼
    #   Retrieved Job Listings
    #               │
    #               ▼
    #   Build Context String
    #               │
    #               ▼
    #   ChatPromptTemplate
    #   ┌─────────────────────────────┐
    #   │ System Message              │
    #   │ Retrieved Jobs (context)    │
    #   │ Human Question              │
    #   └─────────────────────────────┘
    #               │
    #               ▼
    #       ChatGroq (Llama 3.3 70B)
    #               │
    #               ▼
    #   AI Generates Final Response
    #               │
    #               ▼
    #      response.content
    #               │
    #               ▼
    #          Return to User