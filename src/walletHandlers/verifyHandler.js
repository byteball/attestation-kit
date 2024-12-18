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
    let signedData;

    try {
        signedData = await getSignedData(deviceAddress, data);
    } catch (err) {
        logger.error('signedData(error)', err);
        return device.sendMessageToDevice(deviceAddress, 'text', dictionary.wallet.VALIDATION_FAILED);
    }


    const { message, data, senderWalletAddress, attestationWalletAddress } = signedData;

    if (!attestationWalletAddress || !senderWalletAddress || senderWalletAddress !== attestationWalletAddress) {
        return device.sendMessageToDevice(deviceAddress, 'text', dictionary.wallet.MISMATCH_ADDRESS);
    }

    logger.error('verify', message, data, senderWalletAddress);

    const order = await DbService.getAttestationOrders({ data, address: attestationWalletAddress, excludeAttested: true });

    logger.error('order', order);

    if (order) {
        logger.error('order', "YES");
    } else {
        logger.error('order', "NO");
        return device.sendMessageToDevice(deviceAddress, 'text', dictionary.common.CANNOT_FIND_ORDER);
    }

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