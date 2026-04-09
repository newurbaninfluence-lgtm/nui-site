// monty-sms.js — EMERGENCY STOP — re-routes after fix deploys
exports.handler = async () => ({ statusCode: 200, body: JSON.stringify({ paused: true }) });
