/** @type {Map<string, import('./session').ConfigSession>} */
const sessions = new Map();

/**
 * @typedef {Object} ConfigSession
 * @property {string} ownerId
 * @property {string} view
 * @property {string} [linkKey]
 * @property {string} [roleList]
 * @property {string} [channelSlot]
 * @property {string} [ticketPreset]
 * @property {string} [ticketRoleId]
 * @property {string} [ticketCategoryId]
 * @property {string} [ticketCustomLabel]
 * @property {string} [ticketCustomDescription]
 * @property {string} [ticketMode]
 * @property {string} [ticketEditIndex]
 */

function bindMessage(messageId, ownerId, view) {
    sessions.set(messageId, { ownerId, view });
}

function getSession(messageId) {
    return sessions.get(messageId);
}

function patchSession(messageId, patch) {
    const s = sessions.get(messageId);
    if (s) Object.assign(s, patch);
    return s;
}

function setView(messageId, view) {
    patchSession(messageId, { view });
}

function setLinkPick(messageId, linkKey) {
    patchSession(messageId, { linkKey });
}

function setRoleList(messageId, roleList) {
    patchSession(messageId, { roleList });
}

function setChannelSlot(messageId, channelSlot) {
    patchSession(messageId, { channelSlot });
}

function setTicketPending(messageId, patch) {
    return patchSession(messageId, patch);
}

function clearTicketPending(messageId) {
    patchSession(messageId, {
        ticketPreset: undefined,
        ticketRoleId: undefined,
        ticketCategoryId: undefined,
        ticketCustomLabel: undefined,
        ticketCustomDescription: undefined,
        ticketEditIndex: undefined
    });
}

module.exports = {
    bindMessage,
    getSession,
    patchSession,
    setView,
    setLinkPick,
    setRoleList,
    setChannelSlot,
    setTicketPending,
    clearTicketPending
};
