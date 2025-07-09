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
                <h3>🤖 Assistent IA Especialitzat</h3>
                <div class="chat-messages" id="chat-messages">
                    <div class="message ai">
                        <p><strong>🎯 IA ESPECIALITZADA EN ELS TEUS ESTUDIS</strong><br><br>
                        Hola! Sóc la teva IA d'estudi completament reprogramada i SÚPER INTEL·LIGENT. 
                        
                        <br><br><strong>🧠 EL QUE PUC FER:</strong>
                        • Analitzar NOMÉS els teus apunts reals
                        • Crear resums basats exclusivament en els teus temes
                        • Generar preguntes d'examen del teu contingut específic
                        • Explicar conceptes que has estudiat
                        • Crear exercicis personalitzats dels teus apunts
                        
                        <br><br><strong>⚠️ IMPORTANT:</strong> NO m'inventaré MAI informació. Només treballaré amb el que has escrit als teus apunts i temes.
                        
                        <br><br>Com et puc ajudar amb els teus estudis?</p>
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
    
    // Actualitzar missatge inicial de la IA amb informació específica de l'assignatura
    updateAIWelcomeMessage(subject);
    
    showFeedback(`Obrint ${subject}... 📖`, 'info');
}

// NOVA FUNCIÓ: Actualitzar missatge de benvinguda de la IA
function updateAIWelcomeMessage(subject) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const subjectData = getSubjectData(subject);
    const totalNotes = (subjectData.notes.past?.length || 0) + (subjectData.notes.current?.length || 0);
    const totalThemes = subjectData.themes?.length || 0;
    
    // Netejar missatges anteriors
    chatMessages.innerHTML = '';
    
    // Crear nou missatge personalitzat
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'message ai';
    welcomeMessage.innerHTML = `
        <p><strong>🎯 IA ESPECIALITZADA EN ${subject.toUpperCase()}</strong><br><br>
        
        <strong>📊 ANÀLISI DE LES TEVES DADES:</strong><br>
        • Apunts disponibles: ${totalNotes}<br>
        • Temes creats: ${totalThemes}<br>
        • Assignatura: ${subject}<br><br>
        
        <strong>🧠 EL QUE PUC FER AMB ELS TEUS APUNTS DE ${subject.toUpperCase()}:</strong><br>
        ${totalNotes > 0 ? '• Crear resums dels teus apunts específics<br>' : ''}
        ${totalThemes > 0 ? '• Generar preguntes basades en els teus temes<br>' : ''}
        ${totalNotes > 0 ? '• Explicar conceptes que has estudiat<br>' : ''}
        ${totalNotes > 0 ? '• Crear exercicis personalitzats<br>' : ''}
        ${totalNotes > 0 ? '• Analitzar el teu progrés d\'estudi<br>' : ''}
        
        ${totalNotes === 0 ? '<br><strong>⚠️ ATENCIÓ:</strong> Encara no tens apunts de ' + subject + '. Afegeix contingut primer per poder ajudar-te millor!<br>' : ''}
        
        <br><strong>🎯 RECORDATORI:</strong> Només treballaré amb la informació que has escrit. No inventaré res!<br><br>
        
        Què vols que faci amb els teus estudis de ${subject}?</p>
    `;
    
    chatMessages.appendChild(welcomeMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
    
    // Actualitzar missatge de benvinguda de la IA amb les noves dades
    updateAIWelcomeMessage(currentSubject);
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
    
    // Actualitzar missatge de benvinguda de la IA
    updateAIWelcomeMessage(currentSubject);
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
        
        // Actualitzar missatge de benvinguda de la IA
        updateAIWelcomeMessage(currentSubject);
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
        
        // Actualitzar missatge de benvinguda de la IA
        updateAIWelcomeMessage(currentSubject);
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
        
        // Guardar canvis
        if (currentSubject) {
            const subjectData = getSubjectData(currentSubject);
            subjectData.notes = currentNotes;
            saveDataToStorage();
        }
        
        showFeedback('Apunt eliminat! 🗑️', 'success');
        closeModal();
        loadSubjectNotes(currentSubject);
        
        // Actualitzar missatge de benvinguda de la IA
        updateAIWelcomeMessage(currentSubject);
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

// ============================================================================
// NOVA IA COMPLETAMENT REPROGRAMADA - SÚPER INTEL·LIGENT I ESPECIALITZADA
// ============================================================================

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
    
    // Mostrar indicador de "pensant"
    const thinkingMessage = document.createElement('div');
    thinkingMessage.className = 'message ai thinking';
    thinkingMessage.innerHTML = '<p>🧠 Analitzant els teus apunts...</p>';
    chatMessages.appendChild(thinkingMessage);
    
    // Scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Generar resposta intel·ligent de la IA
    setTimeout(() => {
        chatMessages.removeChild(thinkingMessage);
        const aiMessage = document.createElement('div');
        aiMessage.className = 'message ai';
        aiMessage.innerHTML = `<p>${generateAdvancedAIResponse(message)}</p>`;
        chatMessages.appendChild(aiMessage);
        
        // Scroll al final
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1500);
}

// NOVA FUNCIÓ: Generar resposta avançada de la IA
function generateAdvancedAIResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Obtenir dades reals de l'assignatura actual
    const subjectData = getSubjectData(currentSubject || 'General');
    const allNotes = [...(subjectData.notes.past || []), ...(subjectData.notes.current || [])];
    const allThemes = subjectData.themes || [];
    
    // ANÀLISI INTEL·LIGENT DEL MISSATGE
    const analysisResult = analyzeUserRequest(lowerMessage, allNotes, allThemes);
    
    // Generar resposta basada en l'anàlisi
    return generateContextualResponse(analysisResult, userMessage, allNotes, allThemes);
}

// NOVA FUNCIÓ: Analitzar petició de l'usuari
function analyzeUserRequest(message, notes, themes) {
    const analysis = {
        type: 'general',
        intent: 'unknown',
        relevantNotes: [],
        relevantThemes: [],
        keywords: [],
        hasData: notes.length > 0
    };
    
    // Detectar tipus de petició
    if (message.includes('resum') || message.includes('resumeix')) {
        analysis.type = 'summary';
        analysis.intent = 'create_summary';
    } else if (message.includes('pregunta') || message.includes('preguntes') || message.includes('examen')) {
        analysis.type = 'questions';
        analysis.intent = 'generate_questions';
    } else if (message.includes('explica') || message.includes('explicar')) {
        analysis.type = 'explanation';
        analysis.intent = 'explain_concept';
    } else if (message.includes('exercici') || message.includes('exercicis') || message.includes('pràctica')) {
        analysis.type = 'exercises';
        analysis.intent = 'create_exercises';
    } else if (message.includes('tema') && (message.includes('1') || message.includes('2') || message.includes('3'))) {
        analysis.type = 'theme_specific';
        analysis.intent = 'theme_analysis';
    }
    
    // Buscar notes rellevants
    analysis.relevantNotes = notes.filter(note => {
        const noteContent = (note.title + ' ' + note.content).toLowerCase();
        return message.split(' ').some(word => 
            word.length > 3 && noteContent.includes(word)
        );
    });
    
    // Buscar temes rellevants
    analysis.relevantThemes = themes.filter(theme => {
        const themeContent = (theme.name + ' ' + theme.description).toLowerCase();
        return message.split(' ').some(word => 
            word.length > 2 && themeContent.includes(word)
        );
    });
    
    // Detectar temes específics per número
    const themeNumbers = message.match(/tema\s*(\d+)/gi);
    if (themeNumbers) {
        themeNumbers.forEach(match => {
            const number = match.match(/\d+/)[0];
            const theme = themes.find(t => t.name.toLowerCase().includes(number));
            if (theme && !analysis.relevantThemes.includes(theme)) {
                analysis.relevantThemes.push(theme);
            }
        });
    }
    
    // Extreure paraules clau
    analysis.keywords = message.split(' ').filter(word => word.length > 3);
    
    return analysis;
}

// NOVA FUNCIÓ: Generar resposta contextual
function generateContextualResponse(analysis, originalMessage, notes, themes) {
    const subject = currentSubject || 'aquesta assignatura';
    
    // Si no hi ha dades, informar a l'usuari
    if (!analysis.hasData) {
        return `⚠️ <strong>NO TINC DADES PER TREBALLAR</strong><br><br>
        Encara no tens apunts de ${subject}. Per poder ajudar-te necessito que:<br><br>
        1. Escriguis apunts a la pestanya "Escriure apunts"<br>
        2. Creïs temes per organitzar el contingut<br>
        3. Afegeixis informació específica dels teus estudis<br><br>
        <strong>🎯 RECORDATORI:</strong> Només puc treballar amb la informació que tu escrius. No m'inventaré res!`;
    }
    
    // Generar resposta segons el tipus de petició
    switch (analysis.type) {
        case 'summary':
            return generateSummaryResponse(analysis, notes, themes, subject);
        case 'questions':
            return generateQuestionsResponse(analysis, notes, themes, subject);
        case 'explanation':
            return generateExplanationResponse(analysis, notes, themes, subject);
        case 'exercises':
            return generateExercisesResponse(analysis, notes, themes, subject);
        case 'theme_specific':
            return generateThemeSpecificResponse(analysis, notes, themes, subject);
        default:
            return generateGeneralResponse(analysis, notes, themes, subject, originalMessage);
    }
}

// NOVA FUNCIÓ: Generar resum
function generateSummaryResponse(analysis, notes, themes, subject) {
    let targetNotes = notes;
    let summaryTitle = `RESUM GENERAL DE ${subject.toUpperCase()}`;
    
    // Si hi ha temes específics, filtrar notes
    if (analysis.relevantThemes.length > 0) {
        const themeIds = analysis.relevantThemes.map(t => t.id);
        targetNotes = notes.filter(note => themeIds.includes(note.theme));
        summaryTitle = `RESUM DE ${analysis.relevantThemes.map(t => t.name).join(' I ')}`;
    }
    
    if (targetNotes.length === 0) {
        return `⚠️ No he trobat apunts específics per crear aquest resum. Afegeix més contingut als teus apunts.`;
    }
    
    // Crear resum estructurat
    let summary = `📚 <strong>${summaryTitle}</strong><br><br>`;
    
    // Agrupar per temes si és possible
    const groupedNotes = {};
    targetNotes.forEach(note => {
        const theme = themes.find(t => t.id === note.theme);
        const themeName = theme ? theme.name : 'Sense tema';
        if (!groupedNotes[themeName]) {
            groupedNotes[themeName] = [];
        }
        groupedNotes[themeName].push(note);
    });
    
    // Generar resum per cada grup
    Object.keys(groupedNotes).forEach(themeName => {
        summary += `<strong>🎯 ${themeName}:</strong><br>`;
        groupedNotes[themeName].forEach(note => {
            const preview = note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '');
            summary += `• <em>${note.title}</em>: ${preview}<br>`;
        });
        summary += '<br>';
    });
    
    summary += `<strong>📊 ESTADÍSTIQUES:</strong><br>`;
    summary += `• Total apunts analitzats: ${targetNotes.length}<br>`;
    summary += `• Paraules aproximades: ${targetNotes.reduce((sum, note) => sum + note.content.split(' ').length, 0)}<br>`;
    summary += `• Període: ${targetNotes[0]?.date} - ${targetNotes[targetNotes.length - 1]?.date}<br><br>`;
    
    summary += `<strong>🎯 BASAT EXCLUSIVAMENT EN ELS TEUS APUNTS DE ${subject.toUpperCase()}</strong>`;
    
    return summary;
}

// NOVA FUNCIÓ: Generar preguntes
function generateQuestionsResponse(analysis, notes, themes, subject) {
    let targetNotes = notes;
    let questionsTitle = `PREGUNTES D'EXAMEN DE ${subject.toUpperCase()}`;
    
    // Si hi ha temes específics, filtrar notes
    if (analysis.relevantThemes.length > 0) {
        const themeIds = analysis.relevantThemes.map(t => t.id);
        targetNotes = notes.filter(note => themeIds.includes(note.theme));
        questionsTitle = `PREGUNTES DE ${analysis.relevantThemes.map(t => t.name).join(' I ')}`;
    }
    
    if (targetNotes.length === 0) {
        return `⚠️ No puc generar preguntes sense apunts específics. Afegeix contingut primer.`;
    }
    
    let response = `❓ <strong>${questionsTitle}</strong><br><br>`;
    response += `<strong>🎯 PREGUNTES BASADES EXCLUSIVAMENT EN ELS TEUS APUNTS:</strong><br><br>`;
    
    // Generar preguntes intel·ligents basades en el contingut real
    const questions = generateIntelligentQuestions(targetNotes, themes);
    
    questions.forEach((question, index) => {
        response += `<strong>${index + 1}.</strong> ${question}<br><br>`;
    });
    
    response += `<strong>📚 FONT:</strong> Generat a partir de ${targetNotes.length} apunts de ${subject}<br>`;
    response += `<strong>⚠️ IMPORTANT:</strong> Totes les preguntes estan basades en el contingut que has estudiat i escrit.`;
    
    return response;
}

// NOVA FUNCIÓ: Generar preguntes intel·ligents
function generateIntelligentQuestions(notes, themes) {
    const questions = [];
    
    notes.forEach(note => {
        const content = note.content.toLowerCase();
        const title = note.title;
        
        // Preguntes basades en definicions
        if (content.includes('definició') || content.includes('és') || content.includes('significa')) {
            questions.push(`Defineix el concepte principal tractat en "${title}".`);
        }
        
        // Preguntes basades en fórmules
        if (content.includes('=') || content.includes('fórmula')) {
            questions.push(`Explica la fórmula o equació que apareix en els teus apunts de "${title}".`);
        }
        
        // Preguntes basades en exemples
        if (content.includes('exemple') || content.includes('cas')) {
            questions.push(`Descriu l'exemple específic que menciones en "${title}".`);
        }
        
        // Preguntes basades en aplicacions
        if (content.includes('aplicació') || content.includes('utilitzar') || content.includes('serveix')) {
            questions.push(`Quines aplicacions pràctiques menciones en els teus apunts de "${title}"?`);
        }
        
        // Pregunta general sobre el contingut
        questions.push(`Explica els punts principals dels teus apunts sobre "${title}".`);
    });
    
    // Limitar a 8 preguntes màxim i eliminar duplicats
    return [...new Set(questions)].slice(0, 8);
}

// NOVA FUNCIÓ: Generar explicació
function generateExplanationResponse(analysis, notes, themes, subject) {
    if (analysis.relevantNotes.length === 0) {
        return `⚠️ No he trobat informació sobre aquest tema als teus apunts de ${subject}. Afegeix contingut específic per poder explicar-te'l.`;
    }
    
    const relevantNote = analysis.relevantNotes[0];
    const theme = themes.find(t => t.id === relevantNote.theme);
    
    let explanation = `💡 <strong>EXPLICACIÓ BASADA EN ELS TEUS APUNTS</strong><br><br>`;
    explanation += `<strong>📖 Font:</strong> ${relevantNote.title} (${relevantNote.date})<br>`;
    if (theme) {
        explanation += `<strong>🎯 Tema:</strong> ${theme.name} - ${theme.description}<br><br>`;
    }
    
    explanation += `<strong>📝 CONTINGUT DELS TEUS APUNTS:</strong><br>`;
    explanation += `${relevantNote.content.replace(/\n/g, '<br>')}<br><br>`;
    
    // Anàlisi intel·ligent del contingut
    const wordCount = relevantNote.content.split(' ').length;
    const hasFormulas = relevantNote.content.includes('=') || relevantNote.content.includes('²');
    const hasExamples = relevantNote.content.toLowerCase().includes('exemple');
    
    explanation += `<strong>🧠 ANÀLISI INTEL·LIGENT:</strong><br>`;
    explanation += `• Longitud: ${wordCount} paraules<br>`;
    if (hasFormulas) explanation += `• Conté fórmules o equacions<br>`;
    if (hasExamples) explanation += `• Inclou exemples pràctics<br>`;
    
    explanation += `<br><strong>⚠️ BASAT EXCLUSIVAMENT EN ELS TEUS ESTUDIS DE ${subject.toUpperCase()}</strong>`;
    
    return explanation;
}

// NOVA FUNCIÓ: Generar exercicis
function generateExercisesResponse(analysis, notes, themes, subject) {
    if (analysis.relevantNotes.length === 0) {
        return `⚠️ No puc crear exercicis sense contingut específic als teus apunts de ${subject}.`;
    }
    
    let response = `💪 <strong>EXERCICIS PERSONALITZATS DE ${subject.toUpperCase()}</strong><br><br>`;
    response += `<strong>🎯 BASATS EN ELS TEUS APUNTS ESPECÍFICS:</strong><br><br>`;
    
    const exercises = generateCustomExercises(analysis.relevantNotes, themes);
    
    exercises.forEach((exercise, index) => {
        response += `<strong>Exercici ${index + 1}:</strong><br>${exercise}<br><br>`;
    });
    
    response += `<strong>📚 FONT:</strong> Generat a partir dels teus apunts de ${subject}<br>`;
    response += `<strong>⚠️ IMPORTANT:</strong> Tots els exercicis estan basats en el contingut que has estudiat.`;
    
    return response;
}

// NOVA FUNCIÓ: Generar exercicis personalitzats
function generateCustomExercises(notes, themes) {
    const exercises = [];
    
    notes.forEach(note => {
        const content = note.content;
        const title = note.title;
        
        // Exercici de definició
        exercises.push(`Defineix amb les teves pròpies paraules el concepte principal de "${title}" basant-te en els teus apunts.`);
        
        // Exercici d'aplicació
        if (content.toLowerCase().includes('exemple') || content.toLowerCase().includes('aplicació')) {
            exercises.push(`Crea un exemple nou similar al que apareix als teus apunts de "${title}".`);
        }
        
        // Exercici de síntesi
        exercises.push(`Fes un esquema o mapa conceptual del contingut dels teus apunts sobre "${title}".`);
    });
    
    return exercises.slice(0, 5); // Màxim 5 exercicis
}

// NOVA FUNCIÓ: Resposta específica per tema
function generateThemeSpecificResponse(analysis, notes, themes, subject) {
    if (analysis.relevantThemes.length === 0) {
        return `⚠️ No he trobat el tema específic als teus estudis de ${subject}.`;
    }
    
    const theme = analysis.relevantThemes[0];
    const themeNotes = notes.filter(note => note.theme === theme.id);
    
    if (themeNotes.length === 0) {
        return `⚠️ El tema "${theme.name}" existeix però no té apunts associats. Afegeix contingut primer.`;
    }
    
    let response = `🎯 <strong>ANÀLISI DEL ${theme.name.toUpperCase()}</strong><br><br>`;
    response += `<strong>📋 Descripció:</strong> ${theme.description}<br>`;
    response += `<strong>📚 Apunts disponibles:</strong> ${themeNotes.length}<br><br>`;
    
    response += `<strong>📝 CONTINGUT DEL TEMA:</strong><br>`;
    themeNotes.forEach(note => {
        response += `• <strong>${note.title}</strong> (${note.date})<br>`;
        response += `  ${note.content.substring(0, 100)}...<br><br>`;
    });
    
    const totalWords = themeNotes.reduce((sum, note) => sum + note.content.split(' ').length, 0);
    response += `<strong>📊 ESTADÍSTIQUES:</strong><br>`;
    response += `• Total paraules: ${totalWords}<br>`;
    response += `• Apunts: ${themeNotes.length}<br><br>`;
    
    response += `<strong>⚠️ INFORMACIÓ BASADA EXCLUSIVAMENT EN ELS TEUS APUNTS</strong>`;
    
    return response;
}

// NOVA FUNCIÓ: Resposta general intel·ligent
function generateGeneralResponse(analysis, notes, themes, subject, originalMessage) {
    let response = `🤖 <strong>ANÀLISI DE LA TEVA PETICIÓ</strong><br><br>`;
    
    response += `<strong>📊 ESTAT ACTUAL DE ${subject.toUpperCase()}:</strong><br>`;
    response += `• Apunts disponibles: ${notes.length}<br>`;
    response += `• Temes creats: ${themes.length}<br>`;
    response += `• Paraules totals: ${notes.reduce((sum, note) => sum + note.content.split(' ').length, 0)}<br><br>`;
    
    if (analysis.relevantNotes.length > 0) {
        response += `<strong>🔍 HE TROBAT INFORMACIÓ RELLEVANT:</strong><br>`;
        analysis.relevantNotes.slice(0, 3).forEach(note => {
            response += `• ${note.title} (${note.date})<br>`;
        });
        response += '<br>';
    }
    
    response += `<strong>💡 EL QUE PUC FER AMB ELS TEUS APUNTS:</strong><br>`;
    response += `• "Fes un resum del tema 1" - Resum específic<br>`;
    response += `• "Genera preguntes d'examen" - Preguntes dels teus apunts<br>`;
    response += `• "Explica [concepte]" - Explicació basada en els teus estudis<br>`;
    response += `• "Crea exercicis" - Exercicis personalitzats<br><br>`;
    
    response += `<strong>🎯 RECORDATORI:</strong> Només treballaré amb la informació que has escrit. No inventaré res!<br><br>`;
    
    response += `Què vols que faci específicament amb els teus estudis de ${subject}?`;
    
    return response;
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
    processingMessage.innerHTML = '<p>🔍 Analitzant la imatge amb IA especialitzada...</p>';
    chatMessages.appendChild(processingMessage);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simular resposta intel·ligent de la IA
    setTimeout(() => {
        const subjectData = getSubjectData(currentSubject || 'General');
        const totalNotes = (subjectData.notes.past?.length || 0) + (subjectData.notes.current?.length || 0);
        
        processingMessage.innerHTML = `
            <p><strong>📸 ANÀLISI D'IMATGE COMPLETADA</strong><br><br>
            
            He processat la teva imatge amb la meva IA especialitzada en estudis.<br><br>
            
            <strong>🧠 EL QUE PUC FER:</strong><br>
            • Extreure text de la imatge per afegir als teus apunts<br>
            • Analitzar fórmules o diagrames<br>
            • Relacionar el contingut amb els teus ${totalNotes} apunts existents<br>
            • Crear preguntes basades en el contingut visual<br><br>
            
            <strong>🎯 IMPORTANT:</strong> Només treballaré amb el que veig a la imatge i els teus apunts reals.<br><br>
            
            Què vols que faci amb aquesta imatge? Puc extreure el text, explicar conceptes que hi apareguin, o relacionar-ho amb els teus estudis de ${currentSubject || 'aquesta assignatura'}.</p>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 2000);
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