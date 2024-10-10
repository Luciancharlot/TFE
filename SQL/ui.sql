select * from Preferences

SELECT * 
FROM Beers
order by beer_name 
select * from Beer_types
select * from Orders
select * from OrderItems
select * from Ratings
select * from Users
SELECT TOP 10 * 
FROM Breweries
WHERE brewery_name LIKE '%abbaye%'
   OR brewery_name LIKE '%abdij%';

--SElect be.beer_name as beer_name , br.brewery_name as brewery_name
--from Beers as be join Breweries as br on be.brewery_id = br.brewery_id
--where be.beer_name like ('mare%')
--WHERE br.name LIKE '%abbaye%'
--   OR br.name LIKE '%abdij%'
--order by be.beer_name





EXEC sp_addlinkedserver 
    @server = 'ELCOABITUS_TFE',
    @srvproduct = '',
    @provider = 'SQLNCLI',
    @datasrc = 'EL-COABITUS\TFE';

INSERT INTO [ELCOABITUS_TFE].[TFE].[dbo].[Breweries] (brewery_id, brewery_name)
SELECT id, name
FROM [TFE].[dbo].[Breweries]

INSERT INTO [ELCOABITUS_TFE].[TFE].[dbo].[Beers] (beer_id, beer_name,abv,brewery_id,image,beer_description)
SELECT id, name,abv,brewery_id,image,tags
FROM [TFE].[dbo].[Beers]