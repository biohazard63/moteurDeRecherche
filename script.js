var searchInput = document.querySelector('input[name="search"]');
var resultsDiv = document.getElementById('results');

console.log('searchInput:', searchInput);
console.log('resultsDiv:', resultsDiv);

function levenshtein(a, b) {
    var t = [], u, i, j, m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    for (j = 0; j <= n; j++) t[j] = j;
    for (i = 1; i <= m; i++) {
        for (u = [i], j = 1; j <= n; j++) {
            u[j] = a[i - 1] === b[j - 1] ? t[j - 1] : Math.min(t[j - 1], t[j], u[j - 1]) + 1;
        }
        t = u;
    }
    return t[n];
}

// Définissons un seuil permissif pour les résultats de la recherche
var seuilPermissif = 20; // Ce seuil est un exemple, ajustez-le selon vos besoins

searchInput.addEventListener('input', function() {
    var searchValue = searchInput.value.toLowerCase();
    console.log("Input event triggered. Search value:", searchValue);

    if (searchValue.length > 2) {
        console.log(`Fetching data for: ${searchValue}`);
        fetch(`http://www.omdbapi.com/?s=${encodeURIComponent(searchValue)}&apikey=7457cf2c`)
            .then(response => {
                console.log("Response received from fetch");
                return response.json();
            })
            .then(data => {
                console.log("Data parsed to JSON:", data);
                if (!data.Search) {
                    console.log("No search results found.");
                    resultsDiv.innerHTML = '<p>No results found.</p>';
                    return;
                }
                var output = '';
                data.Search.forEach(movie => {
                    var movieTitle = movie.Title.toLowerCase();
                    var distance = levenshtein(movieTitle, searchValue);
                    console.log(`Levenshtein distance for "${movie.Title}" (${movieTitle}):`, distance);
                    if (distance <= seuilPermissif) {
                        output += '<h2>' + movie.Title + '</h2>';
                        output += '<img src="' + movie.Poster + '" alt="Poster" style="max-height: 200px;">';
                    }
                });
                resultsDiv.innerHTML = output;
                if (output === '') {
                    console.log("No matches found within the distance threshold.");
                    resultsDiv.innerHTML = '<p>No matches found.</p>';
                }
            })
            .catch(error => {
                console.error('Error during fetch operation:', error);
                resultsDiv.innerHTML = '<p>An error occurred.</p>';
            });
    } else {
        console.log("Search value is too short. Clearing results.");
        resultsDiv.innerHTML = '';
    }
});
