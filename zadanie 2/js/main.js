new Vue({
    el: '#app',
    data: {
        noteTitle: '',
        items: [],
        firstColumn: [],
        secondColumn: [],
        thirdColumn: [],
        isFirstColumnFixed: false,
    },
    mounted() {
        if (localStorage.getItem('noteData')) {
            const noteData = JSON.parse(localStorage.getItem('noteData'));
            this.firstColumn = noteData.firstColumn;
            this.secondColumn = noteData.secondColumn;
            this.thirdColumn = noteData.thirdColumn;
        }
    },
    methods: {
        deleteNoteGroup(groupId) {
            this.firstColumn = this.firstColumn.filter(group => group.id !== groupId);
            this.secondColumn = this.secondColumn.filter(group => group.id !== groupId);
            this.thirdColumn = this.thirdColumn.filter(group => group.id !== groupId);
            this.saveDataToLocalStorage();
            this.checkDisableFirstColumn();
        },
        updateProgress(card) {
            const checkedCount = card.items.filter(item => item.checked).length;
            const progress = (checkedCount / card.items.length) * 100;
            card.isComplete = progress === 100;
            this.checkMoveCard();
            this.saveDataToLocalStorage();
            if (card.isComplete) {
                card.lastChecked = new Date().toLocaleString();
            }

            card.items.forEach(item => {
                item.disabled = item.checked;
            });

            if (progress >= 50 && this.secondColumn.length >= 5) {
                this.disableFirstColumn();
            }

            this.checkMoveCard();
            this.saveDataToLocalStorage();
        },
        disableFirstColumn() {
            this.isFirstColumnFixed = true;

            this.firstColumn.forEach(note => {
                note.items.forEach(item => {
                    item.disabled = true;
                    item.isFixed = item.checked;
                });
            });
        },
        moveFirstColumn() {
            this.firstColumn.forEach(note => {
                const progress = (note.items.filter(item => item.checked).length / note.items.length) * 100;

                const isMaxSecondColumn = this.secondColumn.length >= 5;

                if (progress >= 50 && !isMaxSecondColumn) {
                    this.secondColumn.push(note);
                    this.firstColumn.splice(this.firstColumn.indexOf(note), 1);
                    this.moveSecondColumn();
                }
            });
        },
        moveSecondColumn() {
            this.secondColumn.forEach(note => {
                const progress = (note.items.filter(item => item.checked).length / note.items.length) * 100;
                if (progress === 100) {
                    note.isComplete = true;
                    note.lastChecked = new Date().toLocaleString();
                    this.thirdColumn.push(note);
                    this.secondColumn.splice(this.secondColumn.indexOf(note), 1);
                    this.moveFirstColumn();
                }
            });
        },
        checkMoveCard() {
            this.moveFirstColumn();
            this.moveSecondColumn();
            if (this.isFirstColumnFixed && this.firstColumn.length === 0) {
                this.isFirstColumnFixed = false;
            }
        },
        checkDisableFirstColumn() {
            if (this.secondColumn.length >= 5) {
                const areAllSecondColumnComplete = this.secondColumn.every(note => note.isComplete);
                this.firstColumn.forEach(note => {
                    note.items.forEach(item => {
                        if (areAllSecondColumnComplete) {
                            item.disabled = true;
                        } else {
                            item.disabled = false;
                        }
                    });
                });
            } else if (this.isFirstColumnFixed) {
                this.isFirstColumnFixed = false;
                this.firstColumn.forEach(note => {
                    note.items.forEach(item => {
                        item.disabled = false;
                    });
                });
            }
        },
        addItem() {
            if (this.items.length < 5) {
                if (this.items.some(item => item.text.trim() === '')) {
                    return;
                }

                this.items.push({ id: Date.now(), text: '', checked: false });
            }
        },
        createNotes() {
            if (this.noteTitle && this.items.length >= 3 && this.items.length <= 5) {
                const firstColumnCardCount = this.firstColumn.length;
                const hasEmptyText = this.items.some(item => item.text.trim() === '');

                if (firstColumnCardCount < 3 && !hasEmptyText) {
                    const newNoteGroup = {
                        id: Date.now(),
                        noteTitle: this.noteTitle,
                        items: this.items,
                        isComplete: false,
                        lastChecked: null
                    };

                    this.firstColumn.push(newNoteGroup);
                    this.saveDataToLocalStorage();
                }

                this.noteTitle = '';
                this.items = [];
            }
        },
        deleteAllCardsInColumn(columnIndex) {
            switch (columnIndex) {
                case 1:
                    this.firstColumn = [];
                    break;
                case 2:
                    this.secondColumn = [];
                    break;
                case 3:
                    this.thirdColumn = [];
                    break;
                default:
                    break;
            }
            this.saveDataToLocalStorage();
            this.checkDisableFirstColumn();
        },
        saveDataToLocalStorage() {
            const noteData = {
                firstColumn: this.firstColumn,
                secondColumn: this.secondColumn,
                thirdColumn: this.thirdColumn
            };
            localStorage.setItem('noteData', JSON.stringify(noteData));
        },
    }
});