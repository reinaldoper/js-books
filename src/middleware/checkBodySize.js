

const checkBodySize = (req, res, next) => {
  const contentLength = req.headers['content-length'];
  const maxSize = 100 * 1024; 

  if (contentLength) {
    const length = Number(contentLength);
    if (length > maxSize) {
      return res.status(401).json({ error: 'Payload too large' });
    }
  }
  next();
};

export default checkBodySize;