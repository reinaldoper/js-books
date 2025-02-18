import prisma from "../prismaClient.js";
import { encryptEmail } from "../middleware/encryptEmail.js";
import bcrypt from "bcrypt";
import sanitizeUsername from "../middleware/sanitizeUsername.js";

class UserRegisterService {
  async registerUser({ email, password, username }) {
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const encryptedEmail = encryptEmail(email);
    const sanitizedUsername = sanitizeUsername(username);


    const newUser = await prisma.user.create({
      data: {
        email: encryptedEmail,
        username: sanitizedUsername,
        password: hashedPassword,
      },
    });

    return newUser;
  }

  async existeUser({ email, username }) {
    const encryptedEmail = encryptEmail(email);
    const sanitizedUsername = sanitizeUsername(username);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: encryptedEmail,
          },
          {
            username: sanitizedUsername,
          },
        ],
      },
    });

    return user;
  }
}

const userRegisterService = new UserRegisterService();

export default userRegisterService;