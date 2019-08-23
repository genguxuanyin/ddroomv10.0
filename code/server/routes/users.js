// @login & register
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const gravatar = require('gravatar')
const keys = require('../config/keys')
const passport = require('passport')
const Sequelize = require('sequelize')

const User = require('../models/User')

const router = express.Router();
const Op = Sequelize.Op;

// @route  GET api/users/test
// @desc   返回的请求的json数据
// @access public
router.get('/test', (req, res) => {
  res.json({ msg: 'login works' });
});

// @route  POST api/users/register
// @desc   返回的请求的json数据
// @access public
router.post('/register', (req, res, next) => {
  //查询数据是否有邮箱
  console.log('email:', req.body.email)
  User.findOne({
          where: {
              [Op.or]: [{
                      name: req.body.name
                  },
                  {
                      email: req.body.email
                  }
              ]
          }
      })
      .then(user => {
          if (user) {
              return res.status(400).json(user.name == req.body.name ? '用户名已被注册' : '邮箱已被注册');
          } else {
              const avatar = gravatar.url(req.body.email, {
                  s: '200',
                  r: 'pg',
                  d: 'mm'
              });
              const newUser = new User({
                  name: req.body.name,
                  email: req.body.email,
                  avatar,
                  password: req.body.password,
                  identity: req.body.identity
              });
              // console.log(newUser)
              bcrypt.genSalt(10, function (err, salt) {
                  bcrypt.hash(newUser.password, salt, (err, hash) => {
                      // Store hash in your password DB.
                      if (err) {
                          next(err);
                      }
                      newUser.password = hash;
                      newUser.save()
                          .then(user => res.json({id:user.id}))
                          .catch(err => console.log(err))
                  });
              });
          }
      })
});

router.post('/login', (req, res, next) => {
  const account = req.body.account;
  const password = req.body.password;
  User.findOne({
          where: {
              [Op.or]: [{
                      name: account
                  },
                  {
                      phone: account
                  },
                  {
                      email: account
                  }
              ]
          }
      })
      .then(user => {
          if (!user) {
              return res.status(404).json('用户不存在');
          }
          if (user.status == 0) {
              return res.status(404).json('对不起,您的账号已被禁用,请联系管理员');
          }
          bcrypt.compare(password, user.password)
              .then(isMatch => {
                  console.log('isMatch:', isMatch)
                  if (isMatch) {
                      const rule = {
                          id: user.id
                      };
                      jwt.sign(rule, keys.secretOrKey, {
                          expiresIn: "1 days" //过期时间
                      }, (err, token) => {
                          if (err) next(err);
                          console.log('token:', token)
                          res.json({
                              success: true,
                              token: 'Bearer ' + token
                          })
                      })
                  } else {
                      return res.status(400).json("密码错误");
                  }
              })
      })
});

// @route  GET api/users/current
// @desc   return current user
// @access Private
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      identity: req.user.identity
    });
  }
);

module.exports = router;