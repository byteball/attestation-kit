function encodeToBase64(data) {
    return btoa(encodeURIComponent(data));
}

module.exports = encodeToBase64;
