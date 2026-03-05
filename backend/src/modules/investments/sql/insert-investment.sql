INSERT INTO investments (asset_symbol, type, quantity, price, amount, date, notes)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;
