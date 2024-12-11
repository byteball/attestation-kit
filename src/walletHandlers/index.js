const eventBus = require('ocore/event_bus.js');
const network = require('ocore/network.js');
const headlessWallet = require('headless-obyte');
const logger = require('../utils/logger');

/**
 * Initializes wallet handlers and sets up event listeners.
 * @param {function} func - The function to execute after handlers are set up.
 */
module.exports = async (func) => {
    eventBus.once('headless_wallet_ready', async () => {
        try {
            headlessWallet.setupChatEventHandlers();

            logger.info(`Your wallet address is ${await headlessWallet.readFirstAddress()}`);

            eventBus.once('connected', async function (ws) {
                logger.info('Connected to hub');
                network.initWitnessesIfNecessary(ws, func);
            });

            require('./messageHandler');
            require('./pairedHandler');
        } catch (err) {
            logger.error('Failed in wallet initialization:', err);
            throw err;
        }
    });
}