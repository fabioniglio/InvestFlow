INSERT INTO investments (user_id, asset_symbol, asset_class, type, quantity, price, amount, date, notes)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;
