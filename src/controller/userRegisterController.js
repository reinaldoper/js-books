import userRegisterService from "../service/userRegister.js";
import sanitizeUsername from "../middleware/sanitizeUsername.js";
import { encryptEmail } from "../middleware/encryptEmail.js";

class UserRegisterController {
  async register(req, res) {
    const { email, password, username } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof email !== "string"
    ) {
      return res
        .status(400)
        .json({ error: "Username, password, and email must be strings." });
    }

    const sanitizedUsername = sanitizeUsername(username);
    const encryptedEmail = encryptEmail(email);

    try {
      const userExists = await userRegisterService.existeUser({
        email,
        username,
      });

      if (userExists) {
        if (userExists.username === sanitizedUsername) {
          return res.status(418).json({ error: "User already exists." });
        }
        if (userExists.email === encryptedEmail) {
          return res.status(418).json({ error: "Email already exists." });
        }
      }
      const user = await userRegisterService.registerUser(
        email,
        password,
        username
      );
      if (user) {
        return res.status(201).json({
          message: "Registration successful.",
          user: { username, email },
        });
      }
    } catch (error) {
      if (
        error.meta?.target?.includes("username") ||
        error.meta?.target?.includes("email")
      ) {
        return res.status(418).json({ error: "Usuário já existe" });
      }
      return res.status(500).json({ error: "Erro no servidor" });
    }
  }
}

const userRegisterController = new UserRegisterController();

export default userRegisterController;
