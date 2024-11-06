document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('saveButton');
    const noteTitle = document.getElementById('noteTitle');
    const noteContent = document.getElementById('noteContent');
    const noteCategory = document.getElementById('noteCategory');
    const noteStatus = document.getElementById('noteStatus');
    const notesContainer = document.getElementById('notesContainer');
    const restoreButton = document.getElementById('restoreButton');
    const restoreInput = document.getElementById('restoreInput');
    const backupButton = document.getElementById('backupButton');
    const toggleSidebarButton = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');

     // Event listener to toggle the sidebar
     toggleSidebarButton.addEventListener('click', function() {
         sidebar.classList.toggle('closed');
     })

    saveButton.addEventListener('click', saveNote);

    function saveNote() {
        const title = noteTitle.value.trim();
        const content = noteContent.value.trim();
        const category = noteCategory.value.trim();
        const status = noteStatus.value;

        if (title && content && category) {
            let notes = JSON.parse(localStorage.getItem('notes')) || [];

            const existingNote = notes.find(note => note.title === title);

            if (existingNote) {
                existingNote.content = content;
                existingNote.category = category;
                existingNote.status = status;
            } else {
                notes.push({ title, content, category, status });
            }

            localStorage.setItem('notes', JSON.stringify(notes));
            noteTitle.value = '';
            noteContent.value = '';
            noteCategory.value = '';
            noteStatus.value = 'Published';
            loadNotes();
        } else {
            alert('Please enter a title, content, and category for the note.');
        }
    }

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
                categoryElement.textContent = ` (${note.category}) - ${note.status}`;
                noteElement.appendChild(categoryElement);

                // Create delete link
                const deleteLink = document.createElement('a');
                deleteLink.href = '#';
                deleteLink.textContent = 'Delete';
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

    function loadNoteContent(note) {
        noteTitle.value = note.title;
        noteContent.value = note.content;
        noteCategory.value = note.category;
        noteStatus.value = note.status;
    }

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
        const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'notes_backup.json';
        a.click();

        URL.revokeObjectURL(url); // Clean up
    });

    // Restore Notes
    restoreButton.addEventListener('click', () => {
        restoreInput.click(); // Trigger file input
    });

    restoreInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedNotes = JSON.parse(e.target.result);
                    if (Array.isArray(importedNotes)) {
                        localStorage.setItem('notes', JSON.stringify(importedNotes));
                        loadNotes();
                        alert('Notes restored successfully!');
                    } else {
                        alert('Invalid backup file.');
                    }
                } catch (error) {
                    alert('Failed to parse backup file.');
                }
            };
            reader.readAsText(file);
        }
    });

    loadNotes(); // Initially load notes
});
