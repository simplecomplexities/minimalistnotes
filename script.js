document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('saveButton');
    const noteTitle = document.getElementById('noteTitle');
    const noteContent = document.getElementById('noteContent');
    const noteCategory = document.getElementById('noteCategory');
    const noteStatus = document.getElementById('noteStatus');
    const noteTags = document.getElementById('noteTags');
    const notesContainer = document.getElementById('notesContainer');
    const restoreButton = document.getElementById('restoreButton');
    const restoreInput = document.getElementById('restoreInput');
    const backupButton = document.getElementById('backupButton');
    const toggleSidebarButton = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const newNoteButton = document.getElementById('newNoteButton');

    // Autosave variables
    let autosaveTimeout = null;
    const AUTO_SAVE_DELAY = 10000;  // Time in milliseconds (2 seconds) to wait after user stops typing

    // Autosave function
    function autosave() {
        clearTimeout(autosaveTimeout);
        autosaveTimeout = setTimeout(saveNote, AUTO_SAVE_DELAY);
    }

    // Event listener for input changes
    noteTitle.addEventListener('input', autosave);
    noteContent.addEventListener('input', autosave);
    noteCategory.addEventListener('input', autosave);
    noteStatus.addEventListener('input', autosave);

    // Event listener for the New Note button
    newNoteButton.addEventListener('click', function() {
        // Clear form fields to prepare for a new note
        noteTitle.value = '';
        noteContent.value = '';
        noteCategory.value = '';
        noteStatus.value = 'Published'; // or whichever default status you prefer
        noteTags.value = ''; // Reset tags field
    });

    // Event listener to toggle the sidebar
    toggleSidebarButton.addEventListener('click', function() {
        sidebar.classList.toggle('closed');
    });

    saveButton.addEventListener('click', saveNote);

    // Save note function
    function saveNote() {
        const title = noteTitle.value.trim();
        const content = noteContent.value.trim();
        const category = noteCategory.value.trim();
        const status = noteStatus.value;
        const tags = noteTags.value.split(',').map(tag => tag.trim()); // Process tags

        if (title && content && category) {
            let notes = JSON.parse(localStorage.getItem('notes')) || [];

            // Check if the note already exists
            const existingNote = notes.find(note => note.title === title);

            if (existingNote) {
                // Update existing note
                existingNote.content = content;
                existingNote.category = category;
                existingNote.status = status;
                existingNote.tags = tags; // Update tags
            } else {
                // Create a new note
                notes.push({ title, content, category, status, tags });
            }

            // Save updated notes to localStorage
            localStorage.setItem('notes', JSON.stringify(notes));

            // Optionally: Call loadNotes() to refresh the notes list after save
            loadNotes();
        } else {
            alert('Please enter a title, content, and category for the note.');
        }
    }

    // Load notes from localStorage
    function loadNotes() {
        notesContainer.innerHTML = ''; // Clear previous notes
        let notes = JSON.parse(localStorage.getItem('notes')) || [];

        // Group notes by category
        const categorizedNotes = {};

        notes.forEach(note => {
            if (!categorizedNotes[note.category]) {
                categorizedNotes[note.category] = [];
            }
            categorizedNotes[note.category].push(note);
        });

        // Sort categories alphabetically
        const categories = Object.keys(categorizedNotes).sort();

        categories.forEach(category => {
            // Create a header for each category
            const categoryHeader = document.createElement('h3');
            categoryHeader.textContent = category;
            notesContainer.appendChild(categoryHeader);

            // Sort the notes within this category alphabetically by title
            categorizedNotes[category].sort((a, b) => a.title.localeCompare(b.title));

            // List notes under this category
            categorizedNotes[category].forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.classList.add('note-item');

                const titleLink = document.createElement('a');
                titleLink.textContent = note.title;
                titleLink.href = '#';
                titleLink.classList.add('note-title');
                titleLink.addEventListener('click', () => loadNoteContent(note));
                noteElement.appendChild(titleLink);

                const categoryElement = document.createElement('span');
                categoryElement.textContent = ` ${note.status}`;
                categoryElement.style.color = "yellow";
                noteElement.appendChild(categoryElement);

                // Display tags for each note
                if (note.tags && note.tags.length > 0) {
                    const tagsElement = document.createElement('span');
                    note.tags.forEach(tag => {
                        const tagElement = document.createElement('span');
                        tagElement.textContent = tag;
                        tagElement.classList.add('tag');
                        tagElement.style.color = "orange";
                        tagElement.addEventListener('click', () => filterByTag(tag));
                        tagsElement.appendChild(tagElement);
                    });
                    noteElement.appendChild(tagsElement);
                }

                // Create delete link
                const deleteLink = document.createElement('a');
                deleteLink.href = '#';
                deleteLink.textContent = '[–]';
                deleteLink.style.color = 'red';
                deleteLink.style.marginLeft = '10px';
                deleteLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    deleteNote(note.title);
                });
                noteElement.appendChild(deleteLink);

                notesContainer.appendChild(noteElement); // Add the note to the container
            });
        });
    }

    // Load content into the form for editing
    function loadNoteContent(note) {
        noteTitle.value = note.title;
        noteContent.value = note.content;
        noteCategory.value = note.category;
        noteStatus.value = note.status;
        noteTags.value = note.tags.join(', '); // Display tags when editing
    }

    // Delete note
    function deleteNote(title) {
        if (confirm("Are you sure you want to delete this note?")) {
            let notes = JSON.parse(localStorage.getItem('notes')) || [];
            notes = notes.filter(note => note.title !== title); // Remove the note by title
            localStorage.setItem('notes', JSON.stringify(notes));
            loadNotes(); // Reload notes after deletion
        }
    }

    // Backup Notes
    backupButton.addEventListener('click', () => {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const blob = new Blob([JSON.stringify(notes)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notes_backup.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Restore Notes
    restoreInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const notes = JSON.parse(event.target.result);
                localStorage.setItem('notes', JSON.stringify(notes)); // Save restored notes
                loadNotes(); // Reload notes after restoration
            };
            reader.readAsText(file);
        }
    });

    // Initial load of notes
    loadNotes();
});
