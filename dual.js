 const apiUrlHarry = "https://dog.ceo/dog-api/documentation/random";
 const apiUrlDogs = "https://dog.ceo/api/breeds/image/random/8";

class AudioController {
    constructor() {
        this.bgMusic = new Audio('Assets/Audio/creepy.mp3');
        this.flipSound = new Audio('Assets/Audio/flip.wav');
        this.matchSound = new Audio('Assets/Audio/match.wav');
        this.victorySound = new Audio('Assets/Audio/victory.wav');
        this.gameOverSound = new Audio('Assets/Audio/gameOver.wav');
        this.bgMusic.volume = 0.5;
        this.bgMusic.loop = true;
    }
    startMusic() {
        this.bgMusic.play();
    }
    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }
    flip() {
        this.flipSound.play();
    }
    match() {
        this.matchSound.play();
    }
    victory() {
        this.stopMusic();
        this.victorySound.play();
    }
    gameOver() {
        this.stopMusic();
        this.gameOverSound.play();
    }
}

function createGameTable() {
    const gameContainer = document.querySelector('.game-container');
    for (let i = 0; i < 16; i++) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <div class="card-back card-face">
                <img id = "F" class="spider" src="">
            </div>
            <div class="card-front card-face">
                <img id = "B" class="card-value">
            </div>
        `;
        gameContainer.appendChild(card);
    }
  }

async function fetchDogImages() {
    try {
        const response = await fetch(apiUrlDogs); // שימוש בכתובת apiUrl המכילה 8 תמונות
        const data = await response.json();
        const imageUrls = data.message; // מערך של כתובות URL של התמונות

        return imageUrls;
    } catch (error) {
        console.error("Error fetching dog images:", error);
        return [];
    }
}

async function fetchAndDisplayDogImages() {
    try {
        const imageUrls = await fetchDogImages(); // קריאה לפונקציה שמביאה את התמונות

        const cardImages = document.querySelectorAll(".card-value");

        function duplicateArray(array) {
            const duplicated = [];
            for (let i = 0; i < 2; i++) {
                duplicated.push(...array);
            }
            return duplicated;
        }

        const duplicatedImages = duplicateArray(imageUrls);
        duplicatedImages.sort(() => Math.random() - 0.5);

        cardImages.forEach((card, index) => {
            card.src = duplicatedImages[index];
        });

    } catch (error) {
        console.error("Error fetching and displaying dog images:", error);
    }
}

async function fetchAndDisplayCharacters() {
    try {
        const response = await fetch(apiUrlHarry);
        const data = await response.json();

        // שימוש בשני חצאים מהמערך של הדמויות
        const charactersSubset = data.slice(0, 8);

        const characterList = document.getElementById("character-list");
        const cardImages = Array.from(document.querySelectorAll(".card-value"));

        charactersSubset.forEach((character, index) => {
            const characterImage = document.createElement("img");
            characterImage.src = character.image;
            characterImage.alt = character.name;

            // שים את אותה התמונה פעמיים
            cardImages[index * 2].src = character.image;
            cardImages[index * 2 + 1].src = character.image;
        });

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

fetchAndDisplayCharacters();

//fetchAndDisplayDogImages();


class MixOrMatch {
    constructor(totalTime, cards) {
        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timeRemaining = totalTime;
        this.timer = document.getElementById('time-remaining')
        this.ticker = document.getElementById('flips');
        this.audioController = new AudioController();
    }

    startGame() {
        this.totalClicks = 0;
        this.timeRemaining = this.totalTime;
        this.cardToCheck = null;
        this.matchedCards = [];
        this.busy = true;
        setTimeout(() => {
            this.audioController.startMusic();
            this.shuffleCards(this.cardsArray);
            this.countdown = this.startCountdown();
            this.busy = false;
        }, 500)
        this.hideCards();
        this.timer.innerText = this.timeRemaining;
        this.ticker.innerText = this.totalClicks;
    }
    startCountdown() {
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if(this.timeRemaining === 0)
                this.gameOver();
        }, 1000);
    }
    gameOver() {
        clearInterval(this.countdown);
        this.audioController.gameOver();
        document.getElementById('game-over-text').classList.add('visible');
    }
    victory() {
        clearInterval(this.countdown);
        this.audioController.victory();
        document.getElementById('victory-text').classList.add('visible');
    }
    hideCards() {
        this.cardsArray.forEach(card => {
            card.classList.remove('visible');
            card.classList.remove('matched');
        });
    }
    flipCard(card) {
        if(this.canFlipCard(card)) {
            this.audioController.flip();
            this.totalClicks++;
            this.ticker.innerText = this.totalClicks;
            card.classList.add('visible');

            if(this.cardToCheck) {
                this.checkForCardMatch(card);
            } else {
                this.cardToCheck = card;
            }
        }
    }
    checkForCardMatch(card) {
        if(this.getCardType(card) === this.getCardType(this.cardToCheck))
            this.cardMatch(card, this.cardToCheck);
        else 
            this.cardMismatch(card, this.cardToCheck);

        this.cardToCheck = null;
    }
    cardMatch(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.audioController.match();
        if(this.matchedCards.length === this.cardsArray.length)
            this.victory();
    }
    cardMismatch(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove('visible');
            card2.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }

    shuffleCards(cardsArray) {
        // ערבב את הקלפים שלוש פעמים
        for (let shuffleCount = 0; shuffleCount < 3; shuffleCount++) {
            for (let i = cardsArray.length - 1; i > 0; i--) {
                let randIndex = Math.floor(Math.random() * (i + 1));
                cardsArray[randIndex].style.order = i;
                cardsArray[i].style.order = randIndex;
            }
        }
    }
    
    getCardType(card) {
        return card.getElementsByClassName('card-value')[0].src;
    }
    canFlipCard(card) {
        return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
    }
}

if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}

function ready() {
    // מצביע לאובייקטים שמכילים את הלמטרות הרלוונטיות בדף
    let overlays = Array.from(document.getElementsByClassName('overlay-text'));
    let cards = Array.from(document.getElementsByClassName('card'));
    let game = new MixOrMatch(100, cards);

    // הוסף אירוע ללחיצה על כל קלף
    cards.forEach(card => {
        card.addEventListener('click', () => {
            game.flipCard(card);
        });
    });

    // הוסף אירוע ללחיצה על מסך ההתחלה (overlay) כדי להתחיל משחק חדש
    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.classList.remove('visible');
            game.startGame();
        });
    });
}

// בדוק אם המסמך נטען ואז הפעל את הפונקציה ready()
if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}
