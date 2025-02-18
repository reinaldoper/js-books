
const preventSQLInjection = (req, res, next) => {
  const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION|OR|AND)\b|--|;|\/\*|\*\/|\\)/i;

  const checkForSQLInjection = (value) => {
    if (typeof value === 'string') {
      return sqlInjectionPattern.test(value);
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkForSQLInjection);
    }
    return false;
  };

  const { username, password } = req.body;

  if (checkForSQLInjection(username) || checkForSQLInjection(password)) {
    return res.status(401).json({ error: 'SQL Injection detected.' });
  }

  next();
};

export default preventSQLInjection;