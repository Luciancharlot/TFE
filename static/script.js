// Fonction pour rechercher les types de bière
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

// Fonction pour définir l'ID du type de bière
function setBeerTypeId() {
    const input = document.getElementById('preference_type');
    const datalist = document.getElementById('beer_type_results').children;
    for (let option of datalist) {
        if (option.value === input.value) {
            document.getElementById('preference_type_id').value = option.getAttribute('data-id');
            break;
        }
    }
}

// Fonction pour rechercher les bières
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

// Fonction pour définir l'ID de la bière
function setBeerId() {
    const input = document.getElementById('preference_beer');
    const datalist = document.getElementById('beer_results').children;
    for (let option of datalist) {
        if (option.value === input.value) {
            document.getElementById('preference_beer_id').value = option.getAttribute('data-id');
            break;
        }
    }
}
