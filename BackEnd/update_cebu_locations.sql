-- Update product locations to Cebu addresses
UPDATE products SET 
    pickup_address='IT Park, Apas', 
    pickup_city='Cebu City', 
    pickup_coordinates='10.3207,123.8950' 
WHERE partner_name='BreadTalk';

UPDATE products SET 
    pickup_address='Ayala Center Cebu', 
    pickup_city='Cebu City', 
    pickup_coordinates='10.3181,123.9058' 
WHERE partner_name='Goldilocks';

UPDATE products SET 
    pickup_address='SM City Cebu, North Reclamation Area', 
    pickup_city='Cebu City', 
    pickup_coordinates='10.3197,123.8954' 
WHERE partner_name='Jollibee';

UPDATE products SET 
    pickup_address='Gaisano Country Mall, Banilad', 
    pickup_city='Cebu City', 
    pickup_coordinates='10.3333,123.9111' 
WHERE partner_name='Stop N Shop';
