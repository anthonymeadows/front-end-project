$(document).ready(function () {
    $('button').click(match);
});

$('#score').appendTo($('#header'))

function match() {

    let arrayOfImages = [];
    let arrayOfImageObjects = [];
    let selectedCard;
    let lastCard;
    let clickedCards = [];
    let found = 0;

    async function fetchData() {
        
        gameStart();
        const pairRequest = parseInt($('#userInput').val(), 10);
        $('#howManyPairs').toggle();
        if (!isNaN(pairRequest) && pairRequest > 0) {
            try {
                while (arrayOfImages.length < pairRequest) {
                    const data = await fetchSingleImage();
                    if (!arrayOfImages.includes(data)) {
                        arrayOfImages.push(data);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }

        handleImages();
        score();
    }

    async function fetchSingleImage() {
        return new Promise((resolve, reject) => {
            $.get('https://random.imagecdn.app/v1/image?width=120&height=120', (data) => {
                console.log('Fetched image:', data);
                resolve(data);
            }).fail((error) => {
                reject(error);
            });
        });
    }

    //Used to identify matches
    function assignCardNum() {
        for (let i = 0; i < arrayOfImages.length; i++) {
            let obj = {};
            obj['card'] = i;
            obj['url'] = arrayOfImages[i];
            arrayOfImageObjects.push(obj);
        }
    }

    //double the array, and shuffle the order using fisher yates algorithm
    function shuffleAndDouble() {
        assignCardNum();
        arrayOfImageObjects = arrayOfImageObjects.concat(arrayOfImageObjects);
        for (let i = arrayOfImageObjects.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arrayOfImageObjects[i], arrayOfImageObjects[j]] = [arrayOfImageObjects[j], arrayOfImageObjects[i]];
        }
    }

    //holds all cards
    function cardHolder() {
        $('#cardsHolder').css({
            position: 'absolute',
            top: '100px',
            backgroundColor: '#07125b',
            display: 'flex',
            flexWrap: 'wrap',
            padding: '10px',
            justifyContent: 'center',
            border: '5px solid black',
            borderRadius: '10px',
            height: 'max-content',
            width: '90dvw',
            gap: '1rem',
            zIndex: '0',
        });
    }

    function handleImages() {
        shuffleAndDouble();
        cardHolder();
        $('#cardsHolder').empty();

        for (let i = 0; i < arrayOfImageObjects.length; i++) {
            createCard(arrayOfImageObjects[i]);
        }
        gameLogic();
    }

    function createCard(cardData) {
        let imageUrl = cardData['url'];
        let pairNum = cardData['card'];

        let div = $('<div>').addClass('card').attr('data-pair', pairNum);
        let front = $('<img>').addClass('front').attr('src', 'frontCard.png').appendTo(div);
        let back = $('<img>').addClass('back').attr('src', imageUrl).appendTo(div);

        div.click(function (e) {
            e.preventDefault()
            $(this).toggleClass('flipped');
            gameLogic(pairNum);
        });

        div.appendTo($('#cardsHolder'));
    }

    function gameLogic(pairNum) {
        let flippedCards = $('.flipped:not(.matched)');

        if (flippedCards.length === 2) {
            $('#cardsHolder').css('pointer-events', 'none');

            let card1 = $(flippedCards[0]);
            let card2 = $(flippedCards[1]);

            if (card1.attr('data-pair') === card2.attr('data-pair')) {
                handleMatchedCards(flippedCards);
            } else {
                handleMismatchedCards(flippedCards);
            }
        }
    }

    function handleMatchedCards(flippedCards) {
        flippedCards.addClass('matched');
        found++;
        score();
        playMatchSound();

        if (found === arrayOfImages.length) {
            playAllFound();
            playAgain();
        }

        setTimeout(() => {
            flippedCards.html('<div class="blank"></div>');
            $('#cardsHolder').css('pointer-events', 'auto');
        }, 1000);
    }

    function handleMismatchedCards(flippedCards) {
        wrongChoice();

        setTimeout(() => {
            flippedCards.removeClass('flipped');
            $('#cardsHolder').css('pointer-events', 'auto');
        }, 1000);
    }

    function score() {
        $('#score').text(`${found} / ${arrayOfImages.length}`)
    }

    function playAgain() {
        arrayOfImages = [];
        arrayOfImageObjects = [];
        selectedCard = undefined;
        lastCard = undefined;
        clickedCards = [];
        found = 0;
        $('#howManyPairs').toggle();
        handleImages();
        score();
    }

    fetchData();
};

//Audio elements

function playMatchSound() {
    let matchSound = $('#matchSound')[0];
    matchSound.play();
}

function playAllFound() {
    let allFound = $('#allFound')[0];
    allFound.play();
}

function gameStart() {
    let gameStart = $('#gameStart')[0];
    gameStart.play();
}

function wrongChoice() {
    let wrongChoice = $('#wrongChoice')[0];
    wrongChoice.play();
}