"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $genresArea = $("#genresArea");
const $genresList = $("#genresList");
const $searchForm = $("#searchForm");

let genresAreaOpen = false;
let episodesAreaOpen = false;



// This function takes a query parameter and fetches data from the TVMaze API
// It then maps the data to an object with id, name, summary and image properties
// If there is an error, it logs the error to the console and returns an empty array.

async function searchShows(query) {
  try {
    const response = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
    const data = await response.json();
    const formattedData = data.map((result) => ({
      id: result.show.id,
      name: result.show.name,
      summary: result.show.summary,
      image: result.show.image ? result.show.image.medium : "https://static.tvmaze.com/images/no-img/no-img-portrait-text.png",
    }));
    return formattedData;
  } catch (error) {
    console.error(error);
    return [];
  }
}



// Populates the list of TV shows on the page with the given array of show objects. 
// For each show, creates a new div element with a thumbnail image, title, summary, and buttons to get episodes and genres. 
// Appends each show div to the $showsList element.

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $('<div>').attr('data-show-id', show.id).addClass('Show col-md-12 col-lg-6 mb-4');
    const $media = $('<div>').addClass('media').appendTo($show);
    const $img = $('<img>').attr('src', show.image).attr('alt', show.name).addClass('w-25 me-3').appendTo($media);
    const $mediaBody = $('<div>').addClass('media-body').appendTo($media);
    $('<h5>').addClass('text-primary').text(show.name).appendTo($mediaBody);
    $('<div>').html(show.summary).appendTo($mediaBody);
    $('<button>').addClass('btn btn-outline-light btn-sm Show-getEpisodes').text('Episodes').appendTo($mediaBody);
    $('<button>').addClass('btn btn-outline-light btn-sm Show-getGenres').text('Genres').appendTo($mediaBody);
    $showsList.append($show);
  }
}

// Performs search using the searchShows function, hides the episodesArea & genresArea (until button is clicked) and populates the page with the search results.
async function handleSearch(evt) {
  evt.preventDefault();
  const term = $("#searchForm-term").val();
  const shows = await searchShows(term);
  $episodesArea.hide();
  $genresArea.hide();
  populateShows(shows);
}

// Attaches an event listener to the search form's submit event, which triggers the handleSearch function.
$searchForm.on("submit", handleSearch);


// Gets list of episodes for a given show ID. If there is an error, it will log to the console and return an empty array.
async function getEpisodesOfShow(id) {
  try {
    const response = await fetch(`https://api.tvmaze.com/shows/${id}/episodes`);
    const data = await response.json();
    const formattedData = data.map((episode) => ({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    }));
    return formattedData;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Populates the HTML of the episodes area with the provided list of episodes.
const populateEpisodes = (episodes) => {
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $('<li>').text(`${episode.name} (season ${episode.season}, episode ${episode.number})`);
    $episodesList.append($episode);
  }

  $episodesArea.show();
}

// Gets the ID of the show that the user clicked on, and then displays the list of episodes for that show. 
// If the episodes area is already open, it will hide it instead. 
const getEpisodesAndDisplay = async (evt) => {
  const showId = $(evt.target).closest(".Show").data("show-id");
  if (episodesAreaOpen) {
    $episodesArea.hide();
    episodesAreaOpen = false;
    return;
  }
  episodesAreaOpen = true;
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
};

// Listens for clicks on the "Episodes" button within each show; when clicked, it calls the getEpisodesAndDisplay function.
$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);

// Retrieves the genres of a TV show from the TVMaze API and returns them in an array. 
// If there's an error, an empty array is returned.
async function getGenresOfShow(id) {
  try {
    const response = await fetch(`https://api.tvmaze.com/shows/${id}`);
    const data = await response.json();
    const formattedData = data.genres;
    return formattedData;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Takes array of genres and populates the genres list on the page with them.
const populateGenres = (genres) => {
  $genresList.empty();

  for (let genre of genres) {
    const $genre = $('<li>').text(genre);
    $genresList.append($genre);
  }

  $genresArea.show();
}

// Called when the "Genres" button for a show is clicked. It retrieves the genres for that show and populates the genres list on the page with them.
const getGenresAndDisplay = async (evt) => {
  const showId = $(evt.target).closest(".Show").data("show-id");
  if (genresAreaOpen) {
    $genresArea.hide();
    genresAreaOpen = false;
    return;
  }
  genresAreaOpen = true;
  const genres = await getGenresOfShow(showId);
  populateGenres(genres);
};

// Attaches an event listener to the "Genres" button for each show on the page; when the button is clicked, it calls the getGenresAndDisplay function.
$showsList.on("click", ".Show-getGenres", getGenresAndDisplay);
