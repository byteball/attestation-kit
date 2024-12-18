/**
 * @fileoverview Handles wallet verification requests through the event bus
 * @module walletHandlers/verifyHandler
 */

const { isEmpty } = require('lodash');
const device = require('ocore/device');
const eventBus = require('ocore/event_bus.js');

const DbService = require('../db/DbService');
const dictionary = require('../../dictionary');

const { logger, getSignedData, postAttestationProfile } = require('../utils');


module.exports = async (deviceAddress, msgData) => {
    let signedData;

    try {
        signedData = await getSignedData(deviceAddress, msgData);
    } catch (err) {
        logger.error('signedData(error)', err);
        return device.sendMessageToDevice(deviceAddress, 'text', dictionary.wallet.VALIDATION_FAILED);
    }

    const { message, data, senderWalletAddress, attestationWalletAddress } = signedData;

    if (!attestationWalletAddress || !senderWalletAddress || senderWalletAddress !== attestationWalletAddress) {
        return device.sendMessageToDevice(deviceAddress, 'text', dictionary.wallet.MISMATCH_ADDRESS);
    }

    const order = await DbService.getAttestationOrders({ data, address: attestationWalletAddress, excludeAttested: true });

    if (order) {
        if (isEmpty(data)) {
            eventBus.emit('ATTESTATION_KIT_ATTESTED_ONLY_ADDRESS', { address: attestationWalletAddress, device_address: deviceAddress });
        } else {
            device.sendMessageToDevice(deviceAddress, 'text', 'Your data was attested successfully! We will send you unit.');

            const unit = await postAttestationProfile(attestationWalletAddress, data);

            await DbService.updateUnitAndChangeStatus(data, attestationWalletAddress, unit);

            eventBus.emit('ATTESTATION_KIT_ATTESTED', { address: attestationWalletAddress, unit, data, device_address: deviceAddress });
        }
    } else {
        return device.sendMessageToDevice(deviceAddress, 'text', dictionary.common.CANNOT_FIND_ORDER);
    }
};