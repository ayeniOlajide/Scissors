const bcrypt = require('bcrypt');

const testPassword = async () => {
    const password = 'pass1234';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Generated Hash:', hashedPassword);

    const match = await bcrypt.compare(password, hashedPassword);
    console.log('Password match:', match);
};

testPassword();
