const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

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
      console.log(`🔍 Recherche du joueur : ${pseudo}`);

      const response = await axios.get(`https://gameinfo-ams.albiononline.com/api/gameinfo/search?q=${encodeURIComponent(pseudo)}`);
      console.log(`📄 Données du joueur récupérées :`, response.data);

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

      const memberRole = interaction.guild.roles.cache.find(role => role.name === "membre");
      if (!memberRole) {
        return interaction.reply({ content: `⚠️ Rôle 'membre' introuvable.`, ephemeral: true });
      }

      await interaction.member.roles.add(memberRole);

      const registerChannel = interaction.channel;
      if (registerChannel) {
        await registerChannel.permissionOverwrites.edit(interaction.member, {
          ViewChannel: false
        });
      }

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
