
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
                <h3>🤖 Assistent IA</h3>
                <div class="chat-messages" id="chat-messages">
                    <div class="message ai">
                        <p>Hola! Sóc el teu assistent d'estudi. Pots preguntar-me qualsevol cosa sobre aquesta assignatura o els teus apunts. Com et puc ajudar?</p>
                    </div>
                </div>
                <div class="chat-input-container">
                    <input type="text" class="chat-input" placeholder="Pregunta'm qualsevol cosa..." onkeypress="handleChatKeyPress(event)">
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
    
    // Simular resposta de la IA
    setTimeout(() => {
        const aiMessage = document.createElement('div');
        aiMessage.className = 'message ai';
        aiMessage.innerHTML = `<p>${generateAIResponse(message)}</p>`;
        chatMessages.appendChild(aiMessage);
        
        // Scroll al final
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
    
    // Scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Generar resposta de la IA (SÚPER INTEL·LIGENT)
function generateAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Buscar en els apunts i temes per generar respostes contextuals
    const allNotes = [...(currentNotes.past || []), ...(currentNotes.current || [])];
    const relevantNotes = allNotes.filter(note => 
        note.content.toLowerCase().includes(lowerMessage) || 
        note.title.toLowerCase().includes(lowerMessage)
    );
    
    const relevantThemes = currentThemes.filter(theme => 
        theme.name.toLowerCase().includes(lowerMessage) || 
        theme.description.toLowerCase().includes(lowerMessage)
    );
    
    // FUNCIONALITAT NOVA: Detectar quan demanen fer preguntes sobre un tema
    if (lowerMessage.includes('pregunta') || lowerMessage.includes('preguntes')) {
        return generateQuestionsFromNotes(message, allNotes, relevantThemes);
    }
    
    // Anàlisi avançada del contingut dels apunts
    if (relevantNotes.length > 0) {
        return generateAdvancedResponse(relevantNotes, lowerMessage);
    }
    
    // Respostes contextuals basades en els apunts i temes
    if (lowerMessage.includes('pitàgores') || lowerMessage.includes('teorema')) {
        const pitagonasNote = allNotes.find(note => note.content.toLowerCase().includes('pitàgores'));
        if (pitagonasNote) {
            return `📐 Segons els teus apunts: "${pitagonasNote.content.substring(0, 200)}..." 

🧠 Anàlisi intel·ligent: El teorema de Pitàgores és clau per resoldre problemes de triangles rectangles. Basant-me en els teus apunts, puc explicar-te aplicacions específiques que has estudiat.

❓ Vols que et faci preguntes sobre aquest tema basades exclusivament en els teus apunts?`;
        }
        return '⚠️ No he trobat informació sobre el teorema de Pitàgores als teus apunts. Afegeix contingut sobre aquest tema per poder ajudar-te millor.';
    }
    
    if (lowerMessage.includes('àlgebra') || lowerMessage.includes('equació')) {
        const algebraNotes = allNotes.filter(note => 
            note.content.toLowerCase().includes('àlgebra') || 
            note.content.toLowerCase().includes('equació')
        );
        if (algebraNotes.length > 0) {
            const content = algebraNotes[0].content;
            return `🧮 Basant-me en els teus apunts d'àlgebra: "${content.substring(0, 200)}..."

📊 Anàlisi avançada: He identificat ${algebraNotes.length} apunts relacionats amb àlgebra. Puc generar exercicis i explicacions basades exclusivament en el que has estudiat.

🎯 Vols que et faci preguntes específiques sobre el contingut dels teus apunts d'àlgebra?`;
        }
        return '⚠️ No he trobat contingut sobre àlgebra als teus apunts. Afegeix apunts sobre aquest tema per poder ajudar-te.';
    }
    
    if (lowerMessage.includes('tema') || lowerMessage.includes('temes')) {
        if (relevantThemes.length > 0) {
            const themeList = relevantThemes.map(theme => `• ${theme.name}: ${theme.description}`).join('\n');
            return `📚 Temes trobats als teus apunts:\n\n${themeList}\n\n🔍 Anàlisi detallada disponible per cada tema basat en els teus apunts específics.\n\n❓ Sobre quin tema vols que et faci preguntes basades només en els teus apunts?`;
        }
        const allThemesList = currentThemes.map(theme => `• ${theme.name}: ${theme.description}`).join('\n');
        return `📚 Els teus temes disponibles:\n\n${allThemesList}\n\n🎯 Puc generar preguntes específiques per cada tema basades exclusivament en els teus apunts. Quin tema t'interessa?`;
    }
    
    if (lowerMessage.includes('apunts') || lowerMessage.includes('resum')) {
        if (allNotes.length > 0) {
            const recentNotes = allNotes.slice(-3).map(note => `• ${note.title} (${note.date})`).join('\n');
            const totalWords = allNotes.reduce((sum, note) => sum + note.content.split(' ').length, 0);
            return `📝 Els teus apunts (${allNotes.length} total, ~${totalWords} paraules):\n\n${recentNotes}\n\n🧠 Anàlisi intel·ligent: Puc generar resums, preguntes i explicacions basades exclusivament en aquest contingut.\n\n❓ Vols que et faci preguntes específiques sobre algun d'aquests apunts?`;
        }
        return '📝 Encara no tens apunts guardats. Comença a escriure els teus estudis i podré generar preguntes intel·ligents basades en el teu contingut específic!';
    }
    
    // Respostes generals intel·ligents NOMÉS si hi ha contingut relacionat
    const responses = {
        'hola': `👋 Hola! Sóc la teva IA d'estudi SÚPER INTEL·LIGENT. Tinc accés complet a ${allNotes.length} apunts i ${currentThemes.length} temes. 

🎯 IMPORTANT: Quan em demanis fer preguntes sobre un tema, només et preguntaré coses que apareixen als teus apunts. No inventaré res!

Com et puc ajudar avui?`,
        'matemàtiques': checkSubjectInNotes('matemàtiques', allNotes),
        'ciències': checkSubjectInNotes('ciències', allNotes),
        'història': checkSubjectInNotes('història', allNotes),
        'català': checkSubjectInNotes('català', allNotes),
        'estudiar': '📚 Mètodes d\'estudi personalitzats basats en els teus apunts específics. Puc crear plans d\'estudi adaptats al teu contingut.',
        'examen': '✍️ Preparació d\'exàmens intel·ligent: analitzo els teus apunts per identificar conceptes clau i generar preguntes d\'examen realistes.',
        'ajuda': '🤝 Ajuda personalitzada basada en els teus apunts. Puc generar preguntes, explicacions i exercicis específics del teu contingut.',
        'explicar': '💡 Explicacions detallades basades exclusivament en els teus apunts. Quin concepte dels teus estudis vols que expliqui?',
        'exercici': '💪 Exercicis generats a partir dels teus apunts. Sobre quin tema dels teus estudis vols practicar?'
    };
    
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return response;
        }
    }
    
    // Resposta intel·ligent per defecte
    return `🤔 Pregunta interessant! Amb accés als teus ${allNotes.length} apunts i ${currentThemes.length} temes, puc oferir-te ajuda SÚPER PERSONALITZADA.

🎯 RECORDATORI IMPORTANT: Quan em demanis fer preguntes sobre un tema, només et preguntaré coses que apareixen als teus apunts. No inventaré contingut!

Pots preguntar-me sobre:
• Qualsevol matèria dels teus apunts específics
• Explicacions de conceptes que has estudiat
• Resums dels teus temes personalitzats
• Preguntes d'examen basades en els teus apunts
• Exercicis creats a partir del teu contingut

❓ Vols que et faci preguntes sobre algun tema específic dels teus apunts?`;
}

// NOVA FUNCIÓ: Generar preguntes NOMÉS basades en els apunts
function generateQuestionsFromNotes(message, allNotes, themes) {
    const lowerMessage = message.toLowerCase();
    
    // Buscar tema específic mencionat
    let targetTheme = null;
    let targetNotes = allNotes;
    
    themes.forEach(theme => {
        if (lowerMessage.includes(theme.name.toLowerCase()) || 
            lowerMessage.includes(theme.description.toLowerCase())) {
            targetTheme = theme;
            targetNotes = allNotes.filter(note => note.theme === theme.id);
        }
    });
    
    if (targetNotes.length === 0) {
        return '⚠️ No he trobat apunts sobre aquest tema específic. Afegeix contingut primer i després podré generar preguntes basades exclusivament en els teus apunts.';
    }
    
    // Generar preguntes basades en el contingut real dels apunts
    const questions = generateRealQuestions(targetNotes, targetTheme);
    
    return `❓ Preguntes basades EXCLUSIVAMENT en els teus apunts ${targetTheme ? `del ${targetTheme.name}` : ''}:

${questions}

🎯 Totes aquestes preguntes estan basades en el contingut que has estudiat i guardat als teus apunts. No he inventat res!

Quina pregunta vols que desenvolupem?`;
}

// NOVA FUNCIÓ: Generar preguntes reals basades en els apunts
function generateRealQuestions(notes, theme) {
    let questions = [];
    
    notes.forEach((note, index) => {
        const content = note.content.toLowerCase();
        
        // Buscar conceptes clau en el contingut real
        if (content.includes('definició') || content.includes('és')) {
            questions.push(`${index + 1}. Segons els teus apunts "${note.title}", com es defineix el concepte principal?`);
        }
        
        if (content.includes('fórmula') || content.includes('=')) {
            questions.push(`${index + 1}. Quina fórmula apareix als teus apunts de "${note.title}"?`);
        }
        
        if (content.includes('exemple') || content.includes('cas')) {
            questions.push(`${index + 1}. Quin exemple específic menciones als teus apunts de "${note.title}"?`);
        }
        
        if (content.includes('important') || content.includes('clau')) {
            questions.push(`${index + 1}. Quin punt important destaca als teus apunts de "${note.title}"?`);
        }
        
        // Pregunta general basada en el contingut
        questions.push(`${index + 1}. Explica el contingut principal dels teus apunts de "${note.title}" (${note.date}).`);
    });
    
    // Limitar a 5 preguntes màxim
    return questions.slice(0, 5).join('\n');
}

// NOVA FUNCIÓ: Comprovar si hi ha contingut sobre una matèria
function checkSubjectInNotes(subject, notes) {
    const relatedNotes = notes.filter(note => 
        note.content.toLowerCase().includes(subject) || 
        note.title.toLowerCase().includes(subject)
    );
    
    if (relatedNotes.length > 0) {
        return `📚 He trobat ${relatedNotes.length} apunts relacionats amb ${subject}. Puc generar preguntes específiques basades en aquest contingut.
        
❓ Vols que et faci preguntes sobre ${subject} basades exclusivament en els teus apunts?`;
    } else {
        return `⚠️ No he trobat contingut sobre ${subject} als teus apunts. Afegeix apunts sobre aquesta matèria per poder generar preguntes específiques.`;
    }
}

// NOVA FUNCIÓ: Generar respostes avançades basades en els apunts
function generateAdvancedResponse(relevantNotes, lowerMessage) {
    const noteInfo = relevantNotes[0];
    const allContent = relevantNotes.map(note => note.content).join(' ');
    
    // Anàlisi intel·ligent del contingut
    const wordCount = allContent.split(' ').length;
    const concepts = extractConcepts(allContent);
    
    return `🧠 Anàlisi intel·ligent dels teus apunts:

📖 Contingut trobat: "${noteInfo.title}" (${noteInfo.date})
📊 Longitud: ${wordCount} paraules
🎯 Conceptes identificats: ${concepts.join(', ')}

📝 Fragment rellevant: "${noteInfo.content.substring(0, 200)}..."

❓ Puc generar preguntes específiques basades en aquest contingut. Vols que et faci preguntes sobre aquest tema?
💡 O prefereixes que t'expliqui algun concepte específic dels teus apunts?`;
}

// NOVA FUNCIÓ: Extreure conceptes dels apunts
function extractConcepts(content) {
    const concepts = [];
    const lowerContent = content.toLowerCase();
    
    // Buscar patrons comuns en els apunts
    if (lowerContent.includes('teorema')) concepts.push('teoremes');
    if (lowerContent.includes('fórmula')) concepts.push('fórmules');
    if (lowerContent.includes('definició')) concepts.push('definicions');
    if (lowerContent.includes('exemple')) concepts.push('exemples');
    if (lowerContent.includes('exercici')) concepts.push('exercicis');
    if (lowerContent.includes('càlcul')) concepts.push('càlculs');
    if (lowerContent.includes('resolució')) concepts.push('resolucions');
    
    return concepts.length > 0 ? concepts : ['contingut general'];
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
    processingMessage.innerHTML = '<p>🔍 Analitzant la imatge...</p>';
    chatMessages.appendChild(processingMessage);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simular resposta intel·ligent de la IA
    setTimeout(() => {
        processingMessage.innerHTML = generateAIImageResponse(file.name);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 2000);
}

// Generar resposta intel·ligent per imatges
function generateAIImageResponse(fileName) {
    const responses = [
        `📸 He analitzat la teva imatge! Veig text que sembla relacionat amb els teus estudis. 

Basat en els teus apunts de ${currentSubject || 'aquesta assignatura'}, puc ajudar-te a:
• Explicar els conceptes que apareixen a la imatge
• Relacionar-ho amb els teus temes existents
• Crear apunts a partir del contingut visual
• Resoldre problemes o exercicis que hi apareguin

Què vols que faci amb aquesta informació? 🤔`,

        `🔍 Perfecte! He processat la imatge i puc veure contingut educatiu. 

Segons els teus ${currentThemes.length} temes i ${(currentNotes.past?.length || 0) + (currentNotes.current?.length || 0)} apunts, puc:
• Extreure el text de la imatge i afegir-lo als teus apunts
• Explicar-te els conceptes que hi apareixen
• Crear exercicis basats en el contingut
• Relacionar-ho amb els teus estudis existents

Com vols que procedeixi? 📚`,

        `✨ Imatge analitzada amb èxit! 

He identificat contingut relacionat amb els teus estudis. Puc:
• Convertir el text de la imatge en apunts estructurats
• Explicar pas a pas qualsevol fórmula o concepte
• Generar preguntes de repàs basades en el contingut
• Connectar-ho amb els teus temes: ${currentThemes.map(t => t.name).join(', ')}

Què necessites que faci amb aquesta informació? 🎯`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
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
// Array per emmagatzemar els apunts per assignatura
let subjectNotes = {};

// Array per emmagatzemar els xats de cada assignatura
let subjectChats = {};

// Funció per crear un apunt
function createNote(subject, content) {
    if (!subjectNotes[subject]) {
        subjectNotes[subject] = [];
    }
    subjectNotes[subject].push(content);
    showFeedback(`Apunt creat per ${subject}!`, 'success');
}

// Funció per crear un xat per a una assignatura
function createChat(subject) {
    if (!subjectChats[subject]) {
        subjectChats[subject] = [];
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container';
        chatContainer.id = `${subject}-chat`;

        const chatTitle = document.createElement('h4');
        chatTitle.innerText = `Xat amb la IA per ${subject}`;
        chatContainer.appendChild(chatTitle);

        const chatMessages = document.createElement('div');
        chatMessages.className = 'chat-messages';
        chatContainer.appendChild(chatMessages);

        const chatInput = document.createElement('input');
        chatInput.placeholder = 'Pregunta aquí...';
        chatContainer.appendChild(chatInput);

        const sendButton = document.createElement('button');
        sendButton.innerText = 'Enviar';
        sendButton.onclick = () => sendMessage(subject, chatInput.value, chatMessages);
        chatContainer.appendChild(sendButton);

        document.body.appendChild(chatContainer);
        showFeedback(`Xat creat per ${subject}!`, 'success');
    } else {
        showFeedback(`Ja tens un xat creat per ${subject}.`, 'info');
    }
}

// Funció per enviar un missatge al xat seleccionat
function sendMessage(subject, message, chatMessages) {
    if (!message.trim()) return;
    const userMessage = document.createElement('div');
    userMessage.innerText = message;
    chatMessages.appendChild(userMessage);

    // Simular resposta de la IA
    setTimeout(() => {
        const aiResponse = generateAIResponse(message); // Suposant que ja tens aquesta funció definida
        const aiMessage = document.createElement('div');
        aiMessage.innerText = aiResponse;
        chatMessages.appendChild(aiMessage);
    }, 500);
}

// Funció per eliminar un xat de l'assignatura
function deleteChat(subject) {
    const chatContainer = document.getElementById(`${subject}-chat`);
    if (chatContainer) {
        document.body.removeChild(chatContainer);
        delete subjectChats[subject];
        showFeedback(`Xat per ${subject} eliminat!`, 'success');
    } else {
        showFeedback(`No hi ha xat per ${subject} que eliminar.`, 'info');
    }
}
const sendButton = document.createElement('button');
sendButton.className = 'send-btn'; // Assegura't que tingui la classe per estilitzar
sendButton.innerText = 'Enviar';
sendButton.onclick = () => sendMessage(subject, chatInput.value, chatMessages);
chatContainer.appendChild(sendButton);