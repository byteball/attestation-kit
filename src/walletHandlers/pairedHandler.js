const eventBus = require('ocore/event_bus.js');
const attestationEntryHandler = require('./attestationEntryHandler');

eventBus.on('paired', (device_address, data) => {
    if (data === 'back') return;

    attestationEntryHandler(device_address, data);
});
