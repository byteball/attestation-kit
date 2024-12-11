/**
 * @module ErrorWithMessage
 */

/**
 * Custom error class that extends the standard Error object with additional properties.
 * @extends Error
 */
class ErrorWithMessage extends Error {
    /**
     * Constructs a new ErrorWithMessage instance.
     * @param {string} message - The error message.
     * @param {object} [options={}] - Additional options to include in the error.
     * @throws {TypeError} Throws a TypeError if message is not a string or options is not an object.
     */
    constructor(message, options = {}) {
        if (typeof message !== 'string') {
            throw new TypeError('ErrorWithMessage: message parameter must be a string');
        }

        if (typeof options !== 'object') {
            throw new TypeError('ErrorWithMessage: options parameter must be a non-null object');
        }

        super(message);

        this.name = this.constructor.name;

        // Ensure proper stack trace capture across Node.js versions
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        const safeKeys = Object.keys(options);
        const reservedProps = ['name', 'message', 'stack'];

        for (const key of safeKeys) {
            if (reservedProps.includes(key)) {
                continue;
            }

            if (Object.prototype.hasOwnProperty.call(options, key)) {
                this[key] = options[key];
            }
        }
    }
}

module.exports = {
    ErrorWithMessage
}
