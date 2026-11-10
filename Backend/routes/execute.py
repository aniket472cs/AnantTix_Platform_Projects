from fastapi import APIRouter
from pydantic import BaseModel
import requests

router = APIRouter()

class CodeRequest(BaseModel):
    language: str
    code: str
    stdin: str = ""

API_URL = "https://api.onlinecompiler.io/api/run-code-sync"
API_KEY = "9aa8b58989bfd92ae09ae53b0444de02" # Aapki API Key

# Sirf 5 languages ka map
LANGUAGE_MAP = {
    "python": "python-3.14",
    "java": "openjdk-25",
    "csharp": "dotnet-csharp-10",
    "cpp": "g++-15",
    "c": "gcc-15"
}

@router.post("/compile")
async def compile_code(request: CodeRequest):
    code = request.code
    lang = request.language

    if lang in ["java", "csharp", "cpp", "c"]:
        if code.count('{') != code.count('}'):
            return {"success": False, "error_msg": "Unmatched curly braces '{ }'. Please check."}
        if ("println" in code or "cout" in code or "printf" in code) and ";" not in code:
            return {"success": False, "error_msg": "Missing semicolon ';' at the end of statement."}
    elif lang == "python":
        if "print(" in code and ")" not in code:
            return {"success": False, "error_msg": "SyntaxError: Missing closing parenthesis ')'"}

    return {"success": True, "error_msg": "No errors found"}

@router.post("/execute")
async def execute_code(request: CodeRequest):
    code = request.code
    lang = request.language
    user_input = request.stdin

    compiler_id = LANGUAGE_MAP.get(lang, lang)
    if not compiler_id:
         return {"output": "Language not supported in backend.", "exit_code": 1, "feedback": "AI: Language not mapped."}

    headers = {
        "Authorization": API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "compiler": compiler_id,
        "code": code,
        "input": user_input
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=20)
        
        if response.status_code == 200:
            data = response.json()
            output = data.get("output", "")
            error = data.get("error", "")
            
            if error:
                return {"output": error, "exit_code": 1, "feedback": f"✖ Compiler Error in {lang}."}
            
            return {"output": output if output else "No output.", "exit_code": 0, "feedback": f"✔ {lang} executed successfully!"}
        else:
            return {"output": f"API Error: {response.status_code}.", "exit_code": 1, "feedback": "✖ Execution Engine Error."}

    except Exception as e:
        return {"output": f"Backend Error: {str(e)}", "exit_code": 1, "feedback": "✖ Connection Error."}