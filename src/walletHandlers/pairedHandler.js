const eventBus = require('ocore/event_bus.js');
const device = require('ocore/device');
const mutex = require('ocore/mutex.js');

const logger = require('../utils/logger');
const Validation = require('../utils/Validation');

const dictionary = require('../../dictionary');
const DbService = require('../db/DbService');

const walletSessionStore = require('./walletSessionStore');

eventBus.on('paired', async (from_address, data) => {
    const unlock = await mutex.lock(from_address);

    if (typeof data === 'string' && (data.match(/-/g) || []).length === 2) {
        const [provider, address, dataString] = data.split('-');

        let dataObject = {};

        try {
            const dataParams = new URLSearchParams(dataString);
            dataObject = Object.fromEntries(dataParams.entries());

            if (dataObject && !Validation.isDataObject(dataObject)) throw new Error('Invalid data object');
        } catch (err) {
            logger.error('Invalid data object:', err);
            unlock("unknown error");
            return device.sendMessageToDevice(from_address, 'text', dictionary.common.CANNOT_FIND_ORDER);
        }


        let order;

        try {
            order = await DbService.getAttestationOrders({ serviceProvider: provider, data: dataObject, address });

            if (!order) {
                unlock(dictionary.common.CANNOT_FIND_ORDER);
                return device.sendMessageToDevice(from_address, 'text', dictionary.common.CANNOT_FIND_ORDER);
            }
        } catch (error) {
            logger.error('Database query failed:', error);
            unlock(dictionary.common.CANNOT_FIND_ORDER);
            return device.sendMessageToDevice(from_address, 'text', dictionary.common.CANNOT_FIND_ORDER);
        }

        if (order.status === 'attested') {
            unlock(dictionary.wallet.ORDER_ALREADY_ATTESTED);
            return device.sendMessageToDevice(from_address, 'text', dictionary.wallet.ORDER_ALREADY_ATTESTED);
        }

        device.sendMessageToDevice(from_address, 'text', dictionary.wallet.ASK_VERIFY_FN(address, { provider, ...dataObject }));

        eventBus.emit('ATTESTATION_KIT_WALLET_PAIRED_WITH_DATA', { device_address: from_address, provider, data: dataObject });

        unlock();
    } else {
        console.error('data', data);
        walletSessionStore.createSession(from_address);

        device.sendMessageToDevice(from_address, 'text', dictionary.common.WELCOME);
        device.sendMessageToDevice(from_address, 'text', dictionary.wallet.ASK_ADDRESS);

        eventBus.emit('ATTESTATION_KIT_JUST_WALLET_PAIRED', { device_address: from_address, provider, });

        unlock();
    };
});
