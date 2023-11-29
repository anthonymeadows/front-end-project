$(document).ready(function () {
    $('button').click(fetchData);
});

let arrayOfImages = [];

async function fetchData() {
    const pairRequest = parseInt($('input').val(), 10);
    let count = 0;

    $('#howManyPairs').remove();
    alert(`FETCHING IMAGES, PLEASE WAIT`);

    if (!isNaN(pairRequest) && pairRequest > 0) {
        try {
            const fetchData = async () => {
                return new Promise((resolve, reject) => {
                    $.get('https://random.imagecdn.app/v1/image?width=150&height=250', (data) => {
                        resolve(data);
                    }).fail((error) => {
                        reject(error);
                    });
                });
            };

            for (let i = 0; i < pairRequest; i++) {
                try {
                    const data = await fetchData();
                    arrayOfImages.push(data);
                    count++;
                    console.log(`Image ${count} fetched`);
                } catch (error) {
                    console.error(error);
                }
            }

            console.log(arrayOfImages);
            console.log(pairRequest);
        } catch (error) {
            console.error(error);
        }
    }

    handleImages();
}

function shuffleAndDouble() {
    // Duplicate each element in the array
    const duplicatedArray = arrayOfImages.concat(arrayOfImages);

    // Fisher-Yates algorithm for shuffling
    for (let i = duplicatedArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [duplicatedArray[i], duplicatedArray[j]] = [duplicatedArray[j], duplicatedArray[i]];
    }

    return duplicatedArray; 
}

function handleImages() {
    let cardsArray = shuffleAndDouble();

    $('#cardsHolder').empty();

    for (let i = 0; i < cardsArray.length; i++) {
        let imageUrl = cardsArray[i];
        let div = $('<div>').addClass('card');
        $('<img>').attr('src', imageUrl).appendTo(div);
        div.appendTo($('#cardsHolder'));
    }

    $('#cardsHolder').css({
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
    });
}