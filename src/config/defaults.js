module.exports = {
    meta: {
        configured: false
    },
    DiscordBot: {
        clientId: '',
        guildId: '',
        token: '',
        presence: {
            status: 'online',
            activityType: 'none',
            bio: '',
            streamUrl: ''
        }
    },
    Commands: {
        forum: '',
        shop: '',
        topServers: '',
        discordSwat: '',
        discordPolice: '',
        workshop: '',
        credit: ''
    },
    GMod: {
        ip: '',
        connectCommand: ''
    },
    Roles: {
        banRoles: [],
        kickRoles: [],
        deleteConvRoles: [],
        adminRoles: [],
        acceptSuggestion: ''
    },
    Channels: {
        welcomeChannelId: '',
        leaveChannelId: '',
        suggestionsChannelId: '',
        ticketChannelId: '',
        staffChannelId: '',
        rolesChannelId: ''
    },
    Server: {
        logoUrl: '',
        bannerUrl: '',
        name: 'Mon serveur GMod',
        ticketSettings: {
            ticketPrefix: 'ticket-',
            panelDescription: 'Choisissez une catégorie pour ouvrir un ticket.'
        }
    },
    Tickets: {
        categories: [],
        settings: {
            maxTicketsPerUser: 1,
            allowMultipleInDifferentCategories: false,
            closeCooldownSeconds: 10,
            transcriptEnabled: true
        }
    }
};
