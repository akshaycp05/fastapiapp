from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
import os

load_dotenv()


model = ChatGoogleGenerativeAI(
    api_key=os.getenv("GEMINIAPIKEY"),
    model="gemini-2.5-flash",
    temperature=0.5
)


def llm_response(question:str):
    response = model.invoke(question)
    return response.content