// Fonction pour récupérer tous les types de bière et les afficher dans le menu déroulant
function fetchAllBeerTypes() {
    fetch(`/search_beer_types`)
        .then(response => response.json())
        .then(data => {
            const datalist = document.getElementById('beer_type_results');
            datalist.innerHTML = ''; // Efface les anciennes options

            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.type_name; // Ce que l'utilisateur verra
                option.setAttribute('data-id', item.type_id); // Stocke l'ID comme attribut
                datalist.appendChild(option);
            });
        });
}

// Fonction pour récupérer toutes les bières et les afficher dans le menu déroulant
function fetchAllBeers() {
    fetch(`/search_beers`)
        .then(response => response.json())
        .then(data => {
            const datalist = document.getElementById('beer_results');
            datalist.innerHTML = ''; // Efface les anciennes options

            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.beer_name; // Ce que l'utilisateur verra
                option.setAttribute('data-id', item.beer_id); // Stocke l'ID comme attribut
                datalist.appendChild(option);
            });
        });
}

// Fonction pour rechercher dynamiquement les types de bière
function searchBeerTypes() {
    const query = document.getElementById('preference_type').value;
    if (query.length > 0) {
        fetch(`/search_beer_types?q=${query}`)
            .then(response => response.json())
            .then(data => {
                const datalist = document.getElementById('beer_type_results');
                datalist.innerHTML = ''; // Efface les anciennes options

                data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.type_name; // Ce que l'utilisateur verra
                    option.setAttribute('data-id', item.type_id); // Stocke l'ID comme attribut
                    datalist.appendChild(option);
                });
            });
    }
}

// Fonction pour rechercher dynamiquement les bières
function searchBeers() {
    const query = document.getElementById('preference_beer').value;
    if (query.length > 0) {
        fetch(`/search_beers?q=${query}`)
            .then(response => response.json())
            .then(data => {
                const datalist = document.getElementById('beer_results');
                datalist.innerHTML = ''; // Efface les anciennes options

                data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.beer_name; // Ce que l'utilisateur verra
                    option.setAttribute('data-id', item.beer_id); // Stocke l'ID comme attribut
                    datalist.appendChild(option);
                });
            });
    }
}
