const eventBus = require('ocore/event_bus.js');
const mutex = require('ocore/mutex.js');
const device = require('ocore/device');

const verifyHandler = require("./verifyHandler");

const walletAddressHandler = require('./walletAddressHandler');
const walletSessionStore = require('./walletSessionStore');
const attestationRequestHandler = require('./attestationRequestHandler');

eventBus.on('text', async (device_address, data) => {
    const unlock = await mutex.lock(device_address);
    const session = await walletSessionStore.getSession(device_address)

    try {
        if (data.trim().startsWith("[Signed message]")) { // User send signed message
            await verifyHandler(device_address, data);
        } else if (data === "attest") {
            await attestationRequestHandler(device_address);
        } else if (session) {
            await walletAddressHandler(device_address, String(data).trim());
        } else {
            device.sendMessageToDevice(device_address, 'text', dictionary.common.UNKNOWN_COMMAND);
            return device.sendMessageToDevice(device_address, 'text', `Please use [attest](command:attest) to start the attestation process.`);
        }
    } finally {
        return unlock();
    }
});
