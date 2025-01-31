const eventBus = require('ocore/event_bus.js');
const mutex = require('ocore/mutex.js');

const attestationStartHandler = require('./attestationStartHandler');

eventBus.on('paired', async (device_address, data) => {
    if (data === 'back') return;

    const unlock = await mutex.lock(device_address);
    await attestationStartHandler(device_address, data);

    return unlock();
});
