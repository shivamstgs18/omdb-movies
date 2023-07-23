
let currentPage = 1;
const moviesPerPage = 10;
let defaultCurrentPage=1;
const apiKey = "b89e0202";
const apiUrl = "https://www.omdbapi.com/";

async function fetchMovies(query, page) {
  
  const searchQuery = `*${query}*`;

  const response = await fetch(`${apiUrl}?apikey=${apiKey}&s=${searchQuery}&page=${page}`);
 
  if (!response.ok) {
    throw new Error("Failed to fetch movies from the server.");
  }
  const data = await response.json();
  if (data.Error) {
    throw new Error(data.Error);
  }

  return data;
}

// movie list
function displayMovieList(movies) {
  
  document.getElementById("movieList").innerHTML = "";

  movies.forEach(movie => {
  
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");

   
    const posterImg = document.createElement("img");
    posterImg.src = movie.Poster;
    movieCard.appendChild(posterImg);

    // title
    const titleElem = document.createElement("h3");
    titleElem.textContent = movie.Title;
    movieCard.appendChild(titleElem);


    movieCard.addEventListener("click", () => showMovieDetails(movie.imdbID));

    document.getElementById("movieList").appendChild(movieCard);
  });
}

// pagination
function handlePagination(totalResults) {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageInfo = document.getElementById("pageInfo");

  const totalPages = Math.ceil(totalResults / 15);

  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

// movie details
async function showMovieDetails(movieId) {

  const response = await fetch(`${apiUrl}?apikey=${apiKey}&i=${movieId}`);
  const movieDetails = await response.json();

  const movieDetailsElem = document.getElementById("movieDetails");
  movieDetailsElem.innerHTML = `
    <div class="movie-details-title">
      <h2>Movie Description:</br> ${movieDetails.Title}</h2>
    </div>
    <div class="movie-details-content">
      <p><b>Year:</b> ${movieDetails.Year}</p>
      <p><b>Plot:</b> ${movieDetails.Plot}</p>
      <p><b>Genre:</b> ${movieDetails.Genre}</p>
      <p><b>Director:</b> ${movieDetails.Director}</p>
      <p><b>Actors:</b> ${movieDetails.Actors}</p>
      <p><b>IMDb Rating:</b> ${movieDetails.imdbRating}</p>
      <p><b>Runtime:</b> ${movieDetails.Runtime}</p>
      <p><b>Language:</b> ${movieDetails.Language}</p>
      <p><b>Awards:</b> ${movieDetails.Awards}</p>
      <p><b>Metacritic Score:</b> ${movieDetails.Metascore}</p>
      <p><b>IMDb Votes:</b> ${movieDetails.imdbVotes}</p>
      <p><b>Country:</b> ${movieDetails.Country}</p>
    </div>
  `;

  displayUserRatingsAndComments(movieId);
  movieDetailsElem.scrollIntoView({ behavior: "smooth" });
}

// average rating for a movie
function calculateAverageRating(movieId) {
   
    const savedData = JSON.parse(localStorage.getItem("userRatingsAndComments")) || {};
    const movieData = savedData[movieId] || { ratings: [], comments: [] };
  

    let totalRatings = 0;
    let totalUsers = 0;
    const comments = [];
  
    movieData.ratings.forEach(rating => {
      if (rating > 0) {
        totalRatings += rating;
        totalUsers++;
      }
    });
  
    movieData.comments.forEach(comment => {
      if (comment.trim() !== "") {
        comments.push(comment);
      }
    });
  
    const averageRating = totalUsers > 0 ? (totalRatings / totalUsers).toFixed(1) : 0;
  
    return { averageRating, comments };
  
}

//  display user ratings and comments
function displayUserRatingsAndComments(movieId) {

  const savedData = JSON.parse(localStorage.getItem("userRatingsAndComments")) || {};
  const movieData = savedData[movieId] || { ratings: [], comments: [] };

  
  const { averageRating, comments } = calculateAverageRating(movieId);

  movieData.averageRating = averageRating;
  movieData.comments = comments;

  const userRatingsElem = document.getElementById("userRatings");
  userRatingsElem.innerHTML = `
    <h3>Average User Rating & Comments</h3>
    <div>
      <label for="rating">Rating:</label>
      <input type="number" id="rating" min="1" max="5" value="${movieData.ratings[movieData.ratings.length - 1] || 0}">
    </div>
    <div>
      <label for="comment" placeholder="drop your reviews here...">Comment:</label>
      <textarea id="comment">${movieData.comments[movieData.comments.length - 1] || ""}</textarea>
    </div>
    <div>
      <button onclick="saveRatingAndComment('${movieId}')">Save</button>
      <button onclick="clearFields()">Clear Fields</button>
    </div>
    <p><b>Average Rating:</b> ${movieData.averageRating}</p>
    <p><b>Comments:</b></p>
    <ul>
      ${movieData.comments.map(comment => `<li>${comment}</li>`).join("")}
    </ul>
  `;

  savedData[movieId] = movieData;
  localStorage.setItem("userRatingsAndComments", JSON.stringify(savedData));
}

function clearFields() {
  document.getElementById("rating").value = "";
  document.getElementById("comment").value = "";
}



// save user rating and comment in local storage
function saveRatingAndComment(movieId) {
  const rating = parseInt(document.getElementById("rating").value);
  const comment = document.getElementById("comment").value;

  
  const savedData = JSON.parse(localStorage.getItem("userRatingsAndComments")) || {};

  
  savedData[movieId] = savedData[movieId] || { ratings: [], comments: [] };
  savedData[movieId].ratings.push(rating);
  savedData[movieId].comments.push(comment);


  localStorage.setItem("userRatingsAndComments", JSON.stringify(savedData));


  document.getElementById("rating").value = "";
  document.getElementById("comment").value = "";

  displayUserRatingsAndComments(movieId);
}

//handle movie search
async function searchMovies() {
  try{
    const query = document.getElementById("searchInput").value;
    currentPage = 1; 
  
    const searchData = await fetchMovies(query, currentPage);
    displayMovieList(searchData.Search);
    handlePagination(searchData.totalResults);
  } catch (error) {
    const errorMessage = error.message || "An error occurred while fetching movies.";
    alert(errorMessage);
  }
  
}

//next page
async function nextPage() {
  try{

    currentPage++;
    const query = document.getElementById("searchInput").value;


    if (query) {
      const searchData = await fetchMovies(query, currentPage);
      displayMovieList(searchData.Search);
      handlePagination(searchData.totalResults);
    } else {
      defaultCurrentPage++; 
      await loadDefaultMovies(); 
    }
  }
  catch (error) {
    const errorMessage = error.message || "An error occurred while fetching movies.";
    alert(errorMessage);
  }
  
}

// previous page
async function prevPage() {

  try{
    if (currentPage > 1) {
      currentPage--;
      const query = document.getElementById("searchInput").value;
  
      if (query) {
        const searchData = await fetchMovies(query, currentPage);
        displayMovieList(searchData.Search);
        handlePagination(searchData.totalResults);
      }
    } else if (defaultCurrentPage > 1) { 
      defaultCurrentPage--; 
      await loadDefaultMovies(); 
    }
  }
  catch (error) {
    const errorMessage = error.message || "An error occurred while fetching movies.";
    alert(errorMessage);
  }
}

async function loadDefaultMovies() {
  const defaultQuery = "star wars"; 

  const defaultData = await fetchMovies(defaultQuery, defaultCurrentPage);
  displayMovieList(defaultData.Search);
  handlePagination(defaultData.totalResults);
}

// page load
document.addEventListener("DOMContentLoaded", async () => {

  const urlParams = new URLSearchParams(window.location.search);
  const defaultQuery = urlParams.get("q");

  if (defaultQuery) {
    const defaultData = await fetchMovies(defaultQuery, currentPage);
    displayMovieList(defaultData.Search);
    handlePagination(defaultData.totalResults);
  } else {
  
    await loadDefaultMovies();
  }

  const searchBtn = document.getElementById("searchBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  searchBtn.addEventListener("click", searchMovies);
  prevBtn.addEventListener("click", prevPage);
  nextBtn.addEventListener("click", nextPage);
});
