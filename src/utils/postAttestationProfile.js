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

    if (!attestorAddress) throw new ErrorWithMessage('Attestor address not available', { code: "INVALID_ATTESTOR" })

    return new Promise((resolve, reject) => {
        function onError(err) {
            logger.error('(postAttestationProfile): ' + err);
            logger.error('(postAttestationProfile) userAddress: ' + userAddress);
            reject(err);
        }

        const network = require('ocore/network.js');
        const composer = require('ocore/composer.js');

        const sanitizedProfile = {
            ...profile
        };

        let objMessage = {
            app: "attestation",
            payload_location: "inline",
            payload: {
                address: userAddress,
                profile: sanitizedProfile
            }
        };

        let params = {
            paying_addresses: [attestorAddress],
            outputs: [{ address: attestorAddress, amount: 0 }],
            messages: [objMessage],
            signer: headlessWallet.signer,
            callbacks: composer.getSavingCallbacks({
                ifNotEnoughFunds: onError,
                ifError: onError,
                ifOk: function (objJoint) {
                    network.broadcastJoint(objJoint);

                    if (!objJoint?.unit?.unit || !Validation.isUnit(objJoint.unit.unit)) {
                        return onError('Invalid joint structure');
                    }

                    resolve(objJoint.unit.unit);
                }
            })
        };


        composer.composeJoint(params);
    });
}



module.exports = postAttestationProfile;
