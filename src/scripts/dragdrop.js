const board = document.getElementById('puzzle-board');
const statusEl = document.getElementById('puzzle-status');
const actionBtn = document.getElementById('shuffle-btn');

if (board) {
    const imageUrl = board.dataset.image;
    const gridSize = 3;
    let pieces = [];
    let draggedElement = null;
    let isSolvedState = false;

    board.style.aspectRatio = '1 / 1.414';

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
            board.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
        }
        initPuzzle();
    };

    if (img.complete) {
        initPuzzle();
    }

    function initPuzzle() {
        isSolvedState = false;
        board.innerHTML = '';
        board.classList.remove('solved');
        if (statusEl) statusEl.textContent = '';
        if (actionBtn) actionBtn.textContent = 'Jos olet kärsimätön, niin ratkaise palapeli tästä';
        pieces = [];

        for (let i = 0; i < gridSize * gridSize; i++) {
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.draggable = true;
            piece.dataset.correctIndex = i;

            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            const posX = (col / (gridSize - 1)) * 100;
            const posY = (row / (gridSize - 1)) * 100;

            piece.style.backgroundImage = `url("${imageUrl}")`;
            piece.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
            piece.style.backgroundPosition = `${posX}% ${posY}%`;

            addDragEvents(piece);
            pieces.push(piece);
        }

        shufflePieces();
        renderBoard();
    }

    function shufflePieces() {
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }

        const isAlreadySolved = pieces.every((p, idx) => Number(p.dataset.correctIndex) === idx);
        if (isAlreadySolved) {
            pieces.reverse();
        }
    }

    function solvePuzzle() {
        pieces.sort((a, b) => Number(a.dataset.correctIndex) - Number(b.dataset.correctIndex));
        renderBoard();
        markAsSolved('✨ CV paljastettu! Nyt vain tapaamista sopimaan.');
    }

    function renderBoard() {
        board.innerHTML = '';
        pieces.forEach((piece) => board.appendChild(piece));
    }

    function addDragEvents(piece) {
        piece.addEventListener('dragstart', (e) => {
            if (isSolvedState) return;
            draggedElement = piece;
            piece.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        piece.addEventListener('dragend', () => {
            piece.classList.remove('dragging');
            document.querySelectorAll('.puzzle-piece').forEach((p) => p.classList.remove('drag-over'));
            draggedElement = null;
        });

        piece.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (piece !== draggedElement && !isSolvedState) {
                piece.classList.add('drag-over');
            }
        });

        piece.addEventListener('dragleave', () => {
            piece.classList.remove('drag-over');
        });

        piece.addEventListener('drop', (e) => {
            e.preventDefault();
            piece.classList.remove('drag-over');

            if (!draggedElement || draggedElement === piece || isSolvedState) return;

            const fromIndex = pieces.indexOf(draggedElement);
            const toIndex = pieces.indexOf(piece);

            [pieces[fromIndex], pieces[toIndex]] = [pieces[toIndex], pieces[fromIndex]];

            renderBoard();
            checkWin();
        });
    }

    function checkWin() {
        const isSolved = pieces.every((piece, index) => Number(piece.dataset.correctIndex) === index);

        if (isSolved) {
            markAsSolved('🎉 Hienoa! CV on koottu. Nyt vain tapaamista sopimaan!');
        }
    }

    function markAsSolved(message) {
        isSolvedState = true;
        board.classList.add('solved');
        if (statusEl) {
            statusEl.textContent = message;
        }
        if (actionBtn) {
            actionBtn.textContent = 'Sekoita uudelleen';
        }
        pieces.forEach((p) => (p.draggable = false));
    }

    if (actionBtn) {
        actionBtn.addEventListener('click', () => {
            if (isSolvedState) {
                initPuzzle();
            } else {
                solvePuzzle();
            }
        });
    }
}
