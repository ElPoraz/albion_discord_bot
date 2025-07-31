// commands/review.js
const { SlashCommandBuilder } = require('discord.js');
const userProfiles = require('../db/userProfiles'); // Utilisation du module connecté à PostgreSQL

module.exports = {
  data: new SlashCommandBuilder()
    .setName('review')
    .setDescription('Ajoute un review à un membre')
    .addUserOption(option =>
      option.setName('joueur')
        .setDescription('Le joueur à qui ajouter un review')
        .setRequired(true)
    ),

  async execute(interaction) {
    const reviewerRole = interaction.guild.roles.cache.find(r => r.name === 'Reviewer');
    if (!reviewerRole || !interaction.member.roles.cache.has(reviewerRole.id)) {
      return interaction.reply({
        content: `⛔ Tu n’as pas le rôle **Reviewer** pour faire ça.`,
        ephemeral: true
      });
    }

    const target = interaction.options.getUser('joueur');
    const targetId = target.id;

    const profile = await userProfiles.get(targetId);
    if (!profile) {
      return interaction.reply({
        content: `❌ Le profil de **${target.username}** n'existe pas.`,
        ephemeral: true
      });
    }

    const newReviews = profile.reviews + 1;
    await userProfiles.updateReviews(targetId, newReviews );

    return interaction.reply({
      content: `🔍 ${profile.albion_name} a maintenant **${newReviews}** reviews.`,
      ephemeral: true
    });
  }
};
