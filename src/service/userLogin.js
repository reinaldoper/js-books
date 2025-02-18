import prisma from "../prismaClient.js";
import sanitizeUsername from "../middleware/sanitizeUsername.js";


class Login {
  async login({ username }) {
    const sanitizedUsername = sanitizeUsername(username);

    const user = await prisma.user.findFirst({
      where: {
        username: sanitizedUsername,
      },
    });

    return user;

  }
}

const loginService = new Login();

export default loginService;