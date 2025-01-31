const conf = require('ocore/conf.js');
const device = require('ocore/device');

const { ErrorWithMessage } = require('./ErrorWithMessage');
const Validation = require('./Validation');

/**
 * Generates a pairing URL with verification data for the user.
 * @param {string} address - The user's wallet address.
 * @param {Object} data - Key-value pairs of user data to be verified (e.g. {username: "john", user_id: "123"})
 * @returns {string} The pairing URL in format: obyte[-tn]:<pubkey>@<hub>#<address>-<userid>-<username>
 * @example
 * generateParingUrlWithVerifyData("ADDR123", {username: "john"})
 * @throws {ErrorWithMessage} Throws an error if any validation fails.
 */

module.exports = (address, data) => {
    const publicKey = device.getMyDevicePubKey();

    if (Validation.isWalletAddress(address)) {
        if (!Validation.isDataObject(data)) {
            throw new ErrorWithMessage('Invalid data', { code: "INVALID_DATA" });
        }

        const sanitizedAddress = encodeURIComponent(address);

        const sanitizedDataObject = new URLSearchParams(data).toString();

        return `obyte${conf.testnet ? '-tn' : ''}:${publicKey}@${conf.hub}#${sanitizedAddress}-${sanitizedDataObject}`;
    } else {
        throw new ErrorWithMessage('Invalid address', { code: "INVALID_ADDRESS" });
    }
}
