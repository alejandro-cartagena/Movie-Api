
// API Key: 902a2b31

const searchButton = document.getElementById("search-btn")
const searchField = document.getElementById("search")
const notSearchedDisplay = document.getElementById("not-searched")
const moviesContainer = document.getElementById("movies-container")
const dataNotFoundEl = document.getElementById("data-not-found")

const emptyWatchListDisplay = document.getElementById("empty-watch-list")
const watchListMoviesContainer = document.getElementById("watch-list-movies-container")

const localStorageKey = "movies"

if (searchButton) {
    searchButton.addEventListener("click", searchMovie)
}

let watchListArray = getWatchListFromLocalStorage();  // Load watch list data from local storage
renderWatchList(watchListArray)  // Renders the watchlist to the watchlist page

if (watchListMoviesContainer) {
    watchListMoviesContainer.addEventListener("click", function(e) {
        const target = e.target
        // Removes watchlist when minus icon is clicked
        if (target.classList.contains("movie-minus-icon") || target.classList.contains("fa-circle-minus") || 
        target.classList.contains("movie-watchlist-text")) {
            const movieId = target.dataset.movieId
            watchListArray = watchListArray.filter(function(movie) {
                return movie.imdbID !== movieId
            })
    
            addWatchListToLocalStorage(watchListArray)
            renderWatchList(watchListArray)
        }
    })
}

/*
//////////////////////////////////////
       * The functions are in order
       * by when they are called
//////////////////////////////////////
*/

/*
********************************************

    Functions that stem from:
    
        searchMovie()

********************************************
*/

async function searchMovie(e) {
    e.preventDefault()  // Prevents the form from submitting
    moviesContainer.classList.remove("hidden")
    notSearchedDisplay.style.display = "none"  // Hides the movie reel icon in the middle of the page
    dataNotFoundEl.classList.add("hidden")  // Hides the data not found text 
    document.getElementById("not-searched-container").classList.remove("not-searched-container")    

    const searchValue = searchField.value
    searchField.value = ""  // Clears the input field 

    try {
        const res = await fetch(`https://www.omdbapi.com/?apikey=902a2b31&s=${searchValue}&plot=short`); // Replace http with https
        const data = await res.json(); // Data from the API request

        let moviesArray = data.Search  // Array of movies with basic data

        // Remove movies with no Poster:
        moviesArray = moviesArray.filter(function(movie) {
            return movie.Poster != "N/A"
        })

        const moviesDataArray = await getMovieData(moviesArray)  // Array of movies with the data we need

        renderMoviesToScreen(moviesDataArray)  // Movies are successfully rendered to screen

        const plusIconsArray = document.querySelectorAll(".movie-plus-icon")

        // Disables the plus icons that are already in the watchlist
        renderDisabledPlusIcons(plusIconsArray)
        // Adds the clicked movies to the watchlist
        addToWatchList(plusIconsArray)

    }
    catch {
        clearMovies()
        dataNotFoundEl.classList.remove("hidden")  
    }
    

}

async function getMovieData(movies) {
    const moviePromises = movies.map(async (movie) => {
        const res = await fetch(`https://www.omdbapi.com/?apikey=902a2b31&i=${movie.imdbID}&type=movie&plot=short`);
        return res.json();
    });

    const movieData = await Promise.all(moviePromises);
    return movieData
}

function renderMoviesToScreen(moviesData) {
    const moviesHtml = moviesData.map(function(movie) {
        return `
        <div class="movie-block">

            <div class="movie-poster-container">
                <img class="movie-poster" src="${movie.Poster}">
            </div>

            <div class="movie-data">
                <div class="movie-title-rating">
                    <h2 class="movie-title">${movie.Title}</h2>
                    <i class="fa-solid fa-star"></i>
                    <p class="movie-rating">${movie.imdbRating}</p>
                </div>

                <div class="movie-time-genre-watchlist">
                    <p class="movie-run-time">${movie.Runtime}</p>
                    <p class="movie-genre">${movie.Genre}</p>
                    <div data-movie-id="${movie.imdbID}" class="movie-plus-icon">
                        <i data-movie-id="${movie.imdbID}" class="fa-solid fa-circle-plus"></i>
                        <p data-movie-id="${movie.imdbID}" class="movie-watchlist-text">Watchlist</p>
                    </div>
                </div>

                <p class="movie-plot">${movie.Plot}</p>
                
            </div>
            
        </div>
        <hr class="movie-line-break">
        
        `
    }).join("")

    moviesContainer.innerHTML = moviesHtml

}

function renderDisabledPlusIcons(plusIconsArray) {
    if (watchListArray.length > 0) {
        plusIconsArray.forEach(function(icon) {
            watchListArray.forEach(function(movie) {
                if (icon.dataset.movieId === movie.imdbID) {
                    icon.classList.add("disabled-icon")
                    icon.innerHTML = `<p>Added</p>`
                }
            })

        })
    }
}

function addToWatchList(plusIconsArray) {
    plusIconsArray.forEach(function(icon) {
        icon.addEventListener("click", async() => {
            const movie = await getSingleMovieData(icon.dataset.movieId)
            if (!isMovieInWatchlist(movie, watchListArray)) {
                watchListArray.push(movie)
                addWatchListToLocalStorage(watchListArray)
                icon.classList.add("disabled-icon")
                icon.innerHTML = `<p>Added</p>`
            }
            
        })
    })
}

async function getSingleMovieData(movieId) {
    const res = await fetch(`https://www.omdbapi.com/?apikey=902a2b31&i=${movieId}&type=movie&plot=short`)
    const data = await res.json()
    return data
}

function isMovieInWatchlist(movie, watchList) {
    return watchList.some((watchedMovie) => {
        return watchedMovie.imdbID === movie.imdbID
    })
}

function addWatchListToLocalStorage(watchList) {
    let stringifiedWatchList = JSON.stringify(watchList)
    localStorage.setItem(localStorageKey, stringifiedWatchList)
}

function clearMovies() {
    moviesContainer.innerHTML = ""
}

/*
*****************************************************

    End of Functions that stem from:

         searchMovie()
    
*****************************************************
*/



/*
********************************************

    Functions that stem from:

        getWatchListFromLocalStorage(); 
        renderWatchList() 


********************************************
*/

function getWatchListFromLocalStorage() {
    const stringifiedWatchList = localStorage.getItem(localStorageKey);
    if (stringifiedWatchList) {
        return JSON.parse(stringifiedWatchList)
    }
    else {
        return []  // Returns empty array if no data yet
    }
}

function renderWatchList(watchListArray) {
    if (watchListArray.length != 0) {
        if (watchListMoviesContainer) {
            watchListMoviesContainer.classList.remove("hidden")
            emptyWatchListDisplay.classList.add("hidden")
            renderWatchListMoviesToScreen(watchListArray)
        }
    }
    else {
        if (emptyWatchListDisplay) {
            emptyWatchListDisplay.classList.remove("hidden")
            watchListMoviesContainer.classList.add("hidden")
        }  
    }
}

function renderWatchListMoviesToScreen(moviesData) {
    const moviesHtml = moviesData.map(function(movie) {
        return `
        <div class="movie-block">

            <div class="movie-poster-container">
                <img class="movie-poster" src="${movie.Poster}">
            </div>

            <div class="movie-data">
                <div class="movie-title-rating">
                    <h2 class="movie-title">${movie.Title}</h2>
                    <i class="fa-solid fa-star"></i>
                    <p class="movie-rating">${movie.imdbRating}</p>
                </div>

                <div class="movie-time-genre-watchlist">
                    <p class="movie-run-time">${movie.Runtime}</p>
                    <p class="movie-genre">${movie.Genre}</p>
                    <div data-movie-id="${movie.imdbID}" class="movie-minus-icon">
                        <i data-movie-id="${movie.imdbID}" class="fa-solid fa-circle-minus"></i>
                        <p data-movie-id="${movie.imdbID}" class="movie-watchlist-text">Remove</p>
                    </div>
                </div>

                <p class="movie-plot">${movie.Plot}</p>
                
            </div>
            
        </div>
        <hr class="movie-line-break">
        
        `
    }).join("")

    watchListMoviesContainer.innerHTML = moviesHtml

}













