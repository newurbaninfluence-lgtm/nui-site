// monty-sms.js — Legacy webhook alias
// The "monty" webhook in OpenPhone (created Feb 27) points to this URL.
// Forward everything to sms-monty which is the current handler.
const { handler } = require('./sms-monty');
exports.handler = handler;
