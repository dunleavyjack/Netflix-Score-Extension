console.log('Score Dog is ready to go. Woof!');
chrome.runtime.onMessage.addListener(scoreFinder);

// Main function for handeling all title cards on Netflix homepage
const scoreFinder = async () => {
    let atNetflix = true;
    while (atNetflix) {
        // Gather all title cards on screen
        let totalTitleCards = document.querySelectorAll(
            '.slider-item-0,.slider-item-1,.slider-item-2,.slider-item-3,.slider-item-4,.slider-item-5,.slider-item-6,.slider-item-7'
        );

        // Loop through viewable title cards to add scores
        for (var i = 0; i <= totalTitleCards.length; i++) {
            for (let j = 0; j <= i; j++) {
                let presentTitleCards = document.querySelectorAll(
                    '.slider-item-0,.slider-item-1,.slider-item-2,.slider-item-3,.slider-item-4,.slider-item-5,.slider-item-6,.slider-item-7'
                );
                let slider = presentTitleCards[j];

                // Find movie title
                try {
                    let movieTitle =
                        slider.getElementsByClassName('fallback-text')[0]
                            .innerText;

                    // Format title for API request
                    let movieTitleFormatted = formatTitle(movieTitle);

                    // Send API request for movie review data
                    if (parentNodeChecker(slider) == true) {
                        let fetchedData = await fetchRequest(
                            movieTitleFormatted
                        );

                        // If movie in database, find scores
                        try {
                            let imdbScore = imdbFormating(
                                fetchedData.Ratings[0].Value
                            );
                            let rtScore = rtFormating(
                                fetchedData.Ratings[1].Value
                            );
                            buildDiv(slider, imdbScore, rtScore);

                            // If not in database, return 'N/A'
                        } catch (err) {
                            let imdbScore = 'N/A';
                            let rtScore = 'N/A';
                            buildDiv(slider, imdbScore, rtScore);
                        }
                    }
                } catch (err) {
                    continue;
                }
            }
        }
    }
};

// Check for repeated title cards and omit ones with a progress bar
const parentNodeChecker = (uncheckedNode) => {
    if (
        uncheckedNode.querySelector('.progress-bar') != null ||
        uncheckedNode.querySelector('#score-presentation') != null
    ) {
        // Has progress bar or already has score presentation div
        return false;
    } else {
        // Has neither
        return true;
    }
};

// Add a child element to all title cards
const buildDiv = (parentNodeUnchecked, score1, score2) => {
    if (parentNodeChecker(parentNodeUnchecked) == true) {
        const imdbLogo = chrome.extension.getURL('images/imdb_logo_color.png');
        const rtLogo = chrome.extension.getURL('images/rt_logo_color.png');
        const div = parent.document.createElement('div');
        div.id = 'score-presentation';

        // Build div to add under each movie
        div.innerHTML = `
            <img src=${imdbLogo} id="logos"><span id="score-area">${score1}</span><img src=${rtLogo} id="logos"><span id="score-area">${score2}</span>
        `;

        // Add div under each movie
        parentNodeUnchecked.appendChild(div);
    }
};

// Fetch movie data from OMDb API
const fetchRequest = async (movie) => {
    try {
        let response = await fetch(
            'https://www.omdbapi.com/?apikey=thewdb&t=' + movie
        );
        let data = await response.json();
        return data;
    } catch (err) {
        // Create 'empty' data object
        let data = {
            Ratings: [{ Value: 'N/A' }, { Value: 'N/A' }],
        };
        return data;
    }
};

// Format the movie title to be read by OMDb API
const formatTitle = (title) => {
    // Lowercase and no spaces
    var titleLower = title.toLowerCase();
    var titleFormatted = titleLower.replace(/ /g, '+');
    return titleFormatted;
};

// IMDB Score Formatting
const imdbFormating = (score) => {
    // Some scores have unnessesary '/10'
    if (score != 'N/A') {
        return score.slice(0, -3);
    } else {
        return score;
    }
};

// Rotten Tomates Score Formatting
const rtFormating = (score) => {
    // Some scores have unnessesary '/100' and no '%' sign
    if (score != 'N/A') {
        if (score.length === 3) {
            return score;
        } else {
            return score.slice(0, -4) + '%';
        }
    } else {
        return score;
    }
};
