const fs = require('fs');
const path = require('path');

function walkFiles(dir, filter = () => true) {
    const results = [];
    if (!fs.existsSync(dir)) return results;

    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            results.push(...walkFiles(full, filter));
        } else if (filter(full, entry)) {
            results.push(full);
        }
    }
    return results;
}

function loadCommands(client, commandsRoot) {
    const payloads = [];

    for (const file of walkFiles(commandsRoot, (p) => p.endsWith('.js'))) {
        const command = require(file);
        if (!command?.data?.name || typeof command.execute !== 'function') continue;
        client.commands.set(command.data.name, command);
        payloads.push(command.data.toJSON());
    }

    client.commandPayloads = payloads;
    return payloads;
}

function registerEvents(client, eventsRoot) {
    for (const file of walkFiles(eventsRoot, (p) => p.endsWith('.js'))) {
        const event = require(file);
        if (!event?.name || typeof event.execute !== 'function') continue;

        const runner = (...args) => event.execute(...args, client);
        if (event.once) client.once(event.name, runner);
        else client.on(event.name, runner);
    }
}

module.exports = { walkFiles, loadCommands, registerEvents };
