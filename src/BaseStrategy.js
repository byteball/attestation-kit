const escape = require('lodash/escape');
const eventBus = require('ocore/event_bus.js');
const device = require('ocore/device');

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

        // Event listeners
        eventBus.on('ATTESTATION_KIT_JUST_WALLET_PAIRED', async (from_address, data) => {
            if (this.onWalletPaired) {
                this.onWalletPaired(from_address, data);
            }
        });

        eventBus.on('ATTESTATION_KIT_WALLET_PAIRED_WITH_DATA', async (device_address, provider, data) => {
            if (this.onWalletPairedWithData) {
                this.onWalletPairedWithData(device_address, provider, data);
            }
        });

        eventBus.on('ATTESTATION_KIT_ADDED_ADDRESS', async (from_address, data) => {
            if (this.onAddressAdded) {
                this.onAddressAdded(from_address, data);
            }

            if (this.getFirstPairedInstruction) {
                const instruction = this.getFirstPairedInstruction(data);

                device.sendMessageToDevice(from_address, 'text', instruction);
            }
        });

        eventBus.on('ATTESTATION_KIT_ATTESTED', async ({ device_address, ...data }) => {
            if (this.onAttested) {
                this.onAttested(device_address, data);
            }
        });
    }

    // EVENTS

    /**
     * Must be implemented by derived classes.
     * Event handler called when a wallet is paired.
     * @abstract
     * @param {string} from_address - The address of the paired wallet.
     * @param {Object} data - Additional data associated with the pairing event.
     */
    onWalletPaired(from_address, data) { }

    /**
     * Must be implemented by derived classes.
     * Event handler called when a wallet is paired with data.
     * @abstract
     * @param {string} device_address - The device address of the paired wallet.
     * @param {string} provider - The name of the service provider.
     * @param {Object} data - Additional data associated with the pairing event.
     */
    onWalletPairedWithData(device_address, provider, data) { }

    /**
     * Must be implemented by derived classes.
     * Event handler called when an address is added.
     * @abstract
     * @param {string} from_address - The address from which the event originated.
     * @param {string} wallet_address - The wallet address that was added.
     */
    onAddressAdded(from_address, wallet_address) { }

    /**
     * Handler for attestation completion events.
     * Must be implemented by derived classes.
     * @abstract
     * @param {string} device_address - The address of the device that completed attestation.
     * @param {Object} data - The attestation data.
     */
    onAttested(device_address, data) { }

    /**
     * Provides instructions for the user to follow.
     * Must be implemented by all derived classes.
     * @abstract
     * @returns {void}
     */
    getFirstPairedInstruction() { }

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
            return `${process.env.domain}/verify/${serviceProvider}/${address}?${sanitizedDataObject}`;
        } else {
            throw new ErrorWithMessage('Invalid Data', { address, serviceProvider, address, userId, code: 'INVALID_DATA' });
        }
    }

    static escapeHtml(unsafe = '') {
        return escape(unsafe);
    }
}

module.exports = BaseStrategy;
