$(document).ready(function () {
    $('button').click(fetchData);
});

let arrayOfImages = [];
let arrayOfImageObjects = [];
let selectedCard;
let lastCard;
let clickedCards = [];
let found = 0;

async function fetchData() {
    const pairRequest = parseInt($('input').val(), 10);
    let count = 0;

    $('#howManyPairs').remove();

    if (!isNaN(pairRequest) && pairRequest > 0) {
        try {
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
        backgroundColor: 'slateblue',
        display: 'flex',
        flexWrap: 'wrap',
        paddingBottom: '10px',
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

    // Clear the existing content in the #cardsHolder
    $('#cardsHolder').empty();
    for (let i = 0; i < arrayOfImageObjects.length; i++) {
        let imageUrl = arrayOfImageObjects[i]['url'];
        let pairNum = arrayOfImageObjects[i]['card'];

        //Styling
        let div = $('<div>').addClass('card').css({
            margin: '10px',
            width: '14.2857%',
        });

        let image = $('<img>');

        //Styling and apply imageUrl
        image.attr('src', imageUrl).css({
            border: '5px solid black',
            borderRadius: '10px',
            width: '100%',
            height: '100%',
        }).appendTo(div);

        image.attr('data', pairNum);

        // Append the div to the #cardsHolder
        div.appendTo($('#cardsHolder'));
    }
    eventHandlers();
}

function eventHandlers() {
    let allCards = $('.card');
    let isFirstClick = true;

    allCards.each(function () {
        $(this).click(() => {
            let clickedCard = $(this).find('img');
            let clickedCardData = parseInt(clickedCard.attr('data'), 10);

            if (isFirstClick) {
                lastCard = clickedCardData;
            } else {
                selectedCard = clickedCardData;

                if (lastCard === selectedCard) {
                    found++
                    clickedCards.push(lastCard, selectedCard);

                    // Remove the matched cards
                    $('.card').each(function () {
                        let cardData = parseInt($(this).find('img').attr('data'), 10);
                        if (clickedCards.includes(cardData)) {
                            $(this).remove();
                        }
                    });

                    // Clear the clicked cards array
                    clickedCards = [];

                    // Update the score
                    score()
                }
            }

            isFirstClick = !isFirstClick;

            if (!isFirstClick && lastCard === selectedCard) {
                lastCard = null;
            }
        });
    });
}

function score() {
    let scoreDiv = $('#score');

    if (scoreDiv.length === 0) {
        // If score does not exist, create a new div
        scoreDiv = $('<div>').attr('id', 'score').appendTo($('#header'));
    }

    // Update score
    scoreDiv.text(`${found} / ${arrayOfImages.length}`);
}