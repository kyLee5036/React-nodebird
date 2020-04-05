const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models');
const passport = require('passport');

const router = express.Router();

router.get('/', (res, req) => { 

});
router.post('/',  async (req, res, next) => { 
  try {
    const exUser = await db.User.findOne({ 
      where: {
        userId: req.body.userId,
      },
    });
    if (exUser) { 
      // return res.send('이미 사용중인 아이디입니다.');
      return res.status(403).send('이미 사용중인 아이디입니다.'); 
    }
    const hashtPassword = await bcrypt.hash(req.body.password, 12); 
    const newUser = await db.User.create({
      nickname : req.body.nickname,
      userId: req.body.userId,
      password: hashtPassword,
    });
    console.log(newUser);
    return res.status(200).json(newUser); 
  } catch (e) {
    console.error(e);
    return next(e);
  }

});
router.get('/:id', (req, res) => {

})
router.post('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('로그아웃 성공');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    console.log(err, user, info);
    if (err) {
      console.error(err);
      return next(err);
    } 
    if (info) {
      return res.status(401).send(info.reason);
    } 
    return req.login(user, (loginErr) => {
      if (loginErr) { 
        return next(loginErr);
      }
      const filteredUser = Object.assign({}, user.toJSON());
      delete filteredUser.password;
      return res.json(filteredUser);
    });
  })(req, res, next);
});
router.get('/:id/follow', (req, res) => {

});
router.post('/:id/follow', (req, res) => {

});
router.delete('/:id/follow', (req, res) => {

});
router.delete('/:id/follower', (req, res) => {

});
router.get('/:id/posts', (req, res) => {

});

module.exports = router; 
