const escape = require('lodash/escape');

const { ErrorWithMessage } = require('../src/utils/ErrorWithMessage');
const { logger, Validation } = require('../src/utils');

const DbService = require('../src/db/DbService');

/**
 * BaseStrategy class serves as a foundational component for implementing different strategies.
 * @abstract
 */
class BaseStrategy {
    /**
     * Regular expression to validate wallet address formats.
     * @type {RegExp}
     */
    static ADDRESS_REGEX = /^[A-Za-z0-9]{32}$/;

    /**
     * @param {Object} options Strategy configuration options
     * @throws {ErrorWithMessage} Throws an error if the name is not a non-empty string or if the 'domain' environment variable is not set.
    */
    constructor(options) {
        const provider = new.target.provider;

        if (!provider || typeof provider !== 'string' || provider.endsWith('Strategy')) throw new ErrorWithMessage('Strategy name must be a non-empty string; please provide a name for the strategy like static provider = "providerName"');
        if (!process.env.domain) throw new ErrorWithMessage('Domain is not provided');

        this.provider = provider;
        this.options = options;

        this.validate = Validation;
        this.db = DbService;
        this.logger = logger;
        this.init();
    }

    /**
     *  Provides instructions for the user to follow. This method must be implemented by all derived classes.
     * @abstract
     * @throws {ErrorWithMessage} When called directly on BaseStrategy
     * @returns {void}
     */
    static getProviderInstruction() {
        throw new ErrorWithMessage(`${this.strategy}: getProviderInstruction method is not implemented`);
    }

    /**
     * Initialize the strategy. This method must be implemented by all derived classes.
     * @abstract
     * @throws {ErrorWithMessage} When called directly on BaseStrategy
     * @returns {void}
     */
    init() {
        throw new ErrorWithMessage(`${this.provider}: init method is not implemented`);
    }

    /**
     * Constructs the verification URL for the user to verify their wallet address.
     * @param {string} address - The wallet address.
     * @param {string} serviceProvider - The name of the service provider.
     * @param {string} userId - The user's unique identifier.
     * @param {string} username - The user's username.
     * @returns {string} The verification URL.
     * @throws {ErrorWithMessage} Throws an error if the address or service provider is invalid.
     */
    getVerifyUrl(address, serviceProvider, data) {
        if (Validation.isWalletAddress(address) && Validation.isServiceProvider(serviceProvider) && Validation.isDataObject(data)) {
            const sanitizedDataObject = new URLSearchParams(data).toString();
            return `${process.env.domain}/verify/${serviceProvider}/${address}/?data=${sanitizedDataObject}`;
        } else {
            throw new ErrorWithMessage('Invalid Data', { address, serviceProvider, address, userId, code: 'INVALID_DATA' });
        }
    }

    static escapeHtml(unsafe = '') {
        return escape(unsafe);
    }
}

module.exports = BaseStrategy;
