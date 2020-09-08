console.log('Ready to find scores!'); 
chrome.runtime.onMessage.addListener(scoreFinder);

// Main function for handeling all title cards
async function scoreFinder(){
    var titleCards = document.querySelectorAll(".slider-item-0,.slider-item-1,.slider-item-2,.slider-item-3,.slider-item-4,.slider-item-5,.slider-item-6,.slider-item-7")
    for(var i = 0; i <= titleCards.length; i++){
        var slider = titleCards[i]
        // Catch Netlix loading error
        try{
            var movieTitle = slider.getElementsByClassName("fallback-text")[0].innerText;
            var movieTitleFormatted = formatTitle(movieTitle);
            let fetchedData = await fetchRequest(movieTitleFormatted);
            // Catch 'Movie not on database' error
            try{
                let imdbScore = imdbFormating(fetchedData.Ratings[0].Value);
                let rtScore = rtFormating(fetchedData.Ratings[1].Value);
                buildDiv(slider, imdbScore, rtScore);
            } 
            catch(err){
                let imdbScore = "N/A"
                let rtScore = "N/A"
                buildDiv(slider, imdbScore, rtScore);
            }
        }
        catch(err){
            continue;
        }
    }
}
pageChecker();


// Check for clicks on sliding elements
function pageChecker(){
    document.addEventListener('click', function(){
        console.log('Click Detected')
        scoreFinder();
    });
    document.addEventListener('scroll', function(){
        console.log('Scroll Detected')
        scoreFinder();
    });
}


// Check for repeated title cards and omit ones with a progress bar
function parentNodeChecker(uncheckedNode){
    if(uncheckedNode.querySelector(".progress-bar") != null || uncheckedNode.querySelector("#score-presentation") != null){
        // Has progress bar or already has score presentation div
        return false;
    } else {
        // Has neither
        return true;
    }
}


// Add a child element to all title cards
function buildDiv(parentNodeUnchecked, score1, score2){
    if (parentNodeChecker(parentNodeUnchecked) == true){
        var div = parent.document.createElement("div");
        div.id = "score-presentation"
        parentNodeUnchecked.appendChild(div);
        div.style.marginTop = "3px"
        div.innerText = score1 + " on IMDb" + "  |  " + score2 + " on Rotten Tomatoes";
    }
}


// Fetch movie data from OMDb API
async function fetchRequest(movie){
    try {
        let response = await fetch('https://www.omdbapi.com/?apikey=thewdb&t=' + movie);
        let data = await response.json();
        return data;
    }
    catch(err) {
        // Create 'empty' data object
        let data = {
            Ratings: [
                {Value: "N/A"},
                {Value: "N/A"}
            ]
        };
        return data;
    }
}


// Format the movie title to be read by OMDb API
function formatTitle(title) {
    // Lowercase and no spaces
    var titleLower = title.toLowerCase();
    var titleFormatted = titleLower.replace(/ /g, "+"); 
    return titleFormatted;
}


// IMDB Score Formatting
function imdbFormating(score){
    // Some scores have unnessesary '/10'
    if (score != "N/A"){
        return score.slice(0, -3);
    } else {
        return score;
    }
} 


// Rotten Tomates Score Formatting
function rtFormating(score){
    // Some scores have unnessesary '/100' and no '%' sign
    if (score != "N/A"){
        if (score.length === 3){
            return score
        } else {
            return score.slice(0, -4) + "%";
        }
    } else {
        return score;
    }
}