const escape = require('lodash/escape');
const eventBus = require('ocore/event_bus.js');

const walletSessionStore = require('./walletHandlers/walletSessionStore');
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
        if (!process.env.domain) throw new ErrorWithMessage('Domain is not provided');

        this.options = options;

        this.sessionStore = walletSessionStore;
        this.validate = Validation;
        this.db = DbService;
        this.logger = logger;
        this.init();

        // Event listeners
        eventBus.on('ATTESTATION_KIT_ATTESTATION_PROCESS_STARTED', async (device_address) => {
            if (this.onAttestationProcessStarted) {
                this.onAttestationProcessStarted(device_address);
            }
        });

        eventBus.on('ATTESTATION_KIT_ATTESTATION_PROCESS_STARTED_WITHOUT_DATA', async (device_address) => {
            if (this.onAttestationProcessStartedWithoutData) {
                this.onAttestationProcessStartedWithoutData(device_address);
            }
        });

        eventBus.on('ATTESTATION_KIT_ATTESTATION_PROCESS_STARTED_WITH_DATA', async (device_address, data) => {
            if (this.onAttestationProcessStartedWithData) {
                this.onAttestationProcessStartedWithData(device_address, data);
            }
        });

        eventBus.on('ATTESTATION_KIT_ADDED_ADDRESS', async (device_address, wallet_address) => {
            if (this.onAddressAdded) {
                this.onAddressAdded(device_address, wallet_address);
            }
        });

        eventBus.on('ATTESTATION_KIT_ATTESTED', async ({ device_address, ...data }) => {
            if (this.onAttested) {
                this.onAttested(device_address, data);
            }
        });

        eventBus.on('ATTESTATION_KIT_VERIFIED_WALLET_ADDRESS', async ({ address, device_address }) => {
            if (this.walletAddressVerified) {
                this.walletAddressVerified(device_address, address);
            }
        });
    }

    // EVENTS

    /**
     * Must be implemented by derived classes.
     * Event handler called when a new attestation process is started.
     * @abstract
     * @param {string} device_address - The address of the device that started the attestation process.
     * @param {Object} data - Additional data associated with the attestation process.
     */
    onAttestationProcessStarted(device_address, data) { }

    /**
     * Must be implemented by derived classes.
     * Event handler called when a wallet attestation process is started without additional data.
     * @abstract
     * @param {string} device_address - The address of the device that started the attestation process.
     */
    onAttestationProcessStartedWithoutData(device_address) { }

    /**
     * Must be implemented by derived classes.
     * Event handler called when a new attestation process is started with additional data.
     * @abstract
     * @param {string} device_address - The device address that started the attestation process.
     * @param {Object} data - Additional data associated with the attestation process.
     */
    onAttestationProcessStartedWithData(device_address, data) { }

    /**
     * Must be implemented by derived classes.
     * Event handler called when an address is added.
     * @abstract
     * @param {string} device_address - The address of the device from which the event originated.
     * @param {string} wallet_address - The wallet address that was added.
     */
    onAddressAdded(device_address, wallet_address) { }

    /**
     * Handler for attestation completion events.
     * Must be implemented by derived classes.
     * @abstract
     * @param {string} device_address - The address of the device that completed attestation.
     * @param {Object} data - The attestation data.
     */
    onAttested(device_address, data) { }

    /**
    * Handler for attestation completion events.
    * Must be implemented by derived classes.
    * @abstract
    * @param {string} device_address - The address of the device that completed attestation.
    * @param {Object} wallet_address - The wallet address that was attested.
    */
    walletAddressVerified(device_address, wallet_address) { }


    /**
     * Initialize the strategy. This method must be implemented by all derived classes.
     * @abstract
     * @throws {ErrorWithMessage} When called directly on BaseStrategy
     * @returns {void}
     */
    init() {
        throw new ErrorWithMessage("init method is not implemented");
    }

    /**
     * Constructs the verification URL for the user to verify their wallet address.
     * @param {string} address - The wallet address.
     * @param {string} userId - The user's unique identifier.
     * @param {string} username - The user's username.
     * @returns {string} The verification URL.
     * @throws {ErrorWithMessage} Throws an error if the address is invalid.
     */
    getVerifyUrl(address, data) {
        if (Validation.isWalletAddress(address) && Validation.isDataObject(data)) {
            const sanitizedDataObject = new URLSearchParams(data).toString();
            return `${process.env.domain}/verify/${address}?${sanitizedDataObject}`;
        } else {
            throw new ErrorWithMessage('Invalid Data', { address, userId, code: 'INVALID_DATA' });
        }
    }

    static escapeHtml(unsafe = '') {
        return escape(unsafe);
    }
}

module.exports = BaseStrategy;
