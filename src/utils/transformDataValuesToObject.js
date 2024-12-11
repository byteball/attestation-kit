/**
 * Transforms database data with numbered keys into a structured object.
 * @param {Object} dbData - The database data object containing numbered keys (dataKey0, dataValue0, etc.)
 * @returns {Object} An object mapping the keys to their corresponding values
 * @throws {Error} If input is invalid or data structure is corrupted
 * @example
 * // Input: { dataKey0: 'name', dataValue0: 'John', dataKey1: 'age', dataValue1: '30' }
 * // Output: { name: 'John', age: '30' }
 */
module.exports = (dbData) => { // { dataKey0, dataKey1, dataKey2, dataKey3, dataValue0, dataValue1, dataValue2, dataValue3 }
    const result = {};

    for (let i = 0; dbData[`dataKey${i}`] !== undefined; i++) {
        const key = dbData[`dataKey${i}`];
        const value = dbData[`dataValue${i}`];
        if (key && value) {
            result[key] = value;
        } else {
            break;
        }
    }

    return result;
}
