CREATE TABLE IF NOT EXISTS investments (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_symbol VARCHAR(10)  NOT NULL,
    type         VARCHAR(20)  NOT NULL CHECK (type IN ('buy', 'sell', 'dividend')),
    quantity     NUMERIC,
    price        NUMERIC,
    amount       NUMERIC      NOT NULL,
    date         TIMESTAMP    NOT NULL,
    notes        TEXT,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);
