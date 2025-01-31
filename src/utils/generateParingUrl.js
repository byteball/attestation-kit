const conf = require('ocore/conf.js');
const device = require('ocore/device');

/**
 * Generates a bot pairing URL.
 * @returns {string} The pairing URL in format: obyte[-tn]:<pubkey>@<hub>#
 * @example
 * const botPairingUrl = generateParingUrl();
 * @throws {ErrorWithMessage} Throws an error if any validation fails.
 */

module.exports = () => {
    const publicKey = device.getMyDevicePubKey();

    return `obyte${conf.testnet ? '-tn' : ''}:${publicKey}@${conf.hub}#0000`;
}
