module.exports = (str) => {
    if (typeof str === 'string') {
        return str.charAt(0).toUpperCase() + str.slice(1);
    } else {
        return str;
    }
}
