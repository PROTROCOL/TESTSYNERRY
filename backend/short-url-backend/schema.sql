-- schema.sql

-- Drop existing tables if they exist
DROP TABLE IF EXISTS clicks;
DROP TABLE IF EXISTS urls;

-- Create `urls` table to store original and shortened URLs
CREATE TABLE urls (
    id SERIAL PRIMARY KEY,
    full_url TEXT NOT NULL,
    short_code VARCHAR(10) UNIQUE NOT NULL CHECK (short_code <> ''),
    created_at TIMESTAMP DEFAULT NOW(),
    click_count INTEGER DEFAULT 0
);

-- Create `clicks` table to log click events on shortened URLs
CREATE TABLE clicks (
    id SERIAL PRIMARY KEY,
    url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
    click_time TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(45) NOT NULL CHECK (ip_address <> '')
);



/* postgresql://postgres:Pech21953@localhost:5432/postgres

provider = postgres
    database = postgres
        TABLE = urls
            [row - column]
             id full_url short_code created_at click_count 
             0  google      g        4341/231       1
        TABLE

        <> == !=

        click.url_id REFERENCES urls(id) == url.id

        '' != NULL
           == NULL */