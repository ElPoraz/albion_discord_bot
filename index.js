require('dotenv').config();
const { Client, Collection, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const { initDb } = require('./db');

async function main() {
  await initDb(); // OK ici, dans une fonction async

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
  });

  client.commands = new Collection();
  const objectives = [];
  let updateMessageId = null;
  let updateChannel = null;

  // Charger les commandes
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
  }

  // 🧠 Fonction utilitaire pour mettre une majuscule
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // 🧹 Actualisation du message central
  function removeExpiredObjectives(objectives, now) {
    for (let i = objectives.length - 1; i >= 0; i--) {
      if (objectives[i].expiresAt <= now) {
        objectives.splice(i, 1);
      }
    }
  }

  function populateEmbeds(objectives, now) {
    const embeds = {
      orbe: new EmbedBuilder()
        .setTitle("🔮 Objectifs Orbe")
        .setColor(0x3498db)
        .setFooter({ text: "/objectif pour en créer un nouveau" })
        .setTimestamp(),

      vortex: new EmbedBuilder()
        .setTitle("🌪️ Objectifs Vortex")
        .setColor(0xe67e22)
        .setFooter({ text: "/objectif pour en créer un nouveau" })
        .setTimestamp(),

      ressources: new EmbedBuilder()
        .setTitle("Objectifs Ressources")
        .setColor(0x2ecc71)
        .setFooter({ text: "/objectif pour en créer un nouveau" })
        .setTimestamp()
    };

    for (const obj of objectives) {
      const remaining = Math.max(0, obj.expiresAt - now);
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      const time = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      const label = `${obj.emoji} ${capitalize(obj.type)} ${obj.quality} - **${obj.map}** — ⏱️ ${time} min restantes\n*created by ${obj.createdBy}*`;

      if (obj.type === 'orbe') {
        embeds.orbe.addFields({ name: '\u200B', value: label });
      } else if (obj.type === 'vortex') {
        embeds.vortex.addFields({ name: '\u200B', value: label });
      } else {
        embeds.ressources.addFields({ name: '\u200B', value: label });
      }
    }
    return embeds;
  }

  async function updateObjectivesMessage() {
    if (!updateChannel || !updateMessageId) return;

    const now = Date.now();

    // 🔥 Supprimer les objectifs expirés
    removeExpiredObjectives(objectives, now);

    // 📦 Trier par durée restante
    objectives.sort((a, b) => a.expiresAt - b.expiresAt);

    // 🧱 Embeds par type
    const embeds = populateEmbeds(objectives, now);

    try {
      const msg = await updateChannel.messages.fetch(updateMessageId);

      if (objectives.length === 0) {
        const emptyEmbed = new EmbedBuilder()
          .setTitle("🎯 Objectifs actifs")
          .setColor(0x808080)
          .setDescription("Aucun objectif actif pour le moment.")
          .setFooter({ text: "/objectif pour en créer un nouveau" })
          .setTimestamp();
        await msg.edit({ embeds: [emptyEmbed] });
      } else {
        const toSend = [];

        if (embeds.orbe.data.fields?.length > 0) toSend.push(embeds.orbe);
        if (embeds.vortex.data.fields?.length > 0) toSend.push(embeds.vortex);
        if (embeds.ressources.data.fields?.length > 0) toSend.push(embeds.ressources);

        await msg.edit({ embeds: toSend });
      }

    } catch (err) {
      console.error("❌ Erreur lors de la mise à jour du message :", err);
    }
  }

  // ⏱ Mise à jour toutes les 10s
  setInterval(updateObjectivesMessage, 10000);

  // ✅ Démarrage du bot
  client.once('ready', async () => {
    console.log(`✅ Bot prêt : ${client.user.tag}`);

    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    updateChannel = await guild.channels.fetch(process.env.UPDATE_CHANNEL_ID);

    const messages = await updateChannel.messages.fetch({ limit: 10 });
    const existing = messages.find(m => m.author.id === client.user.id);

    if (existing) {
      updateMessageId = existing.id;
    } else {
      const embed = new EmbedBuilder()
        .setTitle("🎯 Objectifs actifs")
        .setColor(0x808080)
        .setDescription("Aucun objectif actif pour le moment.")
        .setFooter({ text: "/objectif pour en créer un nouveau" });

      const newMsg = await updateChannel.send({ embeds: [embed] });
      updateMessageId = newMsg.id;
    }

    updateObjectivesMessage();
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, objectives, updateObjectivesMessage);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Erreur pendant la commande.', ephemeral: true });
    }
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return;

    const customId = interaction.customId;

    if (customId === 'delete_category') {
      const chosenType = interaction.values[0];
      const filtered = objectives.filter(obj => obj.type === chosenType);

      if (filtered.length === 0) {
        return interaction.update({ content: "❌ Aucun objectif trouvé dans cette catégorie.", components: [] });
      }

      const select = new StringSelectMenuBuilder()
        .setCustomId('delete_objective')
        .setPlaceholder('Choisissez un objectif à supprimer')
        .addOptions(
          filtered.map(obj => ({
            label: `${obj.quality} - ${obj.map}`,
            description: `Expire dans ${Math.ceil((obj.expiresAt - Date.now()) / 60000)} min`,
            value: obj.id
          }))
        );

      const row = new ActionRowBuilder().addComponents(select);

      await interaction.update({
        content: `🔍 Objectifs dans la catégorie **${chosenType}** :`,
        components: [row]
      });

    } else if (customId === 'delete_objective') {
      const selectedId = interaction.values[0];
      const index = objectives.findIndex(obj => obj.id === selectedId);

      if (index !== -1) {
        const removed = objectives.splice(index, 1)[0];
        await interaction.update({
          content: `🗑️ Objectif **${removed.quality} - ${removed.map}** supprimé.`,
          components: []
        });
        updateObjectivesMessage();
      } else {
        await interaction.update({ content: "⚠️ Objectif introuvable.", components: [] });
      }
    }
  });

  client.login(process.env.DISCORD_TOKEN);
}

main().catch(console.error);
