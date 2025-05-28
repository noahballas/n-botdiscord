const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const { Tickets, Channels, Server } = require('../config.json');

module.exports = (client) => {
    client.once('ready', async () => {
        try {
            if (!Channels?.ticketChannelId) {
                return console.error('❌ ticketChannelId non défini dans config.json');
            }

            const channel = client.channels.cache.get(Channels.ticketChannelId);
            if (!channel) {
                return console.error(`❌ Salon introuvable (ID: ${Channels.ticketChannelId})`);
            }

            try {
                const messages = await channel.messages.fetch({ limit: 100 });
                const botMessages = messages.filter(msg => msg.author.id === client.user.id);
                
                if (botMessages.size > 0) {
                    await channel.bulkDelete(botMessages);
                    console.log(`♻️ Supprimé ${botMessages.size} ancien(s) message(s)`);
                }
            } catch (error) {
                console.error('⚠️ Erreur lors du nettoyage:', error.message);
            }

            const options = Tickets.categories.map((category, index) => ({
                label: category.label,
                description: category.description.substring(0, 50),
                value: index.toString()
            }));

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticketSelect')
                    .setPlaceholder('Sélectionnez une catégorie...')
                    .addOptions(options)
            );

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Système de Tickets')
                .setDescription(`Bientôt`)
                .setThumbnail(Server.logoUrl)
                .setFooter({ text: `${client.user.username} • ${new Date().getFullYear()}` });

            await channel.send({ embeds: [embed], components: [row] });
            console.log('✅ Message de ticket envoyé avec succès');

        } catch (error) {
            console.error('❌ Erreur critique:', error);
        }
    });

    client.on('interactionCreate', async interaction => {
        if (!interaction.inGuild()) return;

        try {
            if (interaction.isStringSelectMenu() && interaction.customId === 'ticketSelect') {
                await handleTicketCreation(interaction);
            }
            else if (interaction.isButton()) {
                await handleTicketButtons(interaction);
            }
        } catch (error) {
            console.error('⚠️ Erreur d\'interaction:', error);
            await interaction.reply({ 
                content: '❌ Une erreur est survenue', 
                ephemeral: true 
            }).catch(() => {});
        }
    });

    async function handleTicketCreation(interaction) {
        const categoryIndex = parseInt(interaction.values[0]);
        const category = Tickets.categories[categoryIndex];
        const maxTickets = Tickets.settings?.maxTicketsPerUser || 1;
        
        if (!category) {
            return interaction.reply({ 
                content: '❌ Catégorie invalide', 
                ephemeral: true 
            });
        }

        const userTickets = interaction.guild.channels.cache.filter(ch => 
            ch.type === ChannelType.GuildText &&
            (
                ch.name.includes(interaction.user.id) ||
                ch.name.includes(interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
                (ch.topic && ch.topic.includes(interaction.user.id))
            )
        );

        if (userTickets.size >= maxTickets) {
            const ticketList = userTickets.map(ch => `- ${ch.toString()}`).join('\n');
            return interaction.reply({ 
                content: `❌ Vous avez atteint la limite de ${maxTickets} ticket(s) ouvert(s):\n${ticketList}\n\nVeuillez fermer vos tickets existants avant d'en créer un nouveau.`, 
                ephemeral: true 
            });
        }

        try {
            const safeUsername = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '');
            const ticketName = `ticket-${safeUsername}`;
            const ticketChannel = await interaction.guild.channels.create({
                name: ticketName,
                type: ChannelType.GuildText,
                parent: category.categoryId,
                topic: `Ticket créé par ${interaction.user.id}`,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    {
                        id: category.roleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageChannels
                        ]
                    }
                ]
            });

            const embed = new EmbedBuilder()
                .setColor(category.color || '#00ff00')
                .setTitle(`Ticket ${category.label.split('|')[1]?.trim() || ''}`)
                .setDescription(category.description)
                .addFields(
                    { name: 'Utilisateur', value: interaction.user.toString(), inline: true },
                    { name: 'Staff', value: `<@&${category.roleId}>`, inline: true }
                )
                .setFooter({ text: `ID: ${interaction.user.id}` });

            const closeButton = new ButtonBuilder()
                .setCustomId('closeTicket')
                .setLabel('Fermer le ticket')
                .setStyle(ButtonStyle.Danger);

            await ticketChannel.send({
                content: `${interaction.user} <@&${category.roleId}>`,
                embeds: [embed],
                components: [new ActionRowBuilder().addComponents(closeButton)]
            });

            await interaction.reply({ 
                content: `✅ Ticket créé: ${ticketChannel}\n\n⚠️ Vous ne pouvez avoir que ${maxTickets} ticket(s) ouvert(s) à la fois.`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error('❌ Erreur création ticket:', error);
            await interaction.reply({ 
                content: '❌ Échec de la création du ticket', 
                ephemeral: true 
            });
        }
    }

    async function handleTicketButtons(interaction) {
        if (interaction.customId === 'closeTicket') {
            const confirmEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Confirmation de fermeture')
                .setDescription('Êtes-vous sûr de vouloir fermer ce ticket?');

            const confirmButton = new ButtonBuilder()
                .setCustomId('confirmClose')
                .setLabel('Confirmer')
                .setStyle(ButtonStyle.Danger);

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancelClose')
                .setLabel('Annuler')
                .setStyle(ButtonStyle.Secondary);

            await interaction.reply({
                embeds: [confirmEmbed],
                components: [new ActionRowBuilder().addComponents(confirmButton, cancelButton)],
                ephemeral: true
            });
        }
        else if (interaction.customId === 'confirmClose') {
            try {
                await interaction.channel.delete('Fermeture par utilisateur');
            } catch (error) {
                console.error('⚠️ Erreur fermeture ticket:', error);
                await interaction.followUp({ 
                    content: '❌ Impossible de fermer le ticket', 
                    ephemeral: true 
                });
            }
        }
        else if (interaction.customId === 'cancelClose') {
            await interaction.update({ 
                content: '✅ Fermeture annulée', 
                components: [], 
                embeds: [] 
            });
        }
    }
};