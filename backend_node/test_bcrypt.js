import bcrypt from 'bcryptjs';

const password = 'admin'; // Testing common default
const hash = '$2b$10$cDgVSchdJ1Z1lwfi1hj1YeV4Eu4j6es2A5awqWh4nJGlAd3j6Uf9y';

bcrypt.compare(password, hash).then(res => {
    console.log('Result for "admin":', res);
});

const passwordWithSecret = 'GoaCity@2026!';
bcrypt.compare(passwordWithSecret, hash).then(res => {
    console.log('Result for "GoaCity@2026!":', res);
});
