const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const userProfiles = require('../db/userProfiles'); // <-- Version base de données

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Enregistre votre pseudo Albion et obtient le rôle Recrues')
    .addStringOption(option =>
      option.setName('pseudo')
        .setDescription('Votre pseudo Albion Online')
        .setRequired(true)
    ),

  async execute(interaction) {
    const discordUserId = interaction.user.id;
    const pseudo = interaction.options.getString('pseudo');

    const ALLOWED_CHANNEL_ID = "1400150970356334612"; // ID du salon autorisé pour la commande

    if (interaction.channel.id !== ALLOWED_CHANNEL_ID) {
      return interaction.reply({
        content: `❌ Cette commande ne peut être utilisée que dans <#${ALLOWED_CHANNEL_ID}>.`,
        ephemeral: true
      });
    }

    // Vérifier si ce compte Discord est déjà enregistré
    const existingProfile = await userProfiles.get(discordUserId);
    if (existingProfile) {
      return interaction.reply({
        content: `❌ Ton compte Discord est déjà lié au pseudo Albion **${existingProfile.albion_name}**.`,
        ephemeral: true
      });
    }

    // Vérifier si ce pseudo Albion est déjà lié à un autre compte Discord
    const pseudoUsed = await userProfiles.getByAlbionName(pseudo);
    if (pseudoUsed) {
      return interaction.reply({
        content: `❌ Le pseudo **${pseudo}** est déjà lié au compte Discord **<@${pseudoUsed.discord_id}>**.`,
        ephemeral: true
      });
    }

    try {
      // Vérifier via l'API Albion que le joueur existe et est bien dans la guilde
      const response = await axios.get(`https://gameinfo-ams.albiononline.com/api/gameinfo/search?q=${encodeURIComponent(pseudo)}`);
      const player = response.data.players?.find(p => p.Name.toLowerCase() === pseudo.toLowerCase());

      if (!player) {
        return interaction.reply({
          content: `❌ Joueur **${pseudo}** introuvable.`,
          ephemeral: true
        });
      }

      if (player.GuildName !== "O M B R A") {
        return interaction.reply({
          content: `❌ Le joueur **${pseudo}** n'est pas membre de la guilde **O M B R A**.`,
          ephemeral: true
        });
      }

      const memberRole = interaction.guild.roles.cache.find(role => role.name === "Recrues");
      if (!memberRole) {
        return interaction.reply({ content: `⚠️ Rôle 'Recrues' introuvable.`, ephemeral: true });
      }

      await interaction.member.roles.add(memberRole);
      await interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Attente recrutement"));

      // Enregistrement en base de données
      await userProfiles.set(discordUserId, pseudo, 0, 0);

      return interaction.reply({
        content: `✅ Bienvenue dans la guilde **O M B R A**, ${pseudo} ! Tu as reçu le rôle **Recrues**.`,
        ephemeral: true
      });

    } catch (error) {
      console.error("Erreur lors du register :", error);
      return interaction.reply({
        content: `⚠️ Une erreur est survenue pendant l'enregistrement.`,
        ephemeral: true
      });
    }
  }
};
