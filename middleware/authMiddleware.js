const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    console.log('Token missing in request');
    return res.status(401).json({ error: 'Token missing' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      console.log('Error verifying token:', err);
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = user;
    console.log('Authenticated user:', req.user);
    next();
  });
}

module.exports = authenticateToken;
