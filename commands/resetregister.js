// commands/resetregister.js
const { SlashCommandBuilder } = require('discord.js');
const userProfiles = require('../db/userProfiles');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetregister')
    .setDescription('Réinitialise le lien entre un pseudo Albion et un compte Discord')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Le membre dont on veut réinitialiser l’enregistrement')
        .setRequired(true)
    ),

  async execute(interaction) {
    const isAdmin = interaction.member.roles.cache.some(role => role.name === 'Admin');
    if (!isAdmin) {
      return interaction.reply({
        content: "❌ Tu n’as pas l’autorisation d’utiliser cette commande.",
        ephemeral: true
      });
    }

    const targetUser = interaction.options.getUser('utilisateur');

    const profile = await userProfiles.get(targetUser.id);
    if (!profile) {
      return interaction.reply({
        content: `❌ Le membre <@${targetUser.id}> n’a pas de profil enregistré.`,
        ephemeral: true
      });
    }

    await userProfiles.delete(targetUser.id);

    return interaction.reply({
      content: `✅ Le lien de <@${targetUser.id}> a été réinitialisé.`,
      ephemeral: true
    });
  }
};
