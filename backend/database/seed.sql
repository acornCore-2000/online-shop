BEGIN;

INSERT INTO public.products
  (name, price, quantity, season, gender, colors, description, category, image_url)
SELECT
  v.name,
  v.price,
  v.quantity,
  v.season,
  v.gender,
  v.colors,
  v.description,
  v.category,
  v.image_url
FROM (
  VALUES
    -- Men / Summer
    ('Men Summer Linen Shirt', 49.99, 25, 'summer', 'men',
      ARRAY['white', 'blue'], 'Lightweight linen shirt for warm days.', 'clothing',
      'https://placehold.co/800x1000/png?text=Men+Summer+Shirt'),
    ('Men Summer Running Shoes', 89.99, 18, 'summer', 'men',
      ARRAY['black', 'white'], 'Breathable running shoes for everyday use.', 'shoes',
      'https://placehold.co/800x1000/png?text=Men+Summer+Shoes'),
    ('Men Summer Canvas Cap', 19.99, 40, 'summer', 'men',
      ARRAY['beige', 'navy'], 'Adjustable cotton canvas cap.', 'accessories',
      'https://placehold.co/800x1000/png?text=Men+Summer+Cap'),

    -- Men / Winter
    ('Men Winter Puffer Jacket', 129.99, 15, 'winter', 'men',
      ARRAY['black', 'olive'], 'Warm insulated jacket for cold weather.', 'clothing',
      'https://placehold.co/800x1000/png?text=Men+Winter+Jacket'),
    ('Men Winter Leather Boots', 149.99, 12, 'winter', 'men',
      ARRAY['brown', 'black'], 'Durable leather boots with a warm lining.', 'shoes',
      'https://placehold.co/800x1000/png?text=Men+Winter+Boots'),
    ('Men Winter Wool Scarf', 29.99, 30, 'winter', 'men',
      ARRAY['gray', 'charcoal'], 'Soft wool scarf for cold days.', 'accessories',
      'https://placehold.co/800x1000/png?text=Men+Winter+Scarf'),

    -- Women / Summer
    ('Women Summer Cotton Dress', 69.99, 22, 'summer', 'women',
      ARRAY['yellow', 'pink', 'white'], 'Light cotton dress for summer outings.', 'clothing',
      'https://placehold.co/800x1000/png?text=Women+Summer+Dress'),
    ('Women Summer Sandals', 44.99, 20, 'summer', 'women',
      ARRAY['tan', 'white'], 'Comfortable sandals with a soft footbed.', 'shoes',
      'https://placehold.co/800x1000/png?text=Women+Summer+Sandals'),
    ('Women Summer Straw Hat', 24.99, 35, 'summer', 'women',
      ARRAY['natural', 'black'], 'Wide-brim straw hat with a simple band.', 'accessories',
      'https://placehold.co/800x1000/png?text=Women+Summer+Hat'),

    -- Women / Winter
    ('Women Winter Knit Sweater', 79.99, 20, 'winter', 'women',
      ARRAY['cream', 'burgundy'], 'Soft knitted sweater for everyday warmth.', 'clothing',
      'https://placehold.co/800x1000/png?text=Women+Winter+Sweater'),
    ('Women Winter Ankle Boots', 109.99, 14, 'winter', 'women',
      ARRAY['black', 'brown'], 'Water-resistant ankle boots for winter.', 'shoes',
      'https://placehold.co/800x1000/png?text=Women+Winter+Boots'),
    ('Women Winter Leather Gloves', 34.99, 28, 'winter', 'women',
      ARRAY['black', 'tan'], 'Lined leather gloves with touchscreen fingers.', 'accessories',
      'https://placehold.co/800x1000/png?text=Women+Winter+Gloves'),

    -- Unisex / Summer
    ('Unisex Summer Graphic T-Shirt', 29.99, 45, 'summer', 'unisex',
      ARRAY['white', 'black', 'green'], 'Relaxed-fit graphic t-shirt for summer.', 'clothing',
      'https://placehold.co/800x1000/png?text=Unisex+Summer+T-Shirt'),
    ('Unisex Summer Sneakers', 74.99, 24, 'summer', 'unisex',
      ARRAY['white', 'gray'], 'Lightweight sneakers for daily wear.', 'shoes',
      'https://placehold.co/800x1000/png?text=Unisex+Summer+Sneakers'),
    ('Unisex Summer Sunglasses', 39.99, 32, 'summer', 'unisex',
      ARRAY['black', 'brown'], 'UV-protective sunglasses with a classic frame.', 'accessories',
      'https://placehold.co/800x1000/png?text=Unisex+Summer+Sunglasses'),

    -- Unisex / Winter
    ('Unisex Winter Fleece Hoodie', 59.99, 26, 'winter', 'unisex',
      ARRAY['gray', 'black', 'navy'], 'Warm fleece hoodie with a relaxed fit.', 'clothing',
      'https://placehold.co/800x1000/png?text=Unisex+Winter+Hoodie'),
    ('Unisex Winter Hiking Shoes', 119.99, 16, 'winter', 'unisex',
      ARRAY['black', 'gray'], 'Grip-focused shoes for winter walks and hikes.', 'shoes',
      'https://placehold.co/800x1000/png?text=Unisex+Winter+Shoes'),
    ('Unisex Winter Beanie', 17.99, 50, 'winter', 'unisex',
      ARRAY['black', 'gray', 'olive'], 'Stretch-knit beanie for cold weather.', 'accessories',
      'https://placehold.co/800x1000/png?text=Unisex+Winter+Beanie')
) AS v(name, price, quantity, season, gender, colors, description, category, image_url)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.products p
  WHERE p.name = v.name
    AND p.season = v.season
    AND p.gender = v.gender
    AND p.category = v.category
);

SELECT setval(
  pg_get_serial_sequence('public.products', 'id'),
  COALESCE((SELECT MAX(id) FROM public.products), 1),
  true
);

COMMIT;
