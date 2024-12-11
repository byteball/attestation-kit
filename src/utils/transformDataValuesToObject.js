module.exports = (dbData) => { // { dataKey0, dataKey1, dataKey2, dataKey3, dataValue0, dataValue1, dataValue2, dataValue3 }
    const result = {};

    for (let i = 0; dbData[`dataKey${i}`] !== undefined; i++) {
        const key = dbData[`dataKey${i}`];
        const value = dbData[`dataValue${i}`];
        result[key] = value;
    }

    return result;
}
