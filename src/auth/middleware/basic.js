'use strict';

const base64 = require('base-64');
const User = require('../models/users-auth-model');

module.exports = async (req, res, next) => {

  if (!req.headers.authorization) { return next('Missing Authorization Headers / Invalid Login'); }

  let basic = req.headers.authorization.split(' ');
  
  if(basic[0] !== 'Basic'){ return next('Invalid Auth Headers'); }

  let [user, pass] = base64.decode(basic[1]).split(':');

  try {
    req.user = await User.authenticateBasic(user, pass);
    next();
  } catch (e) {
    res.status(403).send('Invalid Login');
  }

};