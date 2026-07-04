import os
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.3,
)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful AI Career Assistant."),
        ("human", "{question}")
    ]
)

chain = prompt | llm


def ask_ai(question: str):
    response = chain.invoke({"question": question})
    return response.content