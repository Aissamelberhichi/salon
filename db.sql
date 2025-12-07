-- Table: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: salons
CREATE TABLE salons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    description TEXT,
    logo_url VARCHAR(255),
    owner_id INTEGER REFERENCES users(id),
    opening_hours TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: services
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    salon_id INTEGER REFERENCES salons(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table: coiffeurs
CREATE TABLE coiffeurs (
    id SERIAL PRIMARY KEY,
    salon_id INTEGER REFERENCES salons(id),
    user_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE
);

-- Table: reservations
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id),
    salon_id INTEGER REFERENCES salons(id),
    coiffeur_id INTEGER REFERENCES coiffeurs(id),
    service_id INTEGER REFERENCES services(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: loyalty_points
CREATE TABLE loyalty_points (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    points INTEGER DEFAULT 0,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: reviews
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(id),
    client_id INTEGER REFERENCES users(id),
    salon_id INTEGER REFERENCES salons(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: promotions
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    salon_id INTEGER REFERENCES salons(id),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    discount_percent DECIMAL(5,2),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table: payments
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    cashier_id INTEGER REFERENCES users(id),
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: stocks
CREATE TABLE stocks (
    id SERIAL PRIMARY KEY,
    salon_id INTEGER REFERENCES salons(id),
    product_name VARCHAR(100) NOT NULL,
    quantity INTEGER DEFAULT 0,
    alert_threshold INTEGER DEFAULT 0,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: subscriptions
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    salon_id INTEGER REFERENCES salons(id),
    start_date DATE,
    end_date DATE,
    type VARCHAR(20),
    status VARCHAR(20),
    amount DECIMAL(10,2)
);