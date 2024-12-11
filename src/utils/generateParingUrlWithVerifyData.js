const conf = require('ocore/conf.js');
const device = require('ocore/device');

const { ErrorWithMessage } = require('./ErrorWithMessage');
const Validation = require('./Validation');

/**
 * Generates a pairing URL with verification data for the user.
 * @param {string} service_provider - The name of the service provider.
 * @param {string} address - The user's wallet address.
 * @param {Object} data - Key-value pairs of user data to be verified (e.g. {username: "john", user_id: "123"})
 * @returns {string} The pairing URL in format: obyte[-tn]:<pubkey>@<hub>#<provider>-<address>-<userid>-<username>
 * @example
 * generateParingUrlWithVerifyData("github", "ADDR123", {username: "john"})
 * // returns: obyte:PUBKEY@hub#github-ADDR123-username=john
 * @throws {ErrorWithMessage} Throws an error if any validation fails.
 */

module.exports = (service_provider, address, data) => {
    const publicKey = device.getMyDevicePubKey();

    if (Validation.isWalletAddress(address)) {
        if (!Validation.isServiceProvider(service_provider)) {
            throw new ErrorWithMessage('Invalid service provider', { code: "INVALID_SERVICE_PROVIDER" });
        }

        if (!Validation.isDataObject(data)) {
            throw new ErrorWithMessage('Invalid data', { code: "INVALID_DATA" });
        }

        const sanitizedProvider = encodeURIComponent(service_provider);
        const sanitizedAddress = encodeURIComponent(address);

        const sanitizedDataObject = new URLSearchParams(data).toString();

        return `obyte${conf.testnet ? '-tn' : ''}:${publicKey}@${conf.hub}#${sanitizedProvider}-${sanitizedAddress}-${sanitizedDataObject}`;
    } else {
        throw new ErrorWithMessage('Invalid address', { code: "INVALID_ADDRESS" });
    }
}