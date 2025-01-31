const eventBus = require('ocore/event_bus.js');
const attestationEntryHandler = require('./attestationEntryHandler');

eventBus.on('paired', async (from_address, data) => {
    if (data === 'back') return;

    await attestationEntryHandler(from_address, data);
});
