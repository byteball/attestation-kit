const headlessWallet = require('headless-obyte');

const logger = require('../utils/logger');
const Validation = require('./Validation');
const { ErrorWithMessage } = require('./ErrorWithMessage');

/**
 * Posts an attestation profile to the DAG.
 * @param {string} userAddress - The user's wallet address.
 * @param {object} profile - The data to attest (maximum 4 key-value pairs).
 * @throws {ErrorWithMessage} Throws an error if any validation fails. (INVALID_ADDRESS, INVALID_DATA, INVALID_ATTESTOR)
 * @returns {Promise<string>} Resolves with the unit ID of the posted attestation.
 */
async function postAttestationProfile(userAddress, profile) {
    const attestorAddress = await headlessWallet.readFirstAddress();

    if (!Validation.isWalletAddress(userAddress)) {
        throw new ErrorWithMessage('Invalid address', { code: "INVALID_ADDRESS" });
    }

    if (!Validation.isDataObject(profile)) {
        throw new ErrorWithMessage('Invalid data object', { code: "INVALID_DATA" });
    }

    // replace numbers with strings so that they get into the attested_fields table
    let attestedProfile = {};
    for (let name in profile) {
        const value = profile[name];
        attestedProfile[name] = typeof value === 'number' ? (value + '') : value;
    }

    if (!attestorAddress) throw new ErrorWithMessage('Attestor address not available', { code: "INVALID_ATTESTOR" })

    const { unit: attestationUnit } = await headlessWallet.sendMultiPayment({
        messages: [{
            app: 'attestation',
            payload_location: "inline",
            payload: {
                address: userAddress,
                profile: attestedProfile,
            }
        }]
    });

    if (!attestationUnit) throw new ErrorWithMessage('failed to post attestation profile');

    logger.info(`attestation profile posted for ${userAddress} with unit ${attestationUnit}`);

    return attestationUnit;
}



module.exports = postAttestationProfile;
