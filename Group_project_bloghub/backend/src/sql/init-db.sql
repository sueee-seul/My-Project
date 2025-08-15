DROP TABLE IF EXISTS Likes;
DROP TABLE IF EXISTS Subscriptions;
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS Comments;
DROP TABLE IF EXISTS Tags;
DROP TABLE IF EXISTS Articles;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(16) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    description TEXT NOT NULL,
    dob TEXT NOT NULL,
    avatar_id INTEGER NOT NULL,
    is_admin BOOLEAN NOT NULL
);

CREATE TABLE Articles (
    id INTEGER PRIMARY KEY,
    title VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    image_id TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT NULL,
    author_id INTEGER NOT NULL,
    FOREIGN KEY (author_id) REFERENCES Users (id)
);

CREATE TABLE Tags (
    id INTEGER PRIMARY KEY NOT NULL,
    article_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (article_id) REFERENCES Articles(id)
);
 
CREATE TABLE Comments (
    id INTEGER PRIMARY KEY NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    article_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (article_id) REFERENCES Articles (id),
    FOREIGN KEY (user_id) REFERENCES Users (id)
);

CREATE TABLE Notifications (
    id INTEGER PRIMARY KEY NOT NULL,
    time TIMESTAMP NOT NULL,
    is_new BOOLEAN DEFAULT 1,
    user_id INTEGER NOT NULL,
    article_id INTEGER DEFAULT NULL,
    comment_id INTEGER DEFAULT NULL, -- Plan is to use whether comment_id or article_id is null to determine what kind of notification this is
    FOREIGN KEY (user_id) REFERENCES Users (id),
    FOREIGN KEY (article_id) REFERENCES Articles (id),
    FOREIGN KEY (comment_id) REFERENCES Comments (id)
);

CREATE TABLE Subscriptions (
    subscriber_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    PRIMARY KEY (subscriber_id, recipient_id),
    FOREIGN KEY (subscriber_id) REFERENCES Users (id),
    FOREIGN KEY (recipient_id) REFERENCES Users (id),
    CHECK (subscriber_id <> recipient_id) -- Checks user isn't subscribing to themself
);

CREATE TABLE Likes (
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, article_id),
    FOREIGN KEY (user_id) REFERENCES Users (id),
    FOREIGN KEY (article_id) REFERENCES Articles (id)
);

--Sample data for testing all tables except for notifications have sample data

INSERT INTO Users (username, password, firstname, lastname, description, dob, avatar_id, is_admin)
VALUES
('helloworld', '$2b$10$osI.f7FFI26GbRvBAE2kDeY9yZ6VzkYO7Os2nyWOL89w1mIe2bwFq', 'Hello', 'World', 'Hello world! I am a test user!', '2025-05-29T21:54:32Z', 1, 1), -- password is hello
('ewelalia', '$2b$10$XjRkyxg4LUmIf7r.d6bdneWPxtyQg57wK.tfxC3U9OnWYN2gkJ6Si', 'Emily', 'Oram', 'Sheep are super cool and they are my favourite animal', '2025-05-29T21:54:32Z', 2, 1), -- password is sheeparecool
('exprimeminister', '$2b$10$AmacDohWlk03W8HPWdWuDeO0tBJzQFlCDL72MB1qkVNc7MQBbzfnq', 'Jacinda', 'Ardern', 'Former labour Prime Minister', '2025-05-29T21:54:32Z', 3, 0), -- password is formerpm
('TheBestStarr', '$2b$10$C8Tv/LiUrKaYjU82cWcxGOz56bFNaCxjwsDpzaxnObjyQ2aDnXgLK', 'Patrick', 'Starr', 'Best starfish in the universe', '2025-05-29T21:54:32Z', 2, 0), -- password is Imastarfish
('aotearoa', '$2b$10$ElrjLZcd2uQJyfZWeX6NwOVBaG7ANj.xdSqx2F1jY5KH9XsKh4KH.', 'New', 'Zealand', 'The entire country', '2025-05-29T21:54:32Z', 4, 0); -- password is kiaora

INSERT INTO Articles (title, content, image_id, created_at, updated_at, author_id)
VALUES
('Welcome Post', '<p>This is the first article on our site.</p>', '/Dragonite.png', '2025-01-10 08:00:00', '2025-01-10 08:00:00', 1),
('Tech Trends', '<p>Let’s talk about 2025’s hottest tech.</p>', NULL, '2025-02-15 10:30:00', '2025-02-15 11:00:00', 2),
('Health Tips', '<p>Top 10 health habits for a better life.</p>', NULL, '2025-03-01 09:15:00', '2025-03-01 09:45:00', 3),
('Travel Diaries', '<p>Exploring the <em>Alps</em> was a dream come true.</p>', NULL, '2025-03-25 14:00:00', '2025-03-25 14:30:00', 4),
('Security Matters', '<p><strong>Cybersecurity in 2025:</strong> What you should know.</p>', '/Dragonite.png', '2025-04-10 16:00:00', '2025-04-10 16:45:00', 4);

INSERT INTO Tags (article_id, name) VALUES
(1, 'info'),
(1, 'help'),
(3, 'info'),
(4, 'travel');

INSERT INTO Comments (id, content, created_at, article_id, user_id)
VALUES
(1, 'Great article! Really enjoyed it.', '2025-04-11 09:00:00', 1, 2),
(2, 'Very informative, thanks!', '2025-04-11 09:15:00', 2, 3),
(3, 'I learned a lot from this post.', '2025-04-12 10:00:00', 2, 1),
(4, 'Interesting perspective on the topic.', '2025-04-13 11:30:00', 3, 4),
(5, 'Can you elaborate more on this part?', '2025-04-14 12:45:00', 4, 5),
(6, 'Looking forward to more content like this!', '2025-04-14 13:00:00', 5, 2),
(7, 'Nice write-up!', '2025-04-15 08:20:00', 1, 3),
(8, 'Disagree with some points, but well written.', '2025-04-15 09:10:00', 3, 5);

INSERT INTO Likes (user_id, article_id)
VALUES
(1, 2),
(1, 3),
(2, 1),
(2, 3),
(3, 1),
(3, 4),
(4, 2),
(4, 5),
(5, 1),
(5, 3);

INSERT INTO Subscriptions (subscriber_id, recipient_id)
VALUES
(1, 2),
(1, 3),
(2, 1),
(3, 4),
(4, 5),
(5, 1);