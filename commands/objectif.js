const { SlashCommandBuilder } = require("discord.js");
const { v4: uuidv4 } = require("uuid"); // en haut du fichier

module.exports = {
  data: new SlashCommandBuilder()
    .setName("objectif")
    .setDescription("Créer un nouvel objectif")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Type d'objectif")
        .setRequired(true)
        .addChoices(
          { name: "Orbe", value: "orbe" },
          { name: "Vortex", value: "vortex" },
          { name: "Peau", value: "peau" },
          { name: "Fibre", value: "fibre" },
          { name: "Bois", value: "bois" },
          { name: "Minerai", value: "minerai" },
          { name: "Pierre", value: "pierre" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("qualité")
        .setDescription("Qualité ou tier (ex: légendaire, 6.4...)")
        .setRequired(true)
        .addChoices(
          { name: "Légendaire", value: "légendaire 🟡" },
          { name: "Épique", value: "épique 🟣" },
          { name: "Rare", value: "rare 🔵" },
          { name: "Commun", value: "commun 🟢" },
          { name: "4.4", value: "4.4" },
          { name: "5.4", value: "5.4" },
          { name: "6.4", value: "6.4" },
          { name: "7.4", value: "7.4" },
          { name: "8.4", value: "8.4" }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("durée")
        .setDescription("Durée en minutes")
        .setRequired(true)
        .setMinValue(1)
    )
    .addStringOption((option) =>
      option
        .setName("map")
        .setDescription("Nom de la map")
        .setRequired(true)
        .setMinLength(4)
        .setMaxLength(40)
    ),

  async execute(interaction, objectives, updateObjectivesMessage) {
    const type = interaction.options.getString("type");
    const quality = interaction.options.getString("qualité");
    const duration = interaction.options.getInteger("durée");
    const map = interaction.options.getString("map");

    const emojiMap = {
      orbe: "",
      vortex: "",
      peau: "🐗",
      fibre: "🌿",
      bois: "🪓",
      minerai: "⛏️",
      pierre: "🧱",
    };

    const emoji = emojiMap[type] || "";
    const expiresAt = Date.now() + duration * 60 * 1000;

    objectives.push({
      id: uuidv4(), // Génération d'un ID unique pour l'objectif
      type,
      quality,
      duration,
      map,
      expiresAt,
      emoji,
      createdBy: interaction.member.displayName,
    });

    await interaction.reply({
      content: `✅ Objectif **${type} ${quality}** ajouté pour **${map}** (${duration} min)`,
      ephemeral: true,
    });
    await updateObjectivesMessage();
  },
};
