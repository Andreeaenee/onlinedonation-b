CREATE TABLE user_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE social_network (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE status_name (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE donation_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE "user" (
    user_id SERIAL PRIMARY KEY,
    user_type_id INTEGER REFERENCES user_type(id),
    email VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(20),
    logo_id VARCHAR(255),
    password VARCHAR(255),
    status_id INTEGER REFERENCES status_name(id),
    name VARCHAR(255),
    main_photo_id VARCHAR(255),
    link VARCHAR(255),
    document_id VARCHAR(255),
    cif VARCHAR(255),
    contracturl VARCHAR(255),
    description VARCHAR(255)
);

CREATE TABLE email_verification (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(user_id),
    confirmation_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed BOOLEAN DEFAULT false
);


CREATE TABLE users_have_socials (
    user_id INTEGER REFERENCES "user"(user_id),
    social_network_id INTEGER REFERENCES social_network(id),
    url VARCHAR(255),
    PRIMARY KEY (user_id, social_network_id)
);


CREATE TABLE Donation (
    donation_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    quantity INTEGER,
    image_id VARCHAR(255),
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    transport_provided BOOLEAN,
    phone VARCHAR(20),
    pick_up_point VARCHAR(255),
    restaurant_id INTEGER REFERENCES user(user_id) ON DELETE CASCADE,
    ong_id INTEGER REFERENCES user(user_id) ON DELETE SET NULL,
    delivery_address VARCHAR(255),
    post_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status_id INTEGER REFERENCES donation_status(id) ON DELETE SET NULL,
     archived BOOLEAN DEFAULT FALSE,
);

CREATE TABLE Donation_Driver (
    driver_id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    approx_time INT,
    donation_id INTEGER UNIQUE REFERENCES Donation(donation_id) ON DELETE CASCADE
);

