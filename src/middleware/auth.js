

const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Admin API key required' });
    }
    const apiKey = authHeader.substring(7);
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Invalid Admin API key' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default authenticateAdmin;