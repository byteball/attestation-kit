const dag = require('aabot/dag.js');
const headlessWallet = require('headless-obyte');
const conf = require('ocore/conf.js');

const dbService = require('./db');
const logger = require('./utils/logger');

module.exports = async (func = () => { }) => {
    if (typeof func !== 'function') {
        logger.error('typeof func isn\'t a function', typeof func);
        throw new TypeError('Argument must be a function');
    }

    return new Promise((resolve, reject) => {
        require('./walletHandlers')(async () => {
            try {
                logger.info('Starting obyte attestation service...');
                await dbService.initialize();

                const attestorAddress = await headlessWallet.readFirstAddress();
                if (!attestorAddress) throw new Error('failed to retrieve attestor address');

                const balances = await dag.readBalance(attestorAddress);
                if (!balances) throw new Error('failed to retrieve balance information');

                const gbyteBalance = balances?.base?.stable ?? 0;
                const minimumBalance = conf.minAttestorBalanceForStart ?? 1e6;

                logger.info(`Attestor balance(${attestorAddress}): ${gbyteBalance / 1e9} GBYTE`);

                if (gbyteBalance < minimumBalance) {
                    throw new Error(`Attestor balance is too low. Please, fund the attestor address. Min balance: ${minimumBalance / 1e9} GBYTE. You can change it in the config file.`);
                }

                const result = await func();
                resolve(result);
            } catch (error) {
                logger.error('Service initialization failed:', error);
                reject(error);
            }
        });
    });
}

process.on('unhandledRejection', up => { throw up });
