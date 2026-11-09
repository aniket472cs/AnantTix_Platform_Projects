const runBtn = document.getElementById('run-btn');
const compileBtn = document.getElementById('compile-btn');
const formatBtn = document.getElementById('format-btn');
const saveBtn = document.getElementById('save-btn');
const myCodesBtn = document.getElementById('my-codes-btn');
const terminalOutput = document.getElementById('terminal-output');
const aiOutput = document.getElementById('ai-output');
const langBtns = document.querySelectorAll('.lang-btn');
const editorPanel = document.getElementById('editor-panel');
const aiPanel = document.getElementById('ai-panel');
const terminalPanel = document.getElementById('terminal-panel');
const toggleEditorBtn = document.getElementById('toggle-editor-btn');
const toggleIcon = document.getElementById('toggle-icon');
const stdinInput = document.getElementById('stdin-input');
const stdinPanel = document.getElementById('stdin-panel');

// Modal Elements
const modal = document.getElementById('saved-codes-modal');
const closeModal = document.getElementById('close-modal');
const savedCodesList = document.getElementById('saved-codes-list');

let currentLang = 'python';
let isMaximized = false;

// Editor Initialize
const editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
    lineNumbers: true, mode: "python", theme: "dracula", indentUnit: 4, matchBrackets: true, autoCloseBrackets: true
});

// --- SMART INPUT DETECTION LOGIC ---
// Yeh function check karega ki code mein input maanga gaya hai ya nahi
function checkInputNeeded() {
    const code = editor.getValue();
    
    const needsInput = 
        code.includes('input(') || 
        code.includes('Scanner') || 
        code.includes('cin >>') || 
        code.includes('scanf') || 
        code.includes('Console.ReadLine') || 
        code.includes('readLine') ||
        code.includes('fmt.Scan');

    if (needsInput) {
        stdinPanel.style.display = 'flex'; // Input box show karo
    } else {
        stdinPanel.style.display = 'none'; // Input box hide karo
    }
}

// Jab bhi code change ho, check karo
editor.on("change", function() {
    checkInputNeeded();
});

// Fullscreen Toggle
toggleEditorBtn.addEventListener('click', () => {
    isMaximized = !isMaximized;
    if (isMaximized) {
        aiPanel.style.display = 'none';
        terminalPanel.style.display = 'none';
        stdinPanel.style.display = 'none';
        editorPanel.style.flex = '1 1 100%';
        toggleIcon.classList.replace('fa-expand', 'fa-compress');
    } else {
        aiPanel.style.display = 'flex';
        terminalPanel.style.display = 'flex';
        checkInputNeeded(); // Wapas aane par check karo input chahiye ya nahi
        editorPanel.style.flex = '2';
        toggleIcon.classList.replace('fa-compress', 'fa-expand');
    }
    setTimeout(() => editor.refresh(), 100);
});

const defaultCode = {
    c: `#include <stdio.h>\nint main() {\n  printf("Hello ANANTIX");\n  return 0;\n}`,
    cpp: `#include <iostream>\nint main() {\n  std::cout << "Hello ANANTIX";\n  return 0;\n}`,
    csharp: `using System;\nclass Program {\n  static void Main() {\n    Console.WriteLine("Hello ANANTIX");\n  }\n}`,
    python: `print("Hello ANANTIX")`, 
    java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello ANANTIX");\n  }\n}`,
    javascript: `console.log("Hello ANANTIX");`,
    htmlcss: `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { background: #000; color: #fff; }\n  </style>\n</head>\n<body>\n  <h1>Hello ANANTIX!</h1>\n</body>\n</html>`,
    sql: `SELECT 'Hello ANANTIX' AS Greeting;`,
    go: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello ANANTIX")\n}`,
    kotlin: `fun main() {\n  println("Hello ANANTIX")\n}`
};

// Language Switch
langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLang = btn.getAttribute('data-lang');
        
        let mode = currentLang;
        if (currentLang === 'c') mode = 'text/x-csrc';
        else if (currentLang === 'cpp') mode = 'text/x-c++src';
        else if (currentLang === 'csharp') mode = 'text/x-csharp';
        else if (currentLang === 'java') mode = 'text/x-java';
        else if (currentLang === 'htmlcss') mode = 'htmlmixed';
        else if (currentLang === 'go') mode = 'text/x-go';
        else if (currentLang === 'kotlin') mode = 'text/x-kotlin';

        editor.setOption("mode", mode);
        editor.setValue(defaultCode[currentLang] || "");
        terminalOutput.innerHTML = `> ${currentLang.toUpperCase()} Environment Loaded...`;
        aiOutput.innerHTML = `<p class="placeholder">Ready to analyze ${currentLang} code...</p>`;
        
        // Language change hone par input box check karein
        checkInputNeeded();
    });
});

// Format Code
formatBtn.addEventListener('click', () => { 
    editor.execCommand("indentAuto"); 
    terminalOutput.innerHTML = "> Code formatted successfully!"; 
});

// Compile Logic
compileBtn.addEventListener('click', async () => {
    terminalOutput.innerHTML = `> Compiling ${currentLang.toUpperCase()}...\n`;
    aiOutput.innerHTML = "<p class='placeholder'><i class='fas fa-spinner fa-spin'></i> Checking syntax...</p>";
    let code = editor.getValue();
    
    try {
        const response = await fetch('https://ananttix-platform-projects.onrender.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: currentLang, code: code })
        });
        
        if (!response.ok) throw new Error("Server Error");
        const data = await response.json();
        
        if (data.success) {
            terminalOutput.innerHTML += "> Compilation Successful!\n> Ready to Run.";
            aiOutput.innerHTML = `<p style="color: #28a745;"><i class="fas fa-check-circle"></i> ✔ Build Successful.</p>`;
        } else {
            terminalOutput.innerHTML += `> Compilation Failed!\n> ${data.error_msg}`;
            aiOutput.innerHTML = `<div class="error-box"><div class="error-title"><i class="fas fa-times-circle"></i> Compilation Failed</div><div class="error-desc">${data.error_msg}</div></div>`;
        }
    } catch (error) {
        terminalOutput.innerHTML += "> Error: Backend server offline.\n";
        aiOutput.innerHTML = `<div class="error-box"><div class="error-title"><i class="fas fa-plug"></i> Connection Failed</div><div class="error-desc">Backend server is not running.</div></div>`;
    }
});

// Run Logic
runBtn.addEventListener('click', async () => {
    const code = editor.getValue();
    const userInput = stdinInput.value; 
    
    terminalOutput.innerHTML = `> Executing ${currentLang.toUpperCase()}...\n`;
    aiOutput.innerHTML = "<p class='placeholder'><i class='fas fa-spinner fa-spin'></i> Running...</p>";

    try {
        const response = await fetch('http://127.0.0.1:8000/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: currentLang, code: code, stdin: userInput })
        });
        
        if (!response.ok) throw new Error("Server Error");
        const data = await response.json();
        
        terminalOutput.innerHTML = `> Output:\n${data.output}\n> Exit code: ${data.exit_code}`;
        
        if (data.exit_code === 0) {
            aiOutput.innerHTML = `<p style="color: #28a745;">✔ ${data.feedback}</p>`;
        } else {
            aiOutput.innerHTML = `<div class="error-box"><div class="error-title">Error</div><div class="error-desc">${data.feedback}</div></div>`;
        }
    } catch (error) {
        terminalOutput.innerHTML = "> Error: Backend server offline.";
        aiOutput.innerHTML = `<div class="error-box"><div class="error-title"><i class="fas fa-plug"></i> Connection Failed</div><div class="error-desc">Backend server is not running.</div></div>`;
    }
});

// ==========================================
// SAVE, LOAD & DELETE LOGIC (localStorage)
// ==========================================

// 1. Save Code
saveBtn.addEventListener('click', () => {
    const code = editor.getValue();
    if (code.trim() === "") {
        alert("Code is empty! Nothing to save.");
        return;
    }
    
    let programName = prompt("Enter a name for your program:", "My Program");
    if (!programName) return;

    const savedData = {
        id: Date.now(),
        name: programName,
        language: currentLang,
        code: code,
        date: new Date().toLocaleDateString()
    };

    let existingCodes = JSON.parse(localStorage.getItem('anantix_saved_codes')) || [];
    existingCodes.push(savedData);
    
    localStorage.setItem('anantix_saved_codes', JSON.stringify(existingCodes));
    alert(`Program "${programName}" saved successfully!`);
});

// 2. Open Modal & Display Codes
myCodesBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    renderSavedCodes();
});

// 3. Close Modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// 4. Render Saved Codes List
function renderSavedCodes() {
    let savedCodes = JSON.parse(localStorage.getItem('anantix_saved_codes')) || [];
    
    if (savedCodes.length === 0) {
        savedCodesList.innerHTML = "<p style='color: #aaa; text-align: center;'>No saved programs found.</p>";
        return;
    }

    savedCodesList.innerHTML = "";
    savedCodes.reverse().forEach(item => {
        const div = document.createElement('div');
        div.className = 'saved-item';
        div.innerHTML = `
            <div class="saved-item-info">
                <span class="saved-item-title">${item.name}</span>
                <span class="saved-item-lang">${item.language.toUpperCase()} | ${item.date}</span>
            </div>
            <div class="saved-item-actions">
                <button class="btn-load-saved" onclick="loadSavedCode(${item.id})">Load</button>
                <button class="btn-del-saved" onclick="deleteSavedCode(${item.id})">Delete</button>
            </div>
        `;
        savedCodesList.appendChild(div);
    });
}

// 5. Load Saved Code into Editor
window.loadSavedCode = function(id) {
    let savedCodes = JSON.parse(localStorage.getItem('anantix_saved_codes')) || [];
    const codeToLoad = savedCodes.find(item => item.id === id);
    
    if (codeToLoad) {
        langBtns.forEach(b => {
            b.classList.remove('active');
            if(b.getAttribute('data-lang') === codeToLoad.language) {
                b.classList.add('active');
            }
        });
        
        currentLang = codeToLoad.language;
        let mode = currentLang;
        if (currentLang === 'c') mode = 'text/x-csrc';
        else if (currentLang === 'cpp') mode = 'text/x-c++src';
        else if (currentLang === 'csharp') mode = 'text/x-csharp';
        else if (currentLang === 'java') mode = 'text/x-java';
        else if (currentLang === 'htmlcss') mode = 'htmlmixed';
        else if (currentLang === 'go') mode = 'text/x-go';
        else if (currentLang === 'kotlin') mode = 'text/x-kotlin';
        
        editor.setOption("mode", mode);
        editor.setValue(codeToLoad.code);
        
        modal.style.display = 'none';
        terminalOutput.innerHTML = `> Loaded "${codeToLoad.name}" successfully.`;
        
        // Load hone par input check karein
        checkInputNeeded();
    }
}

// 6. Delete Saved Code
window.deleteSavedCode = function(id) {
    if(!confirm("Are you sure you want to delete this program?")) return;
    
    let savedCodes = JSON.parse(localStorage.getItem('anantix_saved_codes')) || [];
    let updatedCodes = savedCodes.filter(item => item.id !== id);
    
    localStorage.setItem('anantix_saved_codes', JSON.stringify(updatedCodes));
    renderSavedCodes();
}