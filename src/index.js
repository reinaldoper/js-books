import express from 'express';
import cors  from 'cors';
import dotenv from 'dotenv';
import cookiesParser from 'cookie-parser';
import userRegisterController from './controller/userRegisterController.js';
import { validateEmail, validateUsername, validatePassword } from './middleware/validateUserRegister.js';
import userLogin from './controller/userLoginController.js';
import checkBodySize from './middleware/checkBodySize.js';
import preventSQLInjection from './middleware/preventSQLInjection.js';
import bookController from './controller/bookController.js';

dotenv.config();

const app = express();

const PORT = process.env.API_LISTENING_PORT || 3000;


app.use(cors());

app.use(cookiesParser());

app.use('/user/login', checkBodySize, express.json(), preventSQLInjection, validateUsername, validatePassword, userLogin.login);
app.use('/user/register', express.json(), validateEmail, validateUsername, validatePassword, userRegisterController.register);
app.use('/books', express.json({ limit: '150mb' }), bookController);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

