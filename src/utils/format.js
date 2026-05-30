function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30.44);
    const years = Math.floor(months / 12);

    const parts = [];
    if (years > 0) parts.push(`${years} an${years > 1 ? 's' : ''}`);
    if (months % 12 > 0) parts.push(`${months % 12} mois`);
    if (days % 30 > 0 && months < 3) parts.push(`${days % 30} jour${days % 30 > 1 ? 's' : ''}`);

    return parts.join(' ') || 'quelques heures';
}

module.exports = { formatDuration };
