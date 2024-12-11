/**
 * @fileoverview Handles wallet verification requests through the event bus
 * @module walletHandlers/verifyHandler
 */

const device = require('ocore/device');

const DbService = require('../db/DbService');
const dictionary = require('../dictionary');

const postAttestationProfile = require('../utils/postAttestationProfile');
const logger = require('../utils/logger');

module.exports = async (from_address, data) => {
    const arrSignedMessageMatches = data.match(/\(signed-message:(.+?)\)/);

    if (!arrSignedMessageMatches || arrSignedMessageMatches.length < 2) {
        return device.sendMessageToDevice(from_address, 'text', dictionary.wallet.INVALID_FORMAT_SIGNED_MESSAGE);
    }

    const signedMessageBase64 = arrSignedMessageMatches[1];
    const signedMessageJson = Buffer.from(signedMessageBase64, 'base64').toString('utf8');
    let objSignedMessage;

    try {
        objSignedMessage = JSON.parse(signedMessageJson);

    } catch (err) {
        logger.error(err);
        return device.sendMessageToDevice(from_address, 'text', 'Unknown error! Please try again.');
    }

    const validation = require('ocore/validation.js');

    validation.validateSignedMessage(objSignedMessage, async err => {

        if (err) return device.sendMessageToDevice(from_address, 'text', dictionary.wallet.VALIDATION_FAILED);

        if (!objSignedMessage.authors || objSignedMessage.authors.length === 0) {
            return device.sendMessageToDevice(from_address, 'text', dictionary.wallet.VALIDATION_FAILED);
        }


        const { signed_message, authors: [{ address: walletAddress }] } = objSignedMessage;

        try {
            const signedData = JSON.parse(signed_message);

            const { username, provider, id, address } = signedData;

            if (walletAddress || !address) {
                if (walletAddress === address) {
                    const order = await DbService.getAttestationOrders({ serviceProvider: provider, data: { userId: id, username }, address });

                    if (order) {
                        if (order.status === 'attested') {
                            return device.sendMessageToDevice(from_address, 'text', dictionary.common.ALREADY_ATTESTED(provider, username, id, walletAddress));
                        }

                        if (username === order.username && provider === order.service_provider) {

                            device.sendMessageToDevice(from_address, 'text', 'Your data was attested successfully! We will send you unit later.');

                            try {
                                const profile = {
                                    username: order.username,
                                    user_id: order.user_id,
                                    provider: order.service_provider,
                                }

                                const unit = await postAttestationProfile(profile, address);

                                await DbService.updateUnitAndChangeStatus(provider, {userId, username}, address, unit);

                                // try {
                                //     if (provider === 'telegram') {
                                //         TelegramMessageEmitter.emit("sendMessage", { userId: id, message: `Attestation unit: <a href="https://${conf.testnet ? 'testnet' : ''}explorer.obyte.org/${encodeURIComponent(unit)}">${unit}</a>` });
                                //     }
                                // } catch (err) {
                                //     logger.error('Cannot send message to user via Telegram:', err);
                                // }

                                return device.sendMessageToDevice(from_address, 'text', `Attestation unit: ${unit}`);

                            } catch (err) {
                                logger.error('Error in postAttestation:', err);
                                return device.sendMessageToDevice(from_address, 'text', 'Unknown error! Please try again.');
                            }

                        } else {
                            return device.sendMessageToDevice(from_address, 'text', dictionary.wallet.MISMATCH_DATA);
                        }
                    } else {
                        return device.sendMessageToDevice(from_address, 'text', dictionary.common.CANNOT_FIND_ORDER);
                    }
                } else {
                    return device.sendMessageToDevice(from_address, 'text', dictionary.wallet.MISMATCH_ADDRESS);
                }
            } else {
                return device.sendMessageToDevice(from_address, 'text', dictionary.wallet.SIGNED_MSG_MISS_ADDRESS);
            }
        } catch (err) {
            logger.error('Error in signed message:', err);
            return device.sendMessageToDevice(from_address, 'text', dictionary.wallet.INVALID_FORMAT_SIGNED_MESSAGE);
        }
    });
};