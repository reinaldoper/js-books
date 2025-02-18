import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

const iv = Buffer.from('1234567890123456');

const secretKey = process.env.SECRET_KEY 
    ? Buffer.from(process.env.SECRET_KEY.padEnd(32, '0').slice(0, 32)) 
    : Buffer.from('12345678901234567890123456789012');

const encryptEmail = (email) => {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encryptedEmail = cipher.update(email, 'utf8', 'hex');
    encryptedEmail += cipher.final('hex');
    return encryptedEmail;
};

const decryptEmail = (encryptedEmail) => {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    let decryptedEmail = decipher.update(encryptedEmail, 'hex', 'utf8');
    decryptedEmail += decipher.final('utf8');
    return decryptedEmail;
};

export { encryptEmail, decryptEmail };