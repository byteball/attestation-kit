const conf = require('ocore/conf.js');
const device = require('ocore/device');

/**
 * Generates a pairing URL
 * @returns {string} The pairing URL in format: obyte[-tn]:<pubkey>@<hub>#back
 * @example
 * generateParingBackUrl()
 * // returns: obyte:PUBKEY@hub#back
 */
module.exports = () => {
    const publicKey = device.getMyDevicePubKey();

    return `obyte${conf.testnet ? '-tn' : ''}:${publicKey}@${conf.hub}#back`;
}