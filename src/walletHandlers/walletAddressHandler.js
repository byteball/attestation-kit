const eventBus = require('ocore/event_bus.js');
const device = require('ocore/device');

const { ErrorWithMessage } = require("../utils/ErrorWithMessage");
const Validation = require("../utils/Validation");
const walletSessionStore = require("./walletSessionStore");
const dictionary = require('../../dictionary');

module.exports = async (device_address, data) => {
    if (Validation.isWalletAddress(data)) {
        const wallet_address = data;

        const session = await walletSessionStore.getSession(device_address);

        if (!session) throw new ErrorWithMessage("Session not found. But It's impossible here");

        await walletSessionStore.setSessionWalletAddress(device_address, wallet_address);
        eventBus.emit('ATTESTATION_KIT_ADDED_ADDRESS', device_address, wallet_address);
    } else {
        return device.sendMessageToDevice(from_address, 'text', dictionary.common.INVALID_WALLET_ADDRESS);
    }
};
