--fonction pour remettre l’autoincrementation à 0
DBCC CHECKIDENT ('beer_types', RESEED, 0);

-- Désactiver toutes les contraintes de clé étrangère dans la base de données
ALTER TABLE [Beers] NOCHECK CONSTRAINT ALL;
ALTER TABLE [Preferences] NOCHECK CONSTRAINT ALL;
-- Supprimer les données de la table beer_types
DELETE FROM beer_types;
-- Réactiver toutes les contraintes de clé étrangère dans la base de données
ALTER TABLE [Beers] CHECK CONSTRAINT ALL;
ALTER TABLE [Preferences] CHECK CONSTRAINT ALL;