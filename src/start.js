const dbService = require('./db');
const logger = require('./utils/logger');

module.exports = async (func = () => { }) => {
    if (typeof func !== 'function') {
        logger.error('typeof func isn\'t a function', typeof func);
        throw new TypeError('Argument must be a function');
    }

    require('./walletHandlers')(async () => {
        logger.info('Starting obyte attestation service...');

        await dbService.initialize();

        return await func();
    });
}

process.on('unhandledRejection', up => { throw up });
