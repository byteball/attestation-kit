const { isValidAddress, isValidBase64 } = require('ocore/validation_utils');
const logger = require('./logger');

const ADDRESS_REGEX = /^[A-Za-z0-9]{32}$/;

/**
 * Validation class containing static methods for validating input data.
 */
class Validation {
    /**
     * Validates whether the given address is a valid wallet address.
     * @param {string} address - The wallet address to validate.
     * @returns {boolean} Returns true if the address is valid; otherwise, false.
     */
    static isWalletAddress(address) {
        if (!address || typeof address !== 'string') {
            return false;
        }

        try {
            return ADDRESS_REGEX.test(address) && isValidAddress(address);
        } catch (error) {
            logger.error(`${this.name}: Error occurred during address validation.`, error);
            return false;
        }
    }
    /**
      * Validates the service provider name.
      * @param {string} serviceProvider - The name of the service provider.
      * @returns {boolean} Returns true if the service provider is valid; otherwise, false.
      */
    static isServiceProvider(serviceProvider) {
        if (!serviceProvider || typeof serviceProvider !== 'string' || serviceProvider.length > 20) {
            return false;
        }

        return true;
    }

    static isDataObject(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        const dataValues = Object.values(data);
        const dataKeys = Object.keys(data);
        const dataLength = dataKeys.length;

        if (dataLength > 4 && dataLength <= 0) {
            return false;
        }

        const validValues = dataValues.filter(value => value && typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean');

        if (validValues.length !== dataLength) {
            return false;
        }

        return true;
    }


    /**
     * Validates the unit
     * @param {string} unit - The unit to validate.
     * @returns {boolean} Returns true if the unit is valid; otherwise, false.
     */
    static isUnit(unit) {
        return isValidBase64(unit, 44);
    }
}

module.exports = Validation;
