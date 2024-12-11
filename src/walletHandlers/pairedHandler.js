const eventBus = require('ocore/event_bus.js');
const device = require('ocore/device');
const mutex = require('ocore/mutex.js');

const logger = require('../utils/logger');
const toUpperCaseFirstLetter = require('../utils/toUpperCaseFirstLetter');

const dictionary = require('../../dictionary');
const DbService = require('../db/DbService');

eventBus.on('paired', async (from_address, data) => {
    const unlock = await mutex.lock(from_address);
    logger.error('data', data);

    if (typeof data === 'string' && (data.match(/-/g) || []).length === 2) {
        const [provider, address, user_id, encodedUsername] = data.split('-');
        const username = decodeURIComponent(encodedUsername);

        let order;

        try {
            order = await DbService.getAttestationOrders({ serviceProvider: provider, userId: user_id, username, address });

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

        device.sendMessageToDevice(from_address, 'text', dictionary.wallet.ASK_VERIFY_FN(address, provider, user_id, encodeURIComponent(order.username)));
        unlock();
    } else if (typeof data === 'string') {
        device.sendMessageToDevice(from_address, 'text', dictionary.wallet.PAIRING_WELCOME);

        // const providers = Object.values(strategies).map(s => s.strategy);
        // device.sendMessageToDevice(from_address, 'text', `Please select social network to attest: \n${providers.map((provider) => `➡ [${toUpperCaseFirstLetter(provider)}](command:attest_${provider})`).join('\n')} `);
        unlock(dictionary.common.INVALID_DATA_FORMAT);
    } else {
        unlock(dictionary.common.INVALID_DATA_FORMAT);
        logger.error('Invalid data format received on pairing:', data);
        return device.sendMessageToDevice(from_address, 'text', dictionary.common.INVALID_DATA_FORMAT);
    }
});
