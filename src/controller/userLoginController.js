import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { decryptEmail } from "../middleware/encryptEmail.js";
import loginService from "../service/userLogin.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

class UserLoginController {
  async login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }

    if (typeof username !== "string" || typeof password !== "string") {
      return res
        .status(400)
        .json({ error: "Username and password must be strings." });
    }
    try {
      const user = await loginService.login(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials." });
      }
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "2h" }
      );
      res.cookie("session", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7200000,
      });

      const emailDecrypted = decryptEmail(user.email);
      return res
        .status(200)
        .json({ username: username, email: emailDecrypted });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
}

const userLogin = new UserLoginController();

export default userLogin;
