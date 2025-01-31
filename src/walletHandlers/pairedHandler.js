const eventBus = require('ocore/event_bus.js');
const mutex = require('ocore/mutex.js');

const attestationRequestHandler = require('./attestationRequestHandler');

eventBus.on('paired', async (device_address, data) => {
    if (data === 'back') return;

    const unlock = await mutex.lock(device_address);
    await attestationRequestHandler(device_address, data);

    return unlock();
});
