const clc = require('cli-color');

/**
+ * Logger utility providing color-coded console output
+ * @module logger
+ */

/**
 * Internal logging function that formats and outputs colored log messages
 * @param {string} type - The type of log ('log', 'info', or 'error')
 * @param {string} color - The color to use from cli-color
 * @param {any[]} message - The message parts to log
 */
const loggerFunc = (type, color, ...message) => {
    if (!['log', 'info', 'error'].includes(type)) {
        throw new Error(`Invalid log type: ${type}`);
    }

    if (!Array.isArray(message)) {
        throw new Error('Message must be an array');
    }

    console.error(clc[color].bold(`[${type}]: `, ...message.map((v) => typeof v === 'object' ? JSON.stringify(v) : v)));
}

/** @type {(...message: any[]) => void} */
const log = (...message) => loggerFunc('log', 'green', ...message);

/** @type {(...message: any[]) => void} */
const info = (...message) => loggerFunc('info', 'blue', ...message);

/** @type {(...message: any[]) => void} */
const error = (...message) => loggerFunc('error', 'red', ...message);

module.exports = {
    log,
    info,
    error,
}