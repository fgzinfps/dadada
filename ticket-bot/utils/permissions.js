const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

function isAdmin(member) {
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.permissions.has(PermissionFlagsBits.ManageGuild)
  );
}

function isStaff(member) {
  return isAdmin(member) || config.staffRoleIds.some((id) => member.roles.cache.has(id));
}

module.exports = { isAdmin, isStaff };
