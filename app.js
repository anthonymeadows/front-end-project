$(document).ready(function () {;
    $('button').click(fetchData);
});

let arrayOfImages = [];
let arrayOfImageObjects = [];
let selectedCard;
let lastCard;
let clickedCards = [];
let found = 0;

async function fetchData() {
    gameStart()
    const pairRequest = parseInt($('input').val(), 10);

    // Clear the previous game elements
    $('#howManyPairs').remove();

    if (!isNaN(pairRequest) && pairRequest > 0) {
        try {
            // Fetch unique images
            while (arrayOfImages.length < pairRequest) {
                const data = await fetchSingleImage();

                // Check for duplicates in arrayOfImages
                if (!arrayOfImages.includes(data)) {
                    arrayOfImages.push(data);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Start or restart the game
    handleImages();
}

async function fetchSingleImage() {
    return new Promise((resolve, reject) => {
        $.get('https://random.imagecdn.app/v1/image?width=120&height=120', (data) => {
            resolve(data);
        }).fail((error) => {
            reject(error);
        });
    });
}

function assignCardNum() {
    for (let i = 0; i < arrayOfImages.length; i++) {
        let obj = {};
        obj['card'] = i;
        obj['url'] = arrayOfImages[i];
        arrayOfImageObjects.push(obj);
    }
}

function shuffleAndDouble() {
    assignCardNum();
    // Duplicate each element in the array
    arrayOfImageObjects = arrayOfImageObjects.concat(arrayOfImageObjects);
    // Fisher-Yates algorithm for shuffling
    for (let i = arrayOfImageObjects.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayOfImageObjects[i], arrayOfImageObjects[j]] = [arrayOfImageObjects[j], arrayOfImageObjects[i]];
    }
}

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
        width: '90vw', // Corrected the typo in '90dvw' to '90vw'
        gap: '1rem',
        zIndex: '0',
    });
}

function handleImages() {
    shuffleAndDouble();
    cardHolder();

    // Clear the existing content in the #cardsHolder
    $('#cardsHolder').empty();
    for (let i = 0; i < arrayOfImageObjects.length; i++) {
        let imageUrl = arrayOfImageObjects[i]['url'];
        let pairNum = arrayOfImageObjects[i]['card'];

        // Create a card container
        let div = $('<div>').addClass('card').attr('data-pair', pairNum);

        // Create elements for front and back of the card
        let front = $('<img>').addClass('front').attr('src', 'frontCard.png').appendTo(div);
        let back = $('<img>').addClass('back').attr('src', imageUrl).appendTo(div);

        // Keep track of the card state and the currently displayed image
        div.click(function () {
            $(this).toggleClass('flipped');
            eventHandlers(pairNum);
        });

        // Append the div to the #cardsHolder
        div.appendTo($('#cardsHolder'));
    }
    eventHandlers();
}

function eventHandlers(pairNum) {
    let flippedCards = $('.flipped:not(.matched)');

    if (flippedCards.length === 2) {
        // Disable further clicks during the comparison
        $('#cardsHolder').css('pointer-events', 'none');

        let card1 = $(flippedCards[0]);
        let card2 = $(flippedCards[1]);

        if (card1.attr('data-pair') === card2.attr('data-pair')) {
            // Matched
            flippedCards.addClass('matched');
            found++;

            // Play match sound
            playMatchSound();

            // Check if all pairs are found
            if (found === arrayOfImages.length) {
                // All pairs found, handle game end
                playAllFound()();
            }

            // Replace the content with a blank div
            setTimeout(() => {
                flippedCards.html('<div class="blank"></div>');
                // Enable further clicks after replacing content
                $('#cardsHolder').css('pointer-events', 'auto');
            }, 1000);
        } else {
            wrongChoice()
            // Not matched, flip back after a delay
            setTimeout(() => {
                flippedCards.removeClass('flipped');
                // Enable further clicks after flipping back
                $('#cardsHolder').css('pointer-events', 'auto');
            }, 1000);
        }
    }
}

function playMatchSound() {
    // Get the audio element
    let matchSound = document.getElementById('matchSound');

    // Play the audio
    matchSound.play();
}

function playAllFound() {
    let allFound = document.getElementById('allFound')
    allFound.play();
}

function gameStart() {
    let gameStart = document.getElementById('gameStart')
    gameStart.play();
}

function wrongChoice() {
    let wrongChoice = document.getElementById('wrongChoice')
    wrongChoice.play();
}