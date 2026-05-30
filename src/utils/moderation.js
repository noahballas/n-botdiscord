async function fetchGuildMember(guild, userId) {
    return guild.members.fetch({ user: userId, force: true }).catch(() => null);
}

function validateModerationTarget(actor, targetMember, targetUserId) {
    if (targetUserId === actor.id) {
        return '❌ Action impossible sur vous-même.';
    }
    if (!targetMember) {
        return '❌ Ce membre n\'est pas sur le serveur.';
    }
    if (targetMember.roles.highest.position >= actor.roles.highest.position) {
        return '❌ Rôle égal ou supérieur au vôtre.';
    }
    return null;
}

module.exports = { fetchGuildMember, validateModerationTarget };
