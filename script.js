// Global variables
let editor;
let isEditorInitialized = false;

// App Toggle Function
function toggleApp(appName) {
  const app = document.getElementById(appName);
  app.style.display = (app.style.display === 'block') ? 'none' : 'block';

  if (appName === 'vscode' && !isEditorInitialized) {
    initMonacoEditor();
  }
}

function openNotepad() {
  toggleApp('notepad');
  document.getElementById('notepad-text').focus();
}

// Monaco Editor Initialization
function initMonacoEditor() {
  if (isEditorInitialized) return;
  
  require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
  
  require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('vscode-editor'), {
      value: [
        '// Welcome to SP.OS VS Code!',
        '// Write your code here and press "Run Code"',
        '// Try these examples:',
        '',
        'function factorial(n) {',
        '  if (n <= 1) return 1;',
        '  return n * factorial(n - 1);',
        '}',
        '',
        'console.log("Factorial of 5:", factorial(5));',
        '',
        '// DOM manipulation example:',
        '// document.body.style.backgroundColor = "lightblue";'
      ].join('\n'),
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: true },
      fontSize: 14,
      scrollBeyondLastLine: false,
      roundedSelection: true,
      cursorBlinking: 'smooth',
      tabSize: 2
    });
    
    // Update status bar with cursor position
    editor.onDidChangeCursorPosition((e) => {
      updateStatusBar(e.position.lineNumber, e.position.column);
    });
    
    // Register additional languages
    monaco.languages.register({ id: 'python' });
    monaco.languages.register({ id: 'html' });
    monaco.languages.register({ id: 'css' });
    
    isEditorInitialized = true;
    terminal.init();
    
    // Load saved code if exists
    const savedCode = localStorage.getItem('vscode_code');
    if (savedCode) {
      editor.setValue(savedCode);
    }
    
    // Auto-save every 5 seconds
    setInterval(() => {
      localStorage.setItem('vscode_code', editor.getValue());
    }, 5000);
  });
}

function updateStatusBar(line, column) {
  document.getElementById('statusBar').textContent = 
    `${editor.getModel().getLanguageId()} | Line ${line}, Column ${column}`;
}

// Tab System
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  document.getElementById(`${tabName}-tab`).style.display = 'block';
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
}

// Change Editor Language
function changeLanguage() {
  const language = document.getElementById('languageSelector').value;
  monaco.editor.setModelLanguage(editor.getModel(), language);
  updateStatusBar(editor.getPosition().lineNumber, editor.getPosition().column);
}

// Change Editor Theme
function changeTheme() {
  const theme = document.getElementById('themeSelector').value;
  monaco.editor.setTheme(theme);
}

// Run Code Execution
function runCode() {
  const outputElement = document.getElementById('output');
  outputElement.innerHTML = '';
  outputElement.style.display = 'block';
  
  try {
    // Capture console.log output
    const oldLog = console.log;
    let logs = [];
    console.log = function(...args) {
      logs.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
      ).join(' '));
      oldLog.apply(console, args);
    };
    
    // Execute code
    const code = editor.getValue();
    new Function(code)();
    
    // Display output
    if (logs.length > 0) {
      outputElement.innerHTML = logs.join('<br>');
    } else {
      outputElement.textContent = 'Code executed successfully (no output)';
    }
    
    console.log = oldLog;
  } catch (error) {
    outputElement.innerHTML = `<span style="color:red">Error: ${error.message}</span>`;
    console.error(error);
  }
}

// Terminal System
const terminal = {
  output: document.getElementById('terminal-output'),
  input: document.getElementById('terminal-cmd'),
  
  init() {
    this.printWelcome();
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.processCommand();
    });
  },
  
  printWelcome() {
    this.printLine("SP.OS Terminal (Type 'help' for commands)");
  },
  
  printLine(text) {
    this.output.innerHTML += `${text}<br>`;
    this.output.scrollTop = this.output.scrollHeight;
  },
  
  processCommand() {
    const cmd = this.input.value.trim();
    this.printLine(`$ ${cmd}`);
    this.input.value = '';
    
    switch(cmd) {
      case 'help':
        this.printLine("Commands: clear, run, help");
        break;
        
      case 'clear':
        this.output.innerHTML = '';
        break;
        
      case 'run':
        try {
          const code = editor.getValue();
          this.printLine("> Running editor code...");
          new Function(code)();
        } catch (e) {
          this.printLine(`Error: ${e.message}`);
        }
        break;
        
      default:
        try {
          const result = eval(cmd);
          if (result !== undefined) {
            this.printLine(result);
          }
        } catch (e) {
          this.printLine(`Command not found: ${cmd}`);
        }
    }
  }
};

// Media Players
function viewPhoto(input) {
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('photoViewer').src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function playVideo(input) {
  const file = input.files[0];
  const videoElement = document.getElementById('videoPlayer');
  videoElement.src = URL.createObjectURL(file);
  videoElement.play();
}

function playMusic(input) {
  const file = input.files[0];
  const audioElement = document.getElementById('musicPlayer');
  audioElement.src = URL.createObjectURL(file);
  audioElement.play();
}

// Google Drive Simulation
function saveToDrive() {
  const modal = document.getElementById('driveModal');
  modal.style.display = 'block';
  localStorage.setItem('vscode_code', editor.getValue());
  setTimeout(closeModal, 2000);
}

function closeModal() {
  document.getElementById('driveModal').style.display = 'none';
}

// Initialize apps that should be pre-loaded
window.onload = function() {
  // Pre-load any necessary components
};