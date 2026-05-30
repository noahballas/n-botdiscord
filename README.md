Bot Discord — Communauté GMod

Configuration interactive (Version 3)

```bash
/config
```

Ouvre un panneau embed avec :

- Menu de navigation (Accueil, Serveur, GMod, Liens, Salons, Rôles, Tickets, Bot)
- Boutons → modals pour textes (nom, IP, URLs, token…)
- Menus salon / rôle pour assigner sans copier d’IDs
- Progression visuelle sur l’accueil
- Sauvegarde instantanée dans config.json

Panneau public

```bash
/config public:true
```

Affiche le panneau dans le salon (pour l’équipe staff). Préférez l’éphémère pour le token.

Installation (PC / VPS classique)

```bash
npm install
npm run setup
npm start
```

Installation sur Pterodactyl (panel hébergeur)

1. Créer un serveur avec l’œuf Node.js (Node 18 ou plus).
2. Envoyer tous les fichiers du bot dans le dossier du serveur (SFTP ou Git).
3. Onglet Startup du panel :
   - Additional Node packages (un package par ligne ou séparés par un espace) :

```
discord.js
@discordjs/rest
```

   - Commande de démarrage : `node index.js` (ou laisser `npm start` si l’œuf l’utilise déjà).
4. Démarrer le serveur une première fois (installation des paquets).
5. Console du panel, une seule fois :

```bash
npm run setup
```

6. Redémarrer le serveur. Le bot doit afficher « Connecté » dans les logs.
7. Sur Discord : `/config` pour finir salons, rôles et tickets (sans refaire le setup à chaque fois).

Notes Pterodactyl
- Ne mettez pas le token dans les variables d’environnement du panel si d’autres personnes y ont accès : préférez config.json via setup ou `/config`.
- Après une mise à jour des fichiers : redémarrage suffit ; relancez `npm run setup` seulement si vous changez token / guild.
- Si les commandes slash n’apparaissent pas : vérifiez Client ID et Guild ID dans `/config` → Bot, puis redémarrez.

Structure config

```
src/handlers/config/
  views.js      Embeds + composants par section
  router.js     Routage interactions cfg:*
  modals.js     Formulaires Discord
  session.js    État navigation / brouillons tickets
```

Support : noah_ballas — https://discord.gg/ka3cM9Avjm
