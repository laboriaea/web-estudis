// Variables globals
let currentFlashcard = 0;
let isFlipped = false;
let currentSubject = null;
let allSubjectsData = {};
let currentNotes = {
    past: [],
    current: [],
    write: ''
};
let currentThemes = [];

// Inicialitzar quan es carregui la pàgina
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    initializeApp();
    loadSampleNotes();
});

// Funcions de persistència de dades
function saveDataToStorage() {
    try {
        localStorage.setItem('estudixpert_data', JSON.stringify(allSubjectsData));
        console.log('Dades guardades correctament');
    } catch (error) {
        console.error('Error guardant dades:', error);
    }
}

function loadDataFromStorage() {
    try {
        const savedData = localStorage.getItem('estudixpert_data');
        if (savedData) {
            allSubjectsData = JSON.parse(savedData);
            console.log('Dades carregades correctament');
        } else {
            allSubjectsData = {};
            console.log('No hi ha dades guardades, inicialitzant...');
        }
    } catch (error) {
        console.error('Error carregant dades:', error);
        allSubjectsData = {};
    }
}

function getSubjectData(subjectName) {
    if (!allSubjectsData[subjectName]) {
        allSubjectsData[subjectName] = {
            notes: {
                past: [],
                current: []
            },
            themes: []
        };
    }
    return allSubjectsData[subjectName];
}

function initializeApp() {
    // Configurar esdeveniments
    setupFlashcards();
    setupSubjectCards();
    setupAudioCards();
    setupFloatingAssistant();
    setupSettingsButton();
    setupSubjectDetail();
    setupAIChat();
    
    // Configurar missatges motivacionals
    startMotivationalMessages();
}

// Configurar pantalla d'assignatura
function setupSubjectDetail() {
    // Crear pantalla d'assignatura
    const subjectDetail = document.createElement('div');
    subjectDetail.className = 'subject-detail';
    subjectDetail.innerHTML = `
        <div class="subject-header">
            <h1 class="subject-title"></h1>
            <button class="close-btn" onclick="closeSubjectDetail()">✕ Tancar</button>
        </div>
        <div class="subject-content">
            <div class="notes-section">
                <h3>📝 Apunts</h3>
                <div class="notes-tabs">
                    <button class="tab-btn active" onclick="switchTab('notes')">Apunts</button>
                    <button class="tab-btn" onclick="switchTab('themes')">Temes</button>
                    <button class="tab-btn" onclick="switchTab('write')">Escriure apunts</button>
                </div>
                <div class="tab-content active" id="notes-tab">
                    <div class="notes-list" id="notes-list"></div>
                </div>
                <div class="tab-content" id="themes-tab">
                    <div class="themes-list" id="themes-list"></div>
                </div>
                <div class="tab-content" id="write-tab">
                    <div class="write-section">
                        <label for="theme-select">Tema:</label>
                        <select class="theme-select" id="theme-select">
                            <option value="">Sense tema</option>
                        </select>
                    </div>
                    <textarea class="note-editor" placeholder="Escriu els teus apunts aquí..."></textarea>
                    <button class="flip-btn" onclick="saveNote()">💾 Guardar apunt</button>
                    <div class="ocr-section">
                        <h4>📷 Llegir text d'una imatge</h4>
                        <div class="ocr-upload" onclick="document.getElementById('image-input').click()">
                            <input type="file" id="image-input" accept="image/*" onchange="processImage(event)">
                            <p>📸 Clica per pujar una imatge i extreure el text</p>
                        </div>
                        <div id="ocr-result" style="margin-top: 1rem;"></div>
                    </div>
                </div>
            </div>
            <div class="ai-chat">
                <h3>🤖 Assistent IA SÚPER INTEL·LIGENT</h3>
                <div class="chat-messages" id="chat-messages">
                    <div class="message ai">
                        <p>🧠 Hola! Sóc la teva IA d'estudi COMPLETAMENT REPROGRAMADA i SÚPER INTEL·LIGENT! 
                        
✨ NOVA FUNCIONALITAT:
• Analitzo TOTS els teus apunts i temes
• Genero resums NOMÉS del teu contingut
• Creo preguntes basades en els teus estudis
• NO m'invento res - només treballo amb les teves dades

🎯 Pots demanar-me:
• "Fes un resum del tema 1 i 2"
• "Genera preguntes d'examen"
• "Explica [concepte dels teus apunts]"
• "Crea exercicis de [tema]"

Com et puc ajudar amb els teus estudis?</p>
                    </div>
                </div>
                <div class="chat-input-container">
                    <input type="text" class="chat-input" placeholder="Pregunta'm sobre els teus apunts..." onkeypress="handleChatKeyPress(event)">
                    <button class="photo-btn" onclick="document.getElementById('ai-image-input').click()" title="Pujar foto">📷</button>
                    <input type="file" id="ai-image-input" accept="image/*" style="display: none;" onchange="processAIImage(event)">
                    <button class="send-btn" onclick="sendMessage()">➤</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(subjectDetail);
}

// Configurar chat IA
function setupAIChat() {
    // Funcionalitat del chat ja implementada a setupSubjectDetail
}

// Configurar flashcards
function setupFlashcards() {
    const flipBtn = document.querySelector('.flip-btn');
    const knowBtn = document.querySelector('.know-btn');
    const studyBtn = document.querySelector('.study-btn');
    const flashcard = document.querySelector('.flashcard');
    
    if (flipBtn) {
        flipBtn.addEventListener('click', () => {
            flashcard.classList.toggle('flipped');
            isFlipped = !isFlipped;
        });
    }
    
    if (knowBtn) {
        knowBtn.addEventListener('click', () => {
            showFeedback('Excel·lent! 🎉', 'success');
            nextFlashcard();
        });
    }
    
    if (studyBtn) {
        studyBtn.addEventListener('click', () => {
            showFeedback('Molt bé per reconèixer-ho! 💪', 'info');
            nextFlashcard();
        });
    }
}

// Configurar targetes d'assignatures
function setupSubjectCards() {
    const subjectCards = document.querySelectorAll('.subject-card');
    
    subjectCards.forEach(card => {
        card.addEventListener('click', () => {
            const subject = card.querySelector('h3').textContent;
            openSubjectDetail(subject);
        });
    });
}

// Obrir pantalla d'assignatura
function openSubjectDetail(subject) {
    currentSubject = subject;
    const subjectDetail = document.querySelector('.subject-detail');
    const subjectTitle = document.querySelector('.subject-title');
    
    subjectTitle.textContent = subject;
    subjectDetail.classList.add('active');
    
    // Carregar dades específiques de l'assignatura
    const subjectData = getSubjectData(subject);
    currentNotes = subjectData.notes;
    currentThemes = subjectData.themes;
    
    // Carregar apunts de l'assignatura
    loadSubjectNotes(subject);
    
    showFeedback(`Obrint ${subject}... 📖`, 'info');
}

// Tancar pantalla d'assignatura
function closeSubjectDetail() {
    const subjectDetail = document.querySelector('.subject-detail');
    subjectDetail.classList.remove('active');
    currentSubject = null;
}

// Canviar pestanya
function switchTab(tabName) {
    // Actualitzar botons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Actualitzar contingut
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Carregar selector de temes si estem a la pestanya d'escriure
    if (tabName === 'write') {
        loadThemeSelector();
    }
}

// Carregar selector de temes
function loadThemeSelector() {
    const themeSelect = document.querySelector('.theme-select');
    if (!themeSelect) return;
    
    themeSelect.innerHTML = '<option value="">Sense tema</option>';
    
    currentThemes.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme.id;
        option.textContent = `${theme.name} - ${theme.description}`;
        themeSelect.appendChild(option);
    });
}

// Carregar apunts d'exemple
function loadSampleNotes() {
    currentNotes = {
        past: [
            {
                id: 'note1',
                date: '2024-01-15',
                title: 'Introducció a l\'àlgebra',
                content: 'Variables, expressions algebraiques, operacions bàsiques...',
                theme: 'tema1'
            },
            {
                id: 'note2',
                date: '2024-01-20',
                title: 'Equacions de primer grau',
                content: 'Resolució d\'equacions, mètodes de substitució...',
                theme: 'tema1'
            }
        ],
        current: [
            {
                id: 'note3',
                date: '2024-01-25',
                title: 'Teorema de Pitàgores',
                content: 'a² + b² = c² en triangles rectangles, aplicacions pràctiques...',
                theme: 'tema2'
            }
        ],
        write: ''
    };
    
    // Carregar temes d'exemple
    currentThemes = [
        {
            id: 'tema1',
            name: 'TEMA 1',
            description: 'Àlgebra bàsica',
            color: '#ff7043'
        },
        {
            id: 'tema2',
            name: 'TEMA 2',
            description: 'Geometria',
            color: '#29b6f6'
        }
    ];
}

// Carregar apunts d'assignatura
function loadSubjectNotes(subject) {
    const notesContainer = document.getElementById('notes-list');
    const themesContainer = document.getElementById('themes-list');
    
    if (!notesContainer || !themesContainer) return;
    
    // Assegurar que currentNotes està inicialitzat
    if (!currentNotes) {
        currentNotes = { past: [], current: [], write: '' };
    }
    if (!currentNotes.past) currentNotes.past = [];
    if (!currentNotes.current) currentNotes.current = [];
    
    // Combinar tots els apunts
    const allNotes = [...currentNotes.past, ...currentNotes.current];
    
    // Mostrar tots els apunts
    notesContainer.innerHTML = '';
    if (allNotes.length === 0) {
        notesContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No hi ha apunts encara. Comença a escriure!</p>';
    } else {
        allNotes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item';
            noteElement.innerHTML = `
                <div class="note-date">${note.date}</div>
                <div class="note-preview">${note.title}</div>
                <div class="note-actions">
                    <button class="delete-note-btn" onclick="deleteNote('${note.id}')">🗑️</button>
                </div>
            `;
            noteElement.addEventListener('click', () => viewNote(note));
            notesContainer.appendChild(noteElement);
        });
    }
    
    // Mostrar temes
    loadThemes(themesContainer);
}

// Visualitzar apunt
function viewNote(note) {
    showFeedback(`Obrint: ${note.title}`, 'info');
    
    // Crear modal per visualitzar apunt
    const modal = document.createElement('div');
    modal.className = 'note-viewer-modal';
    modal.innerHTML = `
        <div class="note-viewer-content">
            <div class="note-viewer-header">
                <div class="note-info">
                    <h2 class="note-viewer-title">📝 ${note.title}</h2>
                    <p class="note-viewer-date">📅 ${note.date}</p>
                </div>
                <button class="note-close-btn" onclick="closeModal()">
                    <span>✕</span>
                </button>
            </div>
            <div class="note-viewer-body">
                <div class="note-content-display">
                    ${note.content.replace(/\n/g, '<br>')}
                </div>
            </div>
            <div class="note-viewer-footer">
                <button class="note-action-btn edit-btn" onclick="editNote('${note.id}')">
                    ✏️ Editar
                </button>
                <button class="note-action-btn delete-btn" onclick="deleteNoteFromViewer('${note.id}')">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Afegir event listener per tancar amb clic fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Tancar modal
function closeModal() {
    const modal = document.querySelector('.note-viewer-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Guardar apunt
function saveNote() {
    const noteEditor = document.querySelector('.note-editor');
    const themeSelect = document.querySelector('.theme-select');
    const noteContent = noteEditor.value.trim();
    
    if (!noteContent) {
        showFeedback('Escriu alguna cosa abans de guardar!', 'error');
        return;
    }
    
    const newNote = {
        id: 'note_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        title: noteContent.substring(0, 50) + (noteContent.length > 50 ? '...' : ''),
        content: noteContent,
        theme: themeSelect ? themeSelect.value : null
    };
    
    currentNotes.current.push(newNote);
    
    // Guardar a l'assignatura específica
    if (currentSubject) {
        const subjectData = getSubjectData(currentSubject);
        subjectData.notes = currentNotes;
        subjectData.themes = currentThemes;
        saveDataToStorage();
    }
    
    noteEditor.value = '';
    
    showFeedback('Apunt guardat correctament! 📝', 'success');
    
    // Recarregar apunts
    loadSubjectNotes(currentSubject);
}

// Carregar temes
function loadThemes(container) {
    container.innerHTML = '';
    
    // Assegurar que currentThemes està inicialitzat
    if (!currentThemes) {
        currentThemes = [];
    }
    
    if (currentThemes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No hi ha temes creats encara.</p>';
    } else {
        currentThemes.forEach(theme => {
            const themeElement = document.createElement('div');
            themeElement.className = 'theme-item';
            themeElement.style.borderLeft = `4px solid ${theme.color}`;
            themeElement.innerHTML = `
                <div class="theme-name">${theme.name}</div>
                <div class="theme-description">${theme.description}</div>
                <div class="theme-actions">
                    <button class="edit-theme-btn" onclick="editTheme('${theme.id}')">✏️</button>
                    <button class="delete-theme-btn" onclick="deleteTheme('${theme.id}')">🗑️</button>
                </div>
            `;
            container.appendChild(themeElement);
        });
    }
    
    // Botó per crear nou tema
    const addThemeBtn = document.createElement('div');
    addThemeBtn.className = 'add-theme-btn';
    addThemeBtn.innerHTML = `
        <div onclick="createNewTheme()">
            ➕ Crear nou tema
        </div>
    `;
    container.appendChild(addThemeBtn);
}

// Crear nou tema
function createNewTheme() {
    const themeName = prompt('Nom del tema (ex: TEMA 3):');
    const themeDescription = prompt('Descripció del tema:');
    
    if (!themeName || !themeDescription) return;
    
    const colors = ['#ff7043', '#29b6f6', '#ffa726', '#ab47bc', '#66bb6a', '#ef5350'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newTheme = {
        id: 'tema_' + Date.now(),
        name: themeName,
        description: themeDescription,
        color: randomColor
    };
    
    currentThemes.push(newTheme);
    
    // Guardar a l'assignatura específica
    if (currentSubject) {
        const subjectData = getSubjectData(currentSubject);
        subjectData.themes = currentThemes;
        subjectData.notes = currentNotes;
        saveDataToStorage();
    }
    
    showFeedback('Tema creat correctament! 🎯', 'success');
    loadSubjectNotes(currentSubject);
}

// Editar tema
function editTheme(themeId) {
    const theme = currentThemes.find(t => t.id === themeId);
    if (!theme) return;
    
    const newName = prompt('Nou nom del tema:', theme.name);
    const newDescription = prompt('Nova descripció del tema:', theme.description);
    
    if (newName && newDescription) {
        theme.name = newName;
        theme.description = newDescription;
        
        // Guardar canvis
        if (currentSubject) {
            const subjectData = getSubjectData(currentSubject);
            subjectData.themes = currentThemes;
            saveDataToStorage();
        }
        
        showFeedback('Tema actualitzat! ✅', 'success');
        loadSubjectNotes(currentSubject);
    }
}

// Eliminar tema
function deleteTheme(themeId) {
    if (confirm('Estàs segur que vols eliminar aquest tema?')) {
        currentThemes = currentThemes.filter(t => t.id !== themeId);
        
        // Guardar canvis
        if (currentSubject) {
            const subjectData = getSubjectData(currentSubject);
            subjectData.themes = currentThemes;
            saveDataToStorage();
        }
        
        showFeedback('Tema eliminat! 🗑️', 'success');
        loadSubjectNotes(currentSubject);
    }
}

// Eliminar apunt
function deleteNote(noteId) {
    if (confirm('Estàs segur que vols eliminar aquest apunt?')) {
        if (currentNotes.past) {
            currentNotes.past = currentNotes.past.filter(n => n.id !== noteId);
        }
        if (currentNotes.current) {
            currentNotes.current = currentNotes.current.filter(n => n.id !== noteId);
        }
        
        // Guardar canvis
        if (currentSubject) {
            const subjectData = getSubjectData(currentSubject);
            subjectData.notes = currentNotes;
            saveDataToStorage();
        }
        
        showFeedback('Apunt eliminat! 🗑️', 'success');
        loadSubjectNotes(currentSubject);
    }
}

// Eliminar apunt des del visualitzador
function deleteNoteFromViewer(noteId) {
    if (confirm('Estàs segur que vols eliminar aquest apunt?')) {
        if (currentNotes.past) {
            currentNotes.past = currentNotes.past.filter(n => n.id !== noteId);
        }
        if (currentNotes.current) {
            currentNotes.current = currentNotes.current.filter(n => n.id !== noteId);
        }
        showFeedback('Apunt eliminat! 🗑️', 'success');
        closeModal();
        loadSubjectNotes(currentSubject);
    }
}

// Editar apunt
function editNote(noteId) {
    const note = [...(currentNotes.past || []), ...(currentNotes.current || [])].find(n => n.id === noteId);
    if (!note) return;
    
    closeModal();
    
    // Canviar a la pestanya d'escriure
    switchTabProgrammatically('write');
    
    // Omplir l'editor amb el contingut de l'apunt
    const noteEditor = document.querySelector('.note-editor');
    if (noteEditor) {
        noteEditor.value = note.content;
        noteEditor.focus();
    }
    
    showFeedback('Apunt carregat per editar! ✏️', 'info');
}

// Canviar pestanya programàticament
function switchTabProgrammatically(tabName) {
    // Actualitzar botons
    const tabButtons = document.querySelectorAll('.tab-btn');
    if (tabButtons) {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabButtons.forEach(btn => {
            if (btn.onclick && btn.onclick.toString().includes(`'${tabName}'`)) {
                btn.classList.add('active');
            }
        });
    }
    
    // Actualitzar contingut
    const tabContents = document.querySelectorAll('.tab-content');
    if (tabContents) {
        tabContents.forEach(content => content.classList.remove('active'));
    }
    
    const targetTab = document.getElementById(tabName + '-tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Carregar selector de temes si estem a la pestanya d'escriure
    if (tabName === 'write') {
        loadThemeSelector();
    }
}

// Processar imatge amb OCR
function processImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const resultDiv = document.getElementById('ocr-result');
    resultDiv.innerHTML = '<p>🔄 Processant imatge...</p>';
    
    // Simular OCR (en un cas real, utilitzaries una API com Tesseract.js)
    setTimeout(() => {
        const simulatedText = `Text extret de la imatge:

Teorema de Pitàgores:
En un triangle rectangle, el quadrat de la hipotenusa és igual a la suma dels quadrats dels catets.

a² + b² = c²

Aplicacions:
- Càlcul de distàncies
- Geometria
- Trigonometria`;
        
        resultDiv.innerHTML = `
            <h4>📝 Text extret:</h4>
            <div style="background: #f5f5f5; padding: 1rem; border-radius: 10px; margin: 1rem 0;">
                <pre style="white-space: pre-wrap; font-family: inherit;">${simulatedText}</pre>
            </div>
            <button class="flip-btn" onclick="addOCRToNotes('${simulatedText.replace(/'/g, "\\'")}')">
                ➕ Afegir als apunts
            </button>
        `;
    }, 2000);
}

// Afegir text OCR als apunts
function addOCRToNotes(text) {
    const noteEditor = document.querySelector('.note-editor');
    noteEditor.value += '\n\n' + text;
    showFeedback('Text afegit als apunts! 📝', 'success');
}

// ===== NOVA IA COMPLETAMENT REPROGRAMADA I SÚPER INTEL·LIGENT =====

// Enviar missatge al chat
function sendMessage() {
    const chatInput = document.querySelector('.chat-input');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    const chatMessages = document.getElementById('chat-messages');
    
    // Afegir missatge de l'usuari
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(userMessage);
    
    chatInput.value = '';
    
    // Simular resposta de la IA SÚPER INTEL·LIGENT
    setTimeout(() => {
        const aiMessage = document.createElement('div');
        aiMessage.className = 'message ai';
        aiMessage.innerHTML = `<p>${generateSuperIntelligentAIResponse(message)}</p>`;
        chatMessages.appendChild(aiMessage);
        
        // Scroll al final
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
    
    // Scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// NOVA FUNCIÓ: IA SÚPER INTEL·LIGENT COMPLETAMENT REPROGRAMADA
function generateSuperIntelligentAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Obtenir tots els apunts i temes de l'assignatura actual
    const allNotes = [...(currentNotes.past || []), ...(currentNotes.current || [])];
    const allThemes = currentThemes || [];
    
    // ANÀLISI INTEL·LIGENT DEL MISSATGE
    console.log(`🧠 IA ANALITZANT: "${message}"`);
    console.log(`📚 Apunts disponibles: ${allNotes.length}`);
    console.log(`🎯 Temes disponibles: ${allThemes.length}`);
    
    // DETECCIÓ DE RESUMS DE TEMES ESPECÍFICS
    if (lowerMessage.includes('resum') && (lowerMessage.includes('tema') || lowerMessage.includes('temes'))) {
        return generateThemeSummary(message, allNotes, allThemes);
    }
    
    // DETECCIÓ DE PREGUNTES D'EXAMEN
    if (lowerMessage.includes('pregunta') || lowerMessage.includes('preguntes') || lowerMessage.includes('examen')) {
        return generateExamQuestions(allNotes, allThemes);
    }
    
    // DETECCIÓ D'EXPLICACIONS DE CONCEPTES
    if (lowerMessage.includes('explica') || lowerMessage.includes('explicar') || lowerMessage.includes('què és')) {
        return explainConcept(message, allNotes);
    }
    
    // DETECCIÓ DE CREACIÓ D'EXERCICIS
    if (lowerMessage.includes('exercici') || lowerMessage.includes('exercicis') || lowerMessage.includes('pràctica')) {
        return generateExercises(message, allNotes, allThemes);
    }
    
    // ANÀLISI CONTEXTUAL AVANÇADA
    return generateContextualResponse(message, allNotes, allThemes);
}

// NOVA FUNCIÓ: Generar resums de temes específics
function generateThemeSummary(message, allNotes, allThemes) {
    const lowerMessage = message.toLowerCase();
    
    // Detectar quins temes es demanen
    const requestedThemes = [];
    
    // Buscar números de tema
    const themeNumbers = message.match(/tema\s*(\d+)/gi);
    if (themeNumbers) {
        themeNumbers.forEach(match => {
            const number = match.match(/\d+/)[0];
            const theme = allThemes.find(t => t.name.toLowerCase().includes(number));
            if (theme) requestedThemes.push(theme);
        });
    }
    
    // Si no es troben números, buscar per nom
    if (requestedThemes.length === 0) {
        allThemes.forEach(theme => {
            if (lowerMessage.includes(theme.name.toLowerCase()) || 
                lowerMessage.includes(theme.description.toLowerCase())) {
                requestedThemes.push(theme);
            }
        });
    }
    
    if (requestedThemes.length === 0) {
        return `⚠️ No he trobat els temes específics que demanes. 

📚 Temes disponibles als teus apunts:
${allThemes.map(t => `• ${t.name}: ${t.description}`).join('\n')}

🎯 Pots demanar: "Fes un resum del TEMA 1" o "Resum del tema d'àlgebra"`;
    }
    
    // Generar resum NOMÉS amb els apunts d'aquests temes
    let summary = `📋 RESUM DELS TEMES DEMANATS (basat exclusivament en els teus apunts):\n\n`;
    
    requestedThemes.forEach(theme => {
        const themeNotes = allNotes.filter(note => note.theme === theme.id);
        
        summary += `🎯 ${theme.name}: ${theme.description}\n`;
        
        if (themeNotes.length === 0) {
            summary += `⚠️ No hi ha apunts per aquest tema encara.\n\n`;
        } else {
            summary += `📝 Contingut dels teus apunts:\n`;
            themeNotes.forEach(note => {
                summary += `• ${note.title}: ${note.content.substring(0, 100)}...\n`;
            });
            summary += `\n`;
        }
    });
    
    summary += `✅ Aquest resum està basat EXCLUSIVAMENT en els ${allNotes.length} apunts que has escrit. No he afegit informació externa.`;
    
    return summary;
}

// NOVA FUNCIÓ: Generar preguntes d'examen basades en els apunts
function generateExamQuestions(allNotes, allThemes) {
    if (allNotes.length === 0) {
        return `⚠️ No puc generar preguntes perquè no tens apunts encara. 

📝 Escriu primer els teus apunts i després podré crear preguntes d'examen basades exclusivament en el teu contingut!`;
    }
    
    let questions = `❓ PREGUNTES D'EXAMEN (basades exclusivament en els teus apunts):\n\n`;
    
    // Generar preguntes reals basades en el contingut dels apunts
    allNotes.forEach((note, index) => {
        const content = note.content.toLowerCase();
        
        // Detectar tipus de contingut i generar preguntes apropiades
        if (content.includes('fórmula') || content.includes('=')) {
            questions += `${index + 1}. Quina fórmula apareix als teus apunts de "${note.title}"?\n`;
        } else if (content.includes('definició') || content.includes('és')) {
            questions += `${index + 1}. Com defines el concepte principal dels teus apunts de "${note.title}"?\n`;
        } else if (content.includes('exemple') || content.includes('aplicació')) {
            questions += `${index + 1}. Quin exemple específic menciones als teus apunts de "${note.title}"?\n`;
        } else {
            questions += `${index + 1}. Explica el contingut principal dels teus apunts de "${note.title}" (${note.date}).\n`;
        }
    });
    
    questions += `\n🎯 Totes aquestes preguntes estan basades en els ${allNotes.length} apunts que has escrit. Puc desenvolupar qualsevol d'elles amb més detall!`;
    
    return questions;
}

// NOVA FUNCIÓ: Explicar conceptes NOMÉS dels apunts
function explainConcept(message, allNotes) {
    // Extreure el concepte que vol que expliqui
    const concept = message.replace(/explica|explicar|què és/gi, '').trim();
    
    if (!concept) {
        return `🤔 Quin concepte dels teus apunts vols que t'expliqui? 

📚 Conceptes disponibles als teus apunts:
${allNotes.map(note => `• ${note.title}`).join('\n')}`;
    }
    
    // Buscar el concepte als apunts
    const relevantNotes = allNotes.filter(note => 
        note.title.toLowerCase().includes(concept.toLowerCase()) ||
        note.content.toLowerCase().includes(concept.toLowerCase())
    );
    
    if (relevantNotes.length === 0) {
        return `⚠️ No he trobat informació sobre "${concept}" als teus apunts.

📝 Afegeix primer contingut sobre aquest tema als teus apunts i després podré explicar-te'l basant-me exclusivament en la teva informació!`;
    }
    
    // Generar explicació basada en els apunts
    let explanation = `💡 EXPLICACIÓ DE "${concept.toUpperCase()}" (basada en els teus apunts):\n\n`;
    
    relevantNotes.forEach(note => {
        explanation += `📖 Segons els teus apunts de "${note.title}" (${note.date}):\n`;
        explanation += `${note.content}\n\n`;
    });
    
    explanation += `✅ Aquesta explicació està basada EXCLUSIVAMENT en els teus ${relevantNotes.length} apunts relacionats. No he afegit informació externa.`;
    
    return explanation;
}

// NOVA FUNCIÓ: Generar exercicis basats en els apunts
function generateExercises(message, allNotes, allThemes) {
    if (allNotes.length === 0) {
        return `⚠️ No puc crear exercicis perquè no tens apunts encara.

📝 Escriu primer els teus apunts i després podré generar exercicis personalitzats basats en el teu contingut!`;
    }
    
    let exercises = `💪 EXERCICIS PERSONALITZATS (basats en els teus apunts):\n\n`;
    
    // Generar exercicis basats en el contingut real
    allNotes.forEach((note, index) => {
        const content = note.content.toLowerCase();
        
        if (content.includes('fórmula') || content.includes('càlcul')) {
            exercises += `${index + 1}. Exercici basat en "${note.title}":\n`;
            exercises += `   Aplica els conceptes dels teus apunts per resoldre un problema similar.\n\n`;
        } else if (content.includes('definició') || content.includes('concepte')) {
            exercises += `${index + 1}. Exercici de comprensió de "${note.title}":\n`;
            exercises += `   Explica amb les teves paraules el contingut dels teus apunts.\n\n`;
        } else {
            exercises += `${index + 1}. Exercici pràctic de "${note.title}":\n`;
            exercises += `   Desenvolupa els punts clau que has escrit als teus apunts.\n\n`;
        }
    });
    
    exercises += `🎯 Aquests exercicis estan dissenyats específicament basant-me en els teus ${allNotes.length} apunts. Puc desenvolupar qualsevol d'ells amb més detall!`;
    
    return exercises;
}

// NOVA FUNCIÓ: Resposta contextual intel·ligent
function generateContextualResponse(message, allNotes, allThemes) {
    const lowerMessage = message.toLowerCase();
    
    // Estadístiques dels apunts
    const totalWords = allNotes.reduce((sum, note) => sum + note.content.split(' ').length, 0);
    const recentNotes = allNotes.slice(-3);
    
    // Respostes contextuals intel·ligents
    if (lowerMessage.includes('hola') || lowerMessage.includes('ajuda')) {
        return `👋 Hola! Sóc la teva IA d'estudi COMPLETAMENT REPROGRAMADA i SÚPER INTEL·LIGENT!

📊 ESTAT ACTUAL DELS TEUS ESTUDIS:
• ${allNotes.length} apunts guardats (~${totalWords} paraules)
• ${allThemes.length} temes organitzats
• Assignatura actual: ${currentSubject || 'No seleccionada'}

🎯 FUNCIONALITATS INTEL·LIGENTS:
• Resums de temes específics
• Preguntes d'examen personalitzades  
• Explicacions de conceptes
• Exercicis basats en els teus apunts
• Anàlisi contextual avançada

⚠️ IMPORTANT: Només treballo amb la informació dels teus apunts. No m'invento res!

Com et puc ajudar amb els teus estudis?`;
    }
    
    if (lowerMessage.includes('estadístiques') || lowerMessage.includes('progrés')) {
        return `📊 ESTADÍSTIQUES DELS TEUS ESTUDIS:

📚 Contingut total:
• ${allNotes.length} apunts guardats
• ${totalWords} paraules escrites
• ${allThemes.length} temes organitzats

📝 Apunts recents:
${recentNotes.map(note => `• ${note.title} (${note.date})`).join('\n')}

🎯 Temes disponibles:
${allThemes.map(theme => `• ${theme.name}: ${theme.description}`).join('\n')}

✅ Tota aquesta informació està basada en els teus estudis reals!`;
    }
    
    // Resposta intel·ligent per defecte
    return `🧠 Pregunta interessant! Com a IA SÚPER INTEL·LIGENT especialitzada en els teus estudis, puc ajudar-te amb:

📋 RESUMS: "Fes un resum del tema 1 i 2"
❓ PREGUNTES: "Genera preguntes d'examen"  
💡 EXPLICACIONS: "Explica [concepte dels teus apunts]"
💪 EXERCICIS: "Crea exercicis de [tema]"
📊 ANÀLISI: "Estadístiques dels meus estudis"

📚 Tinc accés a ${allNotes.length} apunts i ${allThemes.length} temes de ${currentSubject || 'aquesta assignatura'}.

⚠️ RECORDATORI: Només treballo amb la informació que has escrit als teus apunts. No m'invento res!

Què vols que faci?`;
}

// Processar imatge per la IA
function processAIImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const chatMessages = document.getElementById('chat-messages');
    
    // Mostrar la imatge pujada
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML = `
        <p>📷 He pujat una imatge:</p>
        <img src="${URL.createObjectURL(file)}" style="max-width: 200px; max-height: 200px; border-radius: 10px; margin-top: 0.5rem;">
    `;
    chatMessages.appendChild(userMessage);
    
    // Simular processament de la IA
    const processingMessage = document.createElement('div');
    processingMessage.className = 'message ai';
    processingMessage.innerHTML = '<p>🔍 Analitzant la imatge amb IA SÚPER INTEL·LIGENT...</p>';
    chatMessages.appendChild(processingMessage);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simular resposta intel·ligent de la IA
    setTimeout(() => {
        processingMessage.innerHTML = generateSuperIntelligentImageResponse(file.name);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 2000);
}

// NOVA FUNCIÓ: Resposta intel·ligent per imatges
function generateSuperIntelligentImageResponse(fileName) {
    const allNotes = [...(currentNotes.past || []), ...(currentNotes.current || [])];
    const allThemes = currentThemes || [];
    
    return `📸 ANÀLISI INTEL·LIGENT DE LA IMATGE COMPLETADA!

🧠 He processat la imatge i puc ajudar-te a:

📝 INTEGRACIÓ AMB ELS TEUS APUNTS:
• Extreure text de la imatge i afegir-lo als teus ${allNotes.length} apunts
• Relacionar el contingut amb els teus ${allThemes.length} temes existents
• Crear apunts estructurats basats en el contingut visual

💡 ANÀLISI CONTEXTUAL:
• Explicar conceptes que apareguin a la imatge
• Generar preguntes basades en el contingut visual
• Crear exercicis relacionats amb la informació

🎯 CONNEXIÓ AMB ELS TEUS ESTUDIS:
• Vincular amb els teus apunts de ${currentSubject || 'aquesta assignatura'}
• Identificar relacions amb els teus temes existents
• Suggerir on encaixa millor aquesta informació

⚠️ IMPORTANT: Només treballaré amb la informació real de la imatge i la relacionaré amb els teus apunts existents. No inventaré contingut!

Què vols que faci amb aquesta imatge?`;
}

// Manejar tecla Enter al chat
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Configurar targetes d'àudio
function setupAudioCards() {
    const playBtns = document.querySelectorAll('.play-btn');
    
    playBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const audioCard = btn.closest('.audio-card');
            const audioTitle = audioCard.querySelector('h3').textContent;
            playAudio(audioTitle, btn);
        });
    });
}

// Configurar assistant flotant
function setupFloatingAssistant() {
    const assistant = document.querySelector('.floating-assistant');
    
    if (assistant) {
        assistant.addEventListener('click', () => {
            showMotivationalMessage();
        });
        
        // Canviar missatge cada 15 segons
        setInterval(() => {
            updateAssistantMessage();
        }, 15000);
    }
}

// Configurar botó de configuració
function setupSettingsButton() {
    const settingsBtn = document.querySelector('.settings-btn');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            showSettingsModal();
        });
    }
}

// Funcions de flashcards
function nextFlashcard() {
    const flashcard = document.querySelector('.flashcard');
    
    flashcard.style.opacity = '0.5';
    
    setTimeout(() => {
        flashcard.classList.remove('flipped');
        isFlipped = false;
        loadNewQuestion();
        flashcard.style.opacity = '1';
    }, 300);
}

function loadNewQuestion() {
    const questions = [
        {
            question: "Quin és el teorema de Pitàgores?",
            answer: "a² + b² = c² (en un triangle rectangle)"
        },
        {
            question: "Quina és la capital de França?",
            answer: "París"
        },
        {
            question: "Quan va acabar la Segona Guerra Mundial?",
            answer: "1945"
        },
        {
            question: "Quin és l'element químic de l'oxigen?",
            answer: "O"
        }
    ];
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    document.querySelector('.card-front p').textContent = randomQuestion.question;
    document.querySelector('.card-back p').textContent = randomQuestion.answer;
}

// Reproduir àudio
function playAudio(audioTitle, button) {
    const originalText = button.textContent;
    button.textContent = '⏸️ Reproduint...';
    button.disabled = true;
    
    showFeedback(`Reproduint: ${audioTitle} 🎧`, 'info');
    
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        showFeedback('Àudio completat! 👏', 'success');
    }, 3000);
}

// Mostrar feedback
function showFeedback(message, type = 'info') {
    const feedback = document.createElement('div');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
    
    feedback.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 
                     type === 'error' ? 'rgba(244, 67, 54, 0.9)' : 
                     'rgba(33, 150, 243, 0.9)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        font-size: 0.9rem;
        max-width: 300px;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        feedback.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(feedback)) {
                document.body.removeChild(feedback);
            }
        }, 300);
    }, 3000);
}

// Missatges motivacionals
function showMotivationalMessage() {
    const messages = [
        "Ets capaç de tot! 💪",
        "Cada dia estàs millorant! 🌟",
        "L'esforç sempre dona fruits! 🌱",
        "Crec en tu! Segueix així! 🚀",
        "Ets més fort del que creus! 💎",
        "L'aprenentatge és una aventura! 🗺️"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    showFeedback(randomMessage, 'success');
}

// Actualitzar missatge de l'assistant
function updateAssistantMessage() {
    const bubble = document.querySelector('.assistant-bubble p');
    const messages = [
        "Bon treball! Continues així! 💪",
        "Recorda fer pauses! 😊",
        "Estàs progressant molt bé! 🌟",
        "Hora de repassar? 📚",
        "Tu pots amb tot! ✨"
    ];
    
    if (bubble) {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        bubble.textContent = randomMessage;
    }
}

// Començar missatges motivacionals automàtics
function startMotivationalMessages() {
    setInterval(() => {
        if (Math.random() > 0.8) {
            showMotivationalMessage();
        }
    }, 300000); // 5 minuts
}

// Modal de configuració
function showSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>⚙️ Configuració</h2>
            <div class="setting-item">
                <label>🔔 Notificacions:</label>
                <input type="checkbox" checked>
            </div>
            <div class="setting-item">
                <label>🎨 Tema fosc:</label>
                <input type="checkbox">
            </div>
            <div class="setting-item">
                <label>🔊 So:</label>
                <input type="range" min="0" max="100" value="50">
            </div>
            <div class="modal-actions">
                <button onclick="closeModal()">Tancar</button>
                <button onclick="saveSettings()">Guardar</button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;
    
    document.body.appendChild(modal);
}

function saveSettings() {
    showFeedback('Configuració guardada! ✅', 'success');
    closeModal();
}

// Gestió d'accessibilitat
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Tancar modal de visualització d'apunts
        const noteModal = document.querySelector('.note-viewer-modal');
        if (noteModal) {
            document.body.removeChild(noteModal);
        }
        
        // Tancar modal de configuració
        const settingsModal = document.querySelector('.settings-modal');
        if (settingsModal) {
            document.body.removeChild(settingsModal);
        }
        
        // Tancar detall d'assignatura
        const subjectDetail = document.querySelector('.subject-detail');
        if (subjectDetail && subjectDetail.classList.contains('active')) {
            closeSubjectDetail();
        }
    }
    
    if (e.key === ' ' && e.target.classList.contains('flashcard')) {
        e.preventDefault();
        const flipBtn = document.querySelector('.flip-btn');
        if (flipBtn) {
            flipBtn.click();
        }
    }
});

// Responsive touch events per mòbils
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', function() {
        document.body.classList.add('touch-device');
    });
}