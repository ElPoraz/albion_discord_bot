const express = require('express');
const app = express();
const cheerio = require('cheerio');
const axios = require('axios');
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM user_profiles');
    const profils = [];

    for (const row of rows) {
      const { user_id, username, discord_tag, reviews } = row;

      let attendance = 0;
      try {
        const encoded = encodeURIComponent(username);
        const url = `https://europe.albionbb.com/guilds/tyKvJaFBSuKmMhAGi3JbXQ/attendance?minPlayers=20&search=${encoded}&start=2025-07-30&end=`;
        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);

        $('table tbody tr').each((i, el) => {
          const tds = $(el).find('td');
          const name = $(tds[1]).text().trim();
          const count = $(tds[3]).text().trim();

          if (name.toLowerCase() === username.toLowerCase()) {
            attendance = parseInt(count, 10);
          }
        });
      } catch (err) {
        console.error(`Erreur scrape pour ${username}:`, err.message);
      }

      profils.push({
        username,
        discordTag: discord_tag,
        reviews,
        attendance
      });
    }

    res.render('profiles', { profils });
  } catch (err) {
    res.status(500).send('Erreur serveur : ' + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Interface web dispo sur http://localhost:${PORT}`));
