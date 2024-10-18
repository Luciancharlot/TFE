CREATE TABLE Breweries (
    brewery_id INT IDENTITY(1,1) PRIMARY KEY,
    brewery_name VARCHAR(255)
);

-- Table des types de bières
CREATE TABLE Beer_Types (
    type_id INT IDENTITY(1,1) PRIMARY KEY,
    type_name VARCHAR(255),
    type_description TEXT,
    type_name_en VARCHAR(255),
    type_name_nl VARCHAR(255)
);

-- Table des bières
CREATE TABLE Beers (
    beer_id INT IDENTITY(1,1) PRIMARY KEY,
    beer_name VARCHAR(255),
    abv DECIMAL(5, 2),
    brewery_id INT, -- Référence à la table Breweries
    type_id INT, -- Référence à la table Beer_Types
    image VARCHAR(255),
    beer_description TEXT,
    beer_price DECIMAL(10, 2), -- Champ ajouté
    FOREIGN KEY (brewery_id) REFERENCES Breweries(brewery_id),
    FOREIGN KEY (type_id) REFERENCES Beer_Types(type_id)
);

-- Table des utilisateurs
CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255),
    birth_date DATE,
    gender VARCHAR(50),
    created TIMESTAMP
);

-- Table des commandes
CREATE TABLE Orders (
    order_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT, -- Référence à la table Users
    total_amount DECIMAL(10, 2),
    status VARCHAR(50), -- ouvert ou fermé
    created DATETIME,
    closed DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Table des items commandés
CREATE TABLE OrderItems (
    order_item_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT, -- Référence à la table Orders
    beer_id INT, -- Référence à la table Beers
    quantity INT,
    price DECIMAL(10, 2), -- (beer_price * quantity)
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (beer_id) REFERENCES Beers(beer_id)
);

-- Table des évaluations
CREATE TABLE Ratings (
    rating_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT, -- Référence à la table Users
    beer_id INT, -- Référence à la table Beers
    rating INT CHECK (rating >= 1 AND rating <= 10), -- Évaluation de 1 à 10
    rating_justification VARCHAR(255),
    rating_description TEXT,
    created TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (beer_id) REFERENCES Beers(beer_id)
);

-- Table des préférences
CREATE TABLE Preferences (
    preference_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT, -- Référence à la table Users
    preference_type INT, -- Référence à la table Beer_Types
    bitterness INT,
    sweetness INT,
    fruitness INT,
    alcohol_content INT,
    preference_beer INT, -- Référence à la table Beers
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (preference_type) REFERENCES Beer_Types(type_id),
    FOREIGN KEY (preference_beer) REFERENCES Beers(beer_id)
);
