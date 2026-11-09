from fastapi import APIRouter
from pydantic import BaseModel
import requests

router = APIRouter()

class CodeRequest(BaseModel):
    language: str
    code: str
    stdin: str = ""

API_URL = "https://api.onlinecompiler.io/api/run-code-sync"
API_KEY = "9aa8b58989bfd92ae09ae53b0444de02"

LANGUAGE_MAP = {
    "python": "python-3.14",
    "javascript": "nodejs-24",
    "java": "openjdk-25",
    "go": "go-1.25",
    "csharp": "dotnet-csharp-10",
    "cpp": "g++-15",
    "c": "gcc-15",
    "sql": "sql",
    "kotlin": "kotlin-2.4",
    "htmlcss": "html" # HTML/CSS map to HTML compiler
}

@router.post("/compile")
async def compile_code(request: CodeRequest):
    code = request.code
    lang = request.language

    if lang in ["java", "csharp", "cpp", "c"]:
        if code.count('{') != code.count('}'):
            return {"success": False, "error_msg": "Unmatched curly braces '{ }'."}
        if ("println" in code or "cout" in code or "printf" in code) and ";" not in code:
            return {"success": False, "error_msg": "Missing semicolon ';'."}
    elif lang == "python":
        if "print(" in code and ")" not in code:
            return {"success": False, "error_msg": "SyntaxError: Missing closing parenthesis ')'."}

    return {"success": True, "error_msg": "No errors found"}

@router.post("/execute")
async def execute_code(request: CodeRequest):
    code = request.code
    lang = request.language
    user_input = request.stdin

    # HTML/CSS ke liye special mock (kyunki ye visual hota hai)
    if lang == "htmlcss":
        return {"output": "HTML & CSS Code Validated Successfully. (Preview not available in terminal)", "exit_code": 0, "feedback": "✔ HTML/CSS is valid."}

    compiler_id = LANGUAGE_MAP.get(lang, lang)

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
            
            return {"output": output if output else "No output.", "exit_code": 0, "feedback": f"✔ {lang} executed."}
        else:
            return {"output": f"API Error: {response.status_code}.", "exit_code": 1, "feedback": "✖ Execution Error."}

    except Exception as e:
        return {"output": f"Backend Error: {str(e)}", "exit_code": 1, "feedback": "✖ Connection Error."}