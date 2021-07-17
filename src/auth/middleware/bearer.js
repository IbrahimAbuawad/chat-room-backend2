'use strict';

const users = require('../models/users-auth-model');

module.exports = async (req, res, next) => {

  try {

    if (!req.headers.authorization) { next('Invalid Auth Headers / Login'); }

    const token = req.headers.authorization.split(' ').pop();
    const validUser = await users.authenticateWithToken(token);

    req.user = validUser;
    req.token = validUser.token;

    next();
  } catch (e) {
    res.status(403).send('Invalid Login');
  }
};
