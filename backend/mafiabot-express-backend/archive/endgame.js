const express = require('express');
const router = express.Router();
const fs = require('fs');

// Importing the gamedataPath
const {gameDataFilePath} = require('../db/dbPaths');
// Example call:
/*
{}
*/
//

module.exports = () => {
  router.post('/', (req, res) => {
    // Read the contents of the gamedata.json file
    fs.readFile(gameDataFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Parse the JSON data
      const gamedata = JSON.parse(data);

      // Check if the game is in progress
      if (!gamedata.partyInProgress) {
        res.status(400).send('Game is not in progress');
        return;
      }

      // Get an array of all players who are alive
      const alivePlayers = gamedata.players.filter(player => player.alive);

      // Set those players as winners
      alivePlayers.forEach(player => {
        player.winner = true;
      });

      // Set partyInProgress to false
      gamedata.partyInProgress = false;

      // Write the updated gamedata back to the JSON file
      fs.writeFile(gameDataFilePath, JSON.stringify(gamedata, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
          return;
        }

        res.json({ message: 'Game ended successfully', winners: alivePlayers.map(player => player.username) });
      });
    });
  });

  return router;
};

