const eventBus = require('ocore/event_bus.js');
const mutex = require('ocore/mutex.js');

const Validation = require('../utils/Validation');

const verifyHandler = require("./verifyHandler");

const walletAddressHandler = require('./walletAddressHandler');
const walletSessionStore = require('./walletSessionStore');

eventBus.on('text', async (from_address, data) => {
    const unlock = await mutex.lock(from_address);

    try {
        if (data.trim().startsWith("[Signed message]")) { // User send signed message
            await verifyHandler(from_address, data);
        } else if (Validation.isWalletAddress(String(data).trim()) && walletSessionStore.getSession(from_address)) { // User send wallet address
            await walletAddressHandler(from_address, String(data).trim());
        } 
    } finally {
        return unlock();
    }
});
