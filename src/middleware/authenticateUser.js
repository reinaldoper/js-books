import jwt from 'jsonwebtoken';
const JWT = "your_jwt_secret";


const authenticateUser = (req, res, next) => {

  try {
    const token = req.cookies.session;

    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }
    const decoded = jwt.verify(token, JWT);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
};

export default authenticateUser;