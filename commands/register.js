const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { registerUser } = require('../../db');

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
      const response = await fetch(`https://gameinfo-ams.albiononline.com/api/gameinfo/players/${encodeURIComponent(pseudo)}`);
      if (!response.ok) {
        return interaction.reply({ content: `Impossible de trouver le joueur **${pseudo}**.`, ephemeral: true });
      }
      const playerData = await response.json();

      if (playerData.guildName !== 'O M B R A') {
        return interaction.reply({ content: `Le joueur **${pseudo}** n'est pas dans la guilde O M B R A.`, ephemeral: true });
      }

      const member = await interaction.guild.members.fetch(interaction.user.id);
      const role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'membre');
      if (!role) return interaction.reply({ content: 'Le rôle "membre" n\'existe pas.', ephemeral: true });

      await member.roles.add(role);

      // Enregistrer en BDD
      await registerUser(member.id, pseudo);

      // Masquer le channel register
      const registerChannel = interaction.guild.channels.cache.find(ch => ch.name === 'register');
      if (registerChannel) {
        await registerChannel.permissionOverwrites.edit(member, { ViewChannel: false });
      }

      return interaction.reply({ content: `Bienvenue **${pseudo}** ! Rôle membre attribué et enregistré en base.`, ephemeral: true });

    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'Erreur serveur, merci de réessayer plus tard.', ephemeral: true });
    }
  }
};
