/**
 * @fileoverview Handles wallet verification requests through the event bus
 * @module walletHandlers/verifyHandler
 */

const device = require('ocore/device');
const eventBus = require('ocore/event_bus.js');
const conf = require('ocore/conf');

const DbService = require('../db/DbService');
const dictionary = require('../../dictionary');

const postAttestationProfile = require('../utils/postAttestationProfile');
const logger = require('../utils/logger');
const Validation = require('../utils/Validation');
const getSignedData = require('../utils/getSignedData');

const transformDataValuesToObject = require('../utils/transformDataValuesToObject');
const { isEqual, isEmpty } = require('lodash');

module.exports = async (deviceAddress, data) => {
    console.error('test1')
    try {
        this.logger.error('signedData(start)');
        const signedData = await getSignedData(deviceAddress, data);
        this.logger.error('signedData(result)', signedData);
    } catch (err) {
        this.logger.error('signedData(error)', err);
    }

    // const arrSignedMessageMatches = data.match(/\(signed-message:(.+?)\)/);

    // if (!arrSignedMessageMatches || arrSignedMessageMatches.length < 2) {
    //     return device.sendMessageToDevice(deviceAddress, 'text', dictionary.wallet.INVALID_FORMAT_SIGNED_MESSAGE);
    // }

    // const signedMessageBase64 = arrSignedMessageMatches[1];
    // const signedMessageJson = Buffer.from(signedMessageBase64, 'base64').toString('utf8');
    // let objSignedMessage;

    // try {
    //     objSignedMessage = JSON.parse(signedMessageJson);
    // } catch (err) {
    //     logger.error(err);
    //     return device.sendMessageToDevice(deviceAddress, 'text', 'Unknown error! Please try again.');
    // }

    // const validation = require('ocore/validation.js');

    // validation.validateSignedMessage(objSignedMessage, async err => {
    //     if (err) return device.sendMessageToDevice(deviceAddress, 'text', dictionary.wallet.VALIDATION_FAILED);

    //     if (!objSignedMessage.authors || objSignedMessage.authors.length === 0) {
    //         return device.sendMessageToDevice(deviceAddress, 'text', dictionary.wallet.VALIDATION_FAILED);
    //     }

    //     const { signed_message, authors: [{ address: senderWalletAddress }] } = objSignedMessage;

    //     try {
    //         const signedData = JSON.parse(signed_message.trim());
    //         const { message, ...data } = signedData;
    //         let attestationWalletAddress = data.address;

    //         // get and validate address
    //         if (message && message.includes('I own the address:')) {
    //             attestationWalletAddress = message.replace('I own the address: ', '').trim();

    //             if (!Validation.isWalletAddress(attestationWalletAddress)) {
    //                 return device.sendMessageToDevice(deviceAddress, 'text', dictionary.wallet.INVALID_FORMAT_SIGNED_MESSAGE);
    //             }
    //         }

    //         if (!attestationWalletAddress || !senderWalletAddress || senderWalletAddress !== attestationWalletAddress) {
    //             return device.sendMessageToDevice(deviceAddress, 'text', dictionary.wallet.MISMATCH_ADDRESS);
    //         }

    //         const order = await DbService.getAttestationOrders({ data, address: attestationWalletAddress });

    //         if (order) {
    //             if (order.status === 'attested') {
    //                 return device.sendMessageToDevice(deviceAddress, 'text', dictionary.common.ALREADY_ATTESTED(senderWalletAddress, { username, userId: id }));
    //             }

    //             if (isEqual(transformDataValuesToObject(order), data)) {

    //                 device.sendMessageToDevice(deviceAddress, 'text', 'Your data was attested successfully! We will send you unit.');

    //                 try {
    //                     const unit = await postAttestationProfile(attestationWalletAddress, data);

    //                     await DbService.updateUnitAndChangeStatus(data, attestationWalletAddress, unit);

    //                     eventBus.emit('ATTESTATION_KIT_ATTESTED', { address: attestationWalletAddress, unit, data, device_address: deviceAddress });
    //                 } catch (err) {
    //                     logger.error('Error in postAttestation:', err);
    //                     return device.sendMessageToDevice(deviceAddress, 'text', 'Unknown error! Please try again.');
    //                 }

    //             } else {
    //                 return device.sendMessageToDevice(deviceAddress, 'text', dictionary.wallet.MISMATCH_DATA);
    //             }
    //         } else if (isEmpty(data)) {
    //             return eventBus.emit('ATTESTATION_KIT_ATTESTED_ONLY_ADDRESS', { address: attestationWalletAddress, device_address: deviceAddress });
    //         } else {
    //             return device.sendMessageToDevice(deviceAddress, 'text', dictionary.common.CANNOT_FIND_ORDER);
    //         }
    //     } catch (err) {
    //         logger.error('Error in signed message:', err);
    //         return device.sendMessageToDevice(deviceAddress, 'text', dictionary.wallet.INVALID_FORMAT_SIGNED_MESSAGE);
    //     }
    // });
};