document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.querySelector('.memory-game-board');
    const attemptsCount = document.getElementById('attempts-count');
    const restartButton = document.getElementById('restart-button');

    const imagePaths = Array.from({ length: 10 }, (_, i) => `img/${i + 1}.png`);
    let cardArray = [...imagePaths, ...imagePaths];

    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let attempts = 0;
    let matchedPairs = 0;

    function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
    }

    function createBoard() {
        // Limpiar tablero y reiniciar variables
        gameBoard.innerHTML = '';
        attempts = 0;
        matchedPairs = 0;
        attemptsCount.textContent = attempts;
        lockBoard = false;
        hasFlippedCard = false;

        shuffle(cardArray);

        cardArray.forEach(imageSrc => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.framework = imageSrc;

            card.innerHTML = `
                <div class="front-face">
                    <img src="${imageSrc}" alt="Icono de Oficina">
                </div>
                <div class="back-face"></div>
            `;

            gameBoard.appendChild(card);
            card.addEventListener('click', flipCard);
        });
    }

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return; // Evita doble click en la misma tarjeta

        this.classList.add('flip');

        if (!hasFlippedCard) {
            // Primer click
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        // Segundo click
        secondCard = this;
        checkForMatch();
    }

    function checkForMatch() {
        attempts++;
        attemptsCount.textContent = attempts;

        let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;

        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        // Es un par correcto
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        matchedPairs++;
        if (matchedPairs === imagePaths.length) {
            setTimeout(() => {
                alert(`¡Felicidades! Completaste la tarea en ${attempts} intentos.`);
            }, 500);
        }

        resetBoard();
    }

    function unflipCards() {
        // No es un par
        lockBoard = true; // Bloquea el tablero para no voltear más tarjetas

        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetBoard();
        }, 1200); // Tiempo para que el jugador vea la segunda tarjeta
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }
    
    // Iniciar el juego por primera vez
    createBoard();

    // Evento para el botón de reiniciar
    restartButton.addEventListener('click', (e) => {
        e.preventDefault(); // Evita que el enlace recargue la página
        createBoard();
    });
});