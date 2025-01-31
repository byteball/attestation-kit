const eventBus = require('ocore/event_bus.js');
const device = require('ocore/device');
const mutex = require('ocore/mutex.js');

const logger = require('../utils/logger');
const Validation = require('../utils/Validation');

const dictionary = require('../../dictionary');
const DbService = require('../db/DbService');

const walletSessionStore = require('./walletSessionStore');

module.exports = async (device_address, data) => {
    const unlock = await mutex.lock(device_address);

    await walletSessionStore.createSession(device_address); // Create a session for the device
    eventBus.emit('ATTESTATION_KIT_ATTESTATION_PROCESS_STARTED', device_address);

    if (typeof data === 'string' && (data.match(/-/g) || []).length === 1) { // data is in the format: address-data
        const [address, dataString] = data.split('-');

        let dataObject = {};

        try {
            const dataParams = new URLSearchParams(dataString);
            dataObject = Object.fromEntries(dataParams.entries());

            if (dataObject && !Validation.isDataObject(dataObject)) throw new Error('Invalid data object');
        } catch (err) {
            logger.error('Invalid data object:', err);
            unlock("unknown error");
            return device.sendMessageToDevice(device_address, 'text', dictionary.common.CANNOT_FIND_ORDER);
        }


        let order;

        try {
            order = await DbService.getAttestationOrders({ data: dataObject, address });

            if (!order) {
                unlock(dictionary.common.CANNOT_FIND_ORDER);
                return device.sendMessageToDevice(device_address, 'text', dictionary.common.CANNOT_FIND_ORDER);
            }
        } catch (error) {
            logger.error('Database query failed:', error);
            unlock(dictionary.common.CANNOT_FIND_ORDER);
            return device.sendMessageToDevice(device_address, 'text', dictionary.common.CANNOT_FIND_ORDER);
        }

        if (order.status === 'attested') {
            unlock(dictionary.wallet.ORDER_ALREADY_ATTESTED);
            return device.sendMessageToDevice(device_address, 'text', dictionary.wallet.ORDER_ALREADY_ATTESTED);
        }

        try {
            device.sendMessageToDevice(device_address, 'text', dictionary.wallet.ASK_VERIFY_FN(address, dataObject));

            eventBus.emit('ATTESTATION_KIT_ATTESTATION_PROCESS_STARTED_WITH_DATA', { device_address, data: dataObject });
        } catch (error) {
            logger.error('Error sending message to device:', error);

            return device.sendMessageToDevice(device_address, 'text', "Unknown error");
        } finally {
            unlock();
        }
    } else { // no data

        eventBus.emit('ATTESTATION_KIT_ATTESTATION_PROCESS_STARTED_WITHOUT_DATA', device_address);

        unlock();
    };
}
