const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('supprimer')
    .setDescription('Supprime un objectif par catégorie'),

  async execute(interaction, objectives) {
    const categoriesMap = {};

    for (const obj of objectives) {
      if (!categoriesMap[obj.type]) {
        categoriesMap[obj.type] = 0;
      }
      categoriesMap[obj.type]++;
    }

    const categories = Object.entries(categoriesMap)
      .filter(([_, count]) => count > 0)
      .map(([type]) => ({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        value: type
      }));

    if (categories.length === 0) {
      return interaction.reply({ content: "❌ Aucun objectif à supprimer.", ephemeral: true });
    }

    const select = new StringSelectMenuBuilder()
      .setCustomId('delete_category')
      .setPlaceholder('Choisissez une catégorie')
      .addOptions(categories);

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.reply({ content: "🗂️ Choisissez une catégorie à gérer :", components: [row], ephemeral: true });
  }
};
