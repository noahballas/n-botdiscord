const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ticketCategories, ticketChannelId } = require('../config.json');

let initialTicketMessage;

module.exports = (client) => {
    client.once('ready', async () => {

        const channel = client.channels.cache.get(ticketChannelId);
        if (!channel) {
            console.error('Salon non trouvé. Veuillez vérifier l\'ID du salon dans le config.json.');
            return;
        }

        try {
            const messages = await channel.messages.fetch({ limit: 100 });
            const botMessages = messages.filter(msg => msg.author.id === client.user.id && msg.embeds.length > 0);

            if (botMessages.size > 0) {
                await channel.bulkDelete(botMessages);
                console.log(`Supprimé ${botMessages.size} ancien(s) message(s) d'embed.`);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'ancien embed:', error);
        }

        console.log('Envoi de l\'embed dans le salon...');
        const options = ticketCategories.map((category, index) => ({
            label: category.label,
            description: category.description,
            value: `${index}`
        }));

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticketSelect')
                    .setPlaceholder('Choisissez une catégorie de ticket')
                    .addOptions(options)
            );

        const embed = new EmbedBuilder()
            .setColor('#0080ff')
            .setTitle('Création de Ticket')
            .setDescription("Bienvenue dans notre système de ticket. Veuillez sélectionner une catégorie ci-dessous pour ouvrir un ticket.")
            .setThumbnail("https://i.imgur.com/1XRZovN.png")
            .setImage("https://i.imgur.com/cFiBq33.png");

        // Envoi du message d'embed et sauvegarde de la référence
        try {
            initialTicketMessage = await channel.send({ embeds: [embed], components: [row] });
            console.log('Embed envoyé avec ID:', initialTicketMessage.id);
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message d\'embed:', error);
        }
    });

    client.on('interactionCreate', async interaction => {
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'ticketSelect') {
                const categoryIndex = parseInt(interaction.values[0], 10);
                const category = ticketCategories[categoryIndex];
                const userId = interaction.user.id;

                // Check if the user already has an open ticket
                const existingTicket = interaction.guild.channels.cache.find(ch => 
                    ch.name.startsWith(`ticket-${interaction.user.username}`) && ch.type === 0
                );

                if (existingTicket) {
                    return interaction.reply({ content: 'Vous avez déjà un ticket ouvert. Veuillez le fermer avant d\'en ouvrir un nouveau.', ephemeral: true });
                }

                const ticketChannel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: 0,
                    parent: category.categoryId,
                    permissionOverwrites: [
                        {
                            id: interaction.user.id,
                            allow: ['ViewChannel', 'SendMessages'],
                        },
                        {
                            id: interaction.guild.roles.everyone.id,
                            deny: ['ViewChannel'],
                        },
                        {
                            id: category.roleId,
                            allow: ['ViewChannel', 'SendMessages'],
                        },
                    ],
                });

                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle(`Ticket - ${category.label}`)
                    .setDescription(`Merci d'avoir ouvert un ticket pour "${category.label}". Un membre de l'équipe ${interaction.guild.roles.cache.get(category.roleId).name} vous répondra bientôt.`)
                    .addFields(
                        { name: 'Créé par', value: `<@${interaction.user.id}>` },
                        { name: 'Rôle', value: `<@&${category.roleId}>` }
                    );

                const deleteButton = new ButtonBuilder()
                    .setCustomId('deleteTicket')
                    .setLabel('Supprimer')
                    .setStyle(ButtonStyle.Danger);

                const buttonRow = new ActionRowBuilder()
                    .addComponents(deleteButton);

                await ticketChannel.send({ embeds: [embed], components: [buttonRow] });
                await interaction.reply({ content: `Votre ticket a été créé: ${ticketChannel}`, ephemeral: true });
            }
        } else if (interaction.isButton()) {
            if (interaction.customId === 'deleteTicket') {
                const confirmationEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Confirmation de Suppression')
                    .setDescription('Êtes-vous sûr de vouloir supprimer ce ticket ? Cette action est irréversible.');

                const confirmButton = new ButtonBuilder()
                    .setCustomId('confirmDelete')
                    .setLabel('Confirmer')
                    .setStyle(ButtonStyle.Danger);

                const cancelButton = new ButtonBuilder()
                    .setCustomId('cancelDelete')
                    .setLabel('Annuler')
                    .setStyle(ButtonStyle.Secondary);

                const confirmRow = new ActionRowBuilder()
                    .addComponents(confirmButton, cancelButton);

                await interaction.reply({ embeds: [confirmationEmbed], components: [confirmRow], ephemeral: true });
            } else if (interaction.customId === 'confirmDelete') {
                const ticketChannel = interaction.channel;

                await ticketChannel.permissionOverwrites.edit(interaction.user.id, {
                    ViewChannel: false
                });

                try {
                    await ticketChannel.delete('Ticket closed by user');
                } catch (error) {
                    console.error('Erreur lors de la suppression du canal:', error);
                }
            } else if (interaction.customId === 'cancelDelete') {
                await interaction.reply({ content: 'La suppression du ticket a été annulée.', ephemeral: true });
            }
        }
    });
};
