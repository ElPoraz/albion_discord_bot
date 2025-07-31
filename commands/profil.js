// commands/profil.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const userProfiles = require('../db/userProfiles'); // ⚠️ Mise à jour du chemin

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profil')
    .setDescription('Affiche ton profil Albion sur le bot')
    .addUserOption(option =>
      option.setName('joueur')
        .setDescription('Profil d’un autre joueur (optionnel)')
        .setRequired(false)
    ),

  async execute(interaction) {

    const ALLOWED_CHANNEL_ID = "1400150970356334612"; // ID du salon autorisé pour la commande

    if (interaction.channel.id !== ALLOWED_CHANNEL_ID) {
      return interaction.reply({
        content: `❌ Cette commande ne peut être utilisée que dans <#${ALLOWED_CHANNEL_ID}>.`,
        ephemeral: true
      });
    }
    
    const target = interaction.options.getUser('joueur') || interaction.user;
    const targetId = target.id;

    const profile = await userProfiles.get(targetId);

    if (!profile) {
      return interaction.reply({
        content: `❌ Le profil de **${target.username}** n'existe pas.`,
        ephemeral: true
      });
    }

    const playerName = profile.albion_name;
    if (!playerName) {
      return interaction.reply({
        content: `❌ Le pseudo Albion de **${target.username}** n'est pas renseigné.`,
        ephemeral: true
      });
    }

    // Scraping AlbionBB pour récupérer les attendances
    let attendance = 0;
    try {
      const startDate = "2025-07-30"; // ← Peut être rendu dynamique si besoin
      const encodedName = encodeURIComponent(playerName);
      const url = `https://europe.albionbb.com/guilds/tyKvJaFBSuKmMhAGi3JbXQ/attendance?minPlayers=25&search=${encodedName}&start=${startDate}&end=`;

      const { data: html } = await axios.get(url);
      const $ = cheerio.load(html);

      $('table tbody tr').each((i, row) => {
        const cells = $(row).find('td');
        const name = $(cells[1]).text().trim();
        const att = $(cells[3]).text().trim();
        if (name.toLowerCase() === playerName.toLowerCase()) {
          attendance = parseInt(att, 10);
        }
      });

      userProfiles.updateAttendance(targetId, attendance); // Mise à jour de l'attendance dans la base de données

    } catch (error) {
      console.error(`Erreur scraping AlbionBB pour ${playerName} :`, error.message);
    }

    const embed = new EmbedBuilder()
      .setTitle(`📊 Profil de ${target.username}`)
      .addFields(
        { name: '🧩 Attendances (+25 joueurs)', value: attendance.toString(), inline: true },
        { name: '📝 Reviews', value: profile.reviews.toString(), inline: true }
      )
      .setColor(0x7289da)
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
