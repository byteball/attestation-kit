const eventBus = require('ocore/event_bus.js');
const mutex = require('ocore/mutex.js');

const attestationEntryHandler = require('./attestationEntryHandler');

eventBus.on('paired', async (device_address, data) => {
    if (data === 'back') return;

    const unlock = await mutex.lock(device_address);
    await attestationEntryHandler(device_address, data);

    return unlock();
});
