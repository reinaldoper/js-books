const sanitizeUsername = (username) => {
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .substring(0, 20);
};

export default sanitizeUsername;