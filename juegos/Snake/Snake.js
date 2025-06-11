document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    const scoreCount = document.getElementById('score-count');
    const overlay = document.getElementById('game-overlay');
    const startButton = document.getElementById('start-button');
    const overlayText = overlay.querySelector('p');

    // --- Configuración del Juego ---
    const tileSize = 20; // Tamaño de cada cuadro (un poco más pequeño para un grid mayor)
    const gridSize = 30; // =====> MEJORA: Mapa más grande (30x30)
    canvas.width = canvas.height = tileSize * gridSize;

    // --- Carga de Imágenes ---
    const snakeImages = {
        head: new Image(),
        body: new Image(),
        tail: new Image()
    };
    snakeImages.head.src = '/Oficina_de_ocio/juegos/Snake/img/Cabeza.png';
    snakeImages.body.src = '/Oficina_de_ocio/juegos/Snake/img/Cuerpo.png';
    snakeImages.tail.src = '/Oficina_de_ocio/juegos/Snake/img/Cola.png';

    const foodImages = [];
    for (let i = 1; i <= 5; i++) {
        const foodImg = new Image();
        foodImg.src = `img/${i}.png`;
        foodImages.push(foodImg);
    }
    
    // --- Estado del Juego ---
    let snake, food, score, direction, gameInterval, gameOver;

    function initState() {
        // Inicia la serpiente en el centro del nuevo mapa
        const startPos = Math.floor(gridSize / 2);
        snake = [
            { x: startPos, y: startPos }, 
            { x: startPos - 1, y: startPos },
            { x: startPos - 2, y: startPos }
        ];
        score = 0;
        direction = { x: 1, y: 0 };
        gameOver = false;
        generateFood();
        updateScore();
    }
    
    function generateFood() {
        let foodPosition;
        do {
            foodPosition = {
                x: Math.floor(Math.random() * gridSize),
                y: Math.floor(Math.random() * gridSize),
                img: foodImages[Math.floor(Math.random() * foodImages.length)]
            };
        } while (isPositionOnSnake(foodPosition));
        food = foodPosition;
    }

    function isPositionOnSnake(position) {
        // No se necesita para la colisión de la cabeza, pero sí para generar comida
        return snake.some(segment => segment.x === position.x && segment.y === position.y);
    }

    function gameLoop() {
        if (gameOver) {
            clearInterval(gameInterval);
            overlayText.innerHTML = `GAME OVER<br>KPIs Finales: ${score}`;
            startButton.textContent = "↻ Reiniciar Tarea";
            overlay.classList.remove('hidden');
            return;
        }

        moveSnake();
        clearCanvas();
        drawFood();
        drawSnake();
    }

    function moveSnake() {
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        // =====> CORRECCIÓN: Comprobar colisión ANTES de mover la serpiente
        // Colisión con las paredes
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            gameOver = true;
            return;
        }
        // Colisión con su propio cuerpo
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver = true;
                return;
            }
        }
        
        // Si no hay colisión, ahora sí movemos la serpiente
        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score++;
            updateScore();
            generateFood();
        } else {
            snake.pop();
        }
    }

    function updateScore() {
        scoreCount.textContent = score;
    }

    function clearCanvas() {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawFood() {
        ctx.drawImage(food.img, food.x * tileSize, food.y * tileSize, tileSize, tileSize);
    }

    function drawSnake() {
        for (let i = 0; i < snake.length; i++) {
            const segment = snake[i];
            let img, angle = 0;
            
            if (i === 0) {
                img = snakeImages.head;
                if(direction.x === 1) angle = 0;
                if(direction.x === -1) angle = Math.PI;
                if(direction.y === 1) angle = Math.PI / 2;
                if(direction.y === -1) angle = -Math.PI / 2;
            } else if (i === snake.length - 1) {
                img = snakeImages.tail;
                const prevSegment = snake[i-1];
                if(prevSegment.x > segment.x) angle = 0;
                if(prevSegment.x < segment.x) angle = Math.PI;
                if(prevSegment.y > segment.y) angle = Math.PI / 2;
                if(prevSegment.y < segment.y) angle = -Math.PI / 2;
            } else {
                img = snakeImages.body;
                 const nextSegment = snake[i+1];
                const prevSegment = snake[i-1];
                // Lógica simple para rotar cuerpo (opcional, pero mejora la estética en giros)
                if ((prevSegment.x < segment.x && nextSegment.x > segment.x) || (nextSegment.x < segment.x && prevSegment.x > segment.x)) {
                    angle = 0; // Horizontal
                } else if ((prevSegment.y < segment.y && nextSegment.y > segment.y) || (nextSegment.y < segment.y && prevSegment.y > segment.y)){
                     angle = Math.PI/2; // Vertical
                } else { // Es una esquina
                    // Esta parte puede volverse compleja, por ahora la dejamos así
                    // para mantener la simplicidad. El cuerpo se verá recto en las esquinas.
                     if ((direction.x !== 0 && prevSegment.y !== segment.y) || (direction.y !== 0 && prevSegment.x !== segment.x)) {
                         angle = Math.PI / 2;
                     }
                }
            }
            
            drawRotatedImage(img, segment.x * tileSize, segment.y * tileSize, angle);
        }
    }
    
    function drawRotatedImage(image, x, y, angle) {
        ctx.save();
        ctx.translate(x + tileSize / 2, y + tileSize / 2);
        ctx.rotate(angle);
        ctx.drawImage(image, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
        ctx.restore();
    }

    function changeDirection(e) {
        const keyPressed = e.key.toLowerCase(); // Convertir a minúscula para 'W,A,S,D'
        const goingUp = direction.y === -1;
        const goingDown = direction.y === 1;
        const goingRight = direction.x === 1;
        const goingLeft = direction.x === -1;

        // =====> MEJORA: Añadidos los controles WASD
        if (['arrowup', 'w'].includes(keyPressed) && !goingDown) {
            direction = { x: 0, y: -1 };
        }
        if (['arrowdown', 's'].includes(keyPressed) && !goingUp) {
            direction = { x: 0, y: 1 };
        }
        if (['arrowleft', 'a'].includes(keyPressed) && !goingRight) {
            direction = { x: -1, y: 0 };
        }
        if (['arrowright', 'd'].includes(keyPressed) && !goingLeft) {
            direction = { x: 1, y: 0 };
        }
    }

    function startGame() {
        initState();
        overlay.classList.add('hidden');
        gameInterval = setInterval(gameLoop, 120); // Un poco más rápido para más desafío
        window.addEventListener('keydown', changeDirection);
    }
    
    startButton.addEventListener('click', startGame);
});