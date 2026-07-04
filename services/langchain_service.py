import os
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.4,
    api_key=os.getenv("OPENAI_API_KEY")
)

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
            You are TalentSpark AI.

            You help students with:

            • Resume Analysis
            • Career Guidance
            • Job Recommendations
            • Interview Preparation
            • ATS Tips

            Keep answers short and professional.
            """
        ),
        ("human", "{question}")
    ]
)

chain = prompt | llm


def ask_ai(question: str):
    response = chain.invoke({"question": question})
    return response.content 