const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
// const { registerUser } = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Enregistre votre pseudo Albion et obtient le rôle membre')
    .addStringOption(option =>
      option.setName('pseudo')
        .setDescription('Votre pseudo Albion Online')
        .setRequired(true)
    ),

  async execute(interaction) {
    const pseudo = interaction.options.getString('pseudo');

    try {
      const response = await axios.get(`https://gameinfo-ams.albiononline.com/api/gameinfo/players/${encodeURIComponent(pseudo)}`);
      const playerData = response.data;

      // Exemple : vérifier qu'il est dans la guilde "O M B R A"
      if (playerData.GuildName !== "O M B R A") {
        return interaction.reply({
          content: `❌ Le joueur **${pseudo}** n'est pas membre de la guilde **O M B R A**.`,
          ephemeral: true
        });
      }

      // Ajoute le rôle 'membre' si tout est bon
      const memberRole = interaction.guild.roles.cache.find(role => role.name === "membre");
      if (!memberRole) {
        return interaction.reply({ content: `⚠️ Rôle 'membre' introuvable.`, ephemeral: true });
      }

      await interaction.member.roles.add(memberRole);

      // Cacher le channel d’enregistrement (optionnel, selon config)
      const registerChannel = interaction.channel;
      if (registerChannel) {
        await registerChannel.permissionOverwrites.edit(interaction.member, {
          ViewChannel: false
        });
      }

      // Enregistre en base (si tu veux)
      // await registerUser(interaction.user.id, pseudo, new Date());

      return interaction.reply({
        content: `✅ Bienvenue dans la guilde **O M B R A**, ${pseudo} ! Tu as reçu le rôle membre.`,
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
