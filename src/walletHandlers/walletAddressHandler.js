const device = require('ocore/device');

const { ErrorWithMessage } = require("../utils/ErrorWithMessage");
const Validation = require("../utils/Validation");
const walletSessionStore = require("./walletSessionStore");
// const strategies = require('../strategies/index');

module.exports = async (from_address, data) => {
    if (Validation.isWalletAddress(data)) {
        const session = walletSessionStore.getSession(from_address);

        if (!session) return;

        const provider = session.get('provider');

        if (provider) {
            const instruction = provider.getProviderInstruction(data);

            return device.sendMessageToDevice(from_address, 'text', instruction);
        } else {
            return device.sendMessageToDevice(from_address, 'text', 'Unknown provider! Please try another social network.');
        }

    } else {
        throw new ErrorWithMessage("Invalid wallet address.");
    }
};
