CREATE TABLE teams (
  team_id INT AUTO_INCREMENT PRIMARY KEY,
  team_name VARCHAR(50),
  team_leader VARCHAR(50),
  logo VARCHAR(100),
  points INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE players (
  player_id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT,
  player_name VARCHAR(50),
  discord_id VARCHAR(50),
  role VARCHAR(20),
  FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

CREATE TABLE tournaments (
  tournament_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  status ENUM('active','upcoming','previous'),
  start_date DATE,
  end_date DATE,
  description TEXT,
  prize_pool VARCHAR(50)
);

CREATE TABLE matches (
  match_id INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id INT,
  team1_id INT,
  team2_id INT,
  score_team1 INT,
  score_team2 INT,
  match_date DATETIME,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id),
  FOREIGN KEY (team1_id) REFERENCES teams(team_id),
  FOREIGN KEY (team2_id) REFERENCES teams(team_id)
);
