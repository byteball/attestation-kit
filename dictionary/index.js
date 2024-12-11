/**
 * Dictionary module providing localized messages and prompts
 * @module dictionary
 * @property {Object} wallet - Wallet-related messages and prompts
 * @property {Object} common - Common messages shared across the application
 * @function addLocale - Add a new locale to the dictionary
 * @example
 * const { wallet, common } = require('./dictionary');
 * console.log(wallet.SIGN_MESSAGE_PROMPT);
 * console.log(common.INVALID_ADDRESS);
 */
const fs = require('fs');

const { Validation, logger } = require('../src/utils');
const { ErrorWithMessage } = require('../src/utils/ErrorWithMessage');

const locales = {
    wallet: require('./wallet.local'),
    common: require('./common.local'),
}

const setLocale = (provider) => {
    if (Validation.isServiceProvider(provider)) {
        const filename = provider + '.local.js';
        const path = process.cwd() + '/dictionary/' + filename;

        if (!fs.existsSync(path)) throw new ErrorWithMessage(`${filename} file is not in the dictionary folder`, { code: "FILE_NOT_FOUND" });

        locales[provider] = require(path);
        logger.info(`Locale set to ${provider}`);
    } else {
        throw new Error('Invalid service provider');
    }
}

module.exports = {
    ...locales,
    setLocale
}