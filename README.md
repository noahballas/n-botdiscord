# Bot Discord — Communauté GMod

## Configuration interactive (style DraftBot)

```bash
/config
```

Ouvre un **panneau embed** avec :

- Menu de navigation (Accueil, Serveur, GMod, Liens, Salons, Rôles, Tickets, Bot)
- Boutons → **modals** pour textes (nom, IP, URLs, token…)
- Menus **salon / rôle** pour assigner sans copier d’IDs
- Progression visuelle sur l’accueil
- Sauvegarde instantanée dans `config.json`

### Panneau public

```bash
/config public:true
```

Affiche le panneau dans le salon (pour l’équipe staff). Préférez l’éphémère pour le **token**.

## Installation

```bash
npm install
npm run setup
npm start
```

## Structure config

```
src/handlers/config/
  views.js      Embeds + composants par section
  router.js     Routage interactions cfg:*
  modals.js     Formulaires Discord
  session.js    État navigation / brouillons tickets
```

Support : **noah_ballas** — https://discord.gg/ka3cM9Avjm
