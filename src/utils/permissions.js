const { PermissionFlagsBits } = require('discord.js');
const config = require('../config/manager');

function hasAnyRole(member, roleIds) {
    if (!Array.isArray(roleIds) || roleIds.length === 0) return false;
    return member.roles.cache.some((role) => roleIds.includes(role.id));
}

function hasRole(member, roleId) {
    return Boolean(roleId && member.roles.cache.has(roleId));
}

function isConfigAdmin(member) {
    const roles = config.get().Roles;
    if (hasAnyRole(member, roles.adminRoles)) return true;
    return member.permissions.has(PermissionFlagsBits.Administrator);
}

function canBan(member) {
    return hasAnyRole(member, config.get().Roles.banRoles);
}

function canKick(member) {
    const roles = config.get().Roles;
    const allowed = roles.kickRoles?.length ? roles.kickRoles : roles.banRoles;
    return hasAnyRole(member, allowed);
}

function canDeleteMessages(member) {
    const roles = config.get().Roles;
    const allowed = roles.deleteConvRoles?.length ? roles.deleteConvRoles : roles.adminRoles;
    return hasAnyRole(member, allowed);
}

function canModerateSuggestions(member) {
    const roleId = config.get().Roles.acceptSuggestion;
    return hasRole(member, roleId) || isConfigAdmin(member);
}

module.exports = {
    hasAnyRole,
    hasRole,
    isConfigAdmin,
    canBan,
    canKick,
    canDeleteMessages,
    canModerateSuggestions
};
