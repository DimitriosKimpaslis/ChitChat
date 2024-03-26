const bcrypt = require('bcrypt');

// Function to encrypt a string using bcrypt
async function encryptPassword (plainText) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const encryptedText = await bcrypt.hash(plainText, salt);
    return encryptedText;
}

// Function to decrypt a string using bcrypt
async function isSamePassword(encryptedText, plainText) {
    const isMatch = await bcrypt.compare(plainText, encryptedText);
    return isMatch;
}

module.exports = {
    encryptPassword,
    isSamePassword
};
