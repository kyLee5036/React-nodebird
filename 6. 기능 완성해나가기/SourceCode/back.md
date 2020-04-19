# 기능 완성해나가기

+ [해시태그 링크로 만들기](#해시태그-링크로-만들기)
+ [next와 express 연결하기](#next와-express-연결하기)
+ [getInitialProps로 서버 데이터 받기](#getInitialProps로-서버-데이터-받기)
+ [해시태그 검색, 유저 정보 라우터 만들기](#해시태그-검색,-유저-정보-라우터-만들기)
+ [Link 컴포넌트 고급 사용법](#Link-컴포넌트-고급-사용법)
+ [댓글 작성, 댓글 로딩](#댓글-작성,-댓글-로딩)
+ [미들웨어로 중복 제거하기](#미들웨어로-중복-제거하기)



## 해시태그 링크로 만들기
[위로가기](#기능-완성해나가기)

코드없음

## next와 express 연결하기
[위로가기](#기능-완성해나가기)

코드없음

## getInitialProps로 서버 데이터 받기
[위로가기](#기능-완성해나가기)

코드없음

## 해시태그 검색, 유저 정보 라우터 만들기
[위로가기](#기능-완성해나가기)

#### \back\routes\hashtag.js
```js
const express = require('express');
const db = require('../models');

const router = express.Router();

router.get('/:tag', async(req, res, next) => {
  try {
    const posts = await db.Post.findAll({
      include: [{
        model: db.Hashtag,
        where: { name: decodeURIComponent(req.params.name) },
      }, {
        model: db.User,
        attributes: ['id', 'nickname'],
      }],
    });
    res.json(posts);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router;
```

#### \back\routes\user.js
```js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models');
const passport = require('passport');

const router = express.Router();

router.get('/', (req, res) => {
  if (!req.user) {
    return res.status(401).send('로그인이 필요합니다.'); 
  }
  // const user = Object.assign({}, req.user);
  const user = Object.assign({}, req.user.toJSON() );
  delete user.password;
  return res.json(req.user);
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

router.get('/:id', async (req, res) => { 
  try {
    const user = await db.User.findOne({
      where: { id: parseInt(req.params.id, 10 )},
      include: [{
        model: db.Post,
        as: 'Posts',
        attributes: ['id'],
      }, {
        model: db.User,
        as: 'Followings',
        attributes: ['id'],
      }, {
        model: db.User,
        as: 'Followers',
        attributes: ['id'],
      }],
      attributes: ['id', 'nickname'],
    });
    const jsonUser = user.toJSON();
    jsonUser.Posts = jsonUser.Posts ? jsonUser.Posts.length : 0;
    jsonUser.Followings = jsonUser.Followings ? jsonUser.Followings.length : 0;
    jsonUser.Followers = jsonUser.Followers ? jsonUser.Followers.length : 0;
    res.json(jsonUser);
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.post('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('로그아웃 성공');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    } 
    if (info) {
      return res.status(401).send(info.reason);
    } 
    return req.login(user, async (loginErr) => {
      try {
        if (loginErr) { 
          return next(loginErr);
        }
        const fullUser = await db.User.findOne({
          where : {id : user.id},
          include: [{ 
            model: db.Post,
            as: 'Posts',
            attributes: ['id'],
          }, {
            model: db.User,
            as: 'Followings',
            attributes: ['id'],
          }, {
            model: db.User,
            as: 'Followers',
            attributes: ['id'],
          }],
          attributes: ['id', 'nickname', 'userId'], 
        });
        return res.json(fullUser);
      } catch (e) {
        next(e);
      }
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
router.get('/:id/posts', async (req, res, next) => {
  try {
    const posts = await db.Post.findAll({
      where: {
        UserId: parseInt(req.params.id, 10),
        RetweetId: null,
      },
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }]
    });
    res.json(posts);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router; 

```

#### \back\index.js
```js
const express = require('express');
const morgam = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');

const passportConfig = require('./passport');
const db = require('./models');
const userAPIRouter = require('./routes/user');
const postAPIRouter = require('./routes/post');
const postsAPIRouter = require('./routes/posts');
const hashtagAPIRouter = require('./routes/hashtag');

dotenv.config();
const app = express();
db.sequelize.sync();
passportConfig(); 

app.use(morgam('dev'));
app.use(cors({
  origin: true, 
  credentials: true,
})); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(expressSession({
  resave: false, 
  saveUninitialized: false, 
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true, 
    secure: false,
  },
  name: 'rnbck',
}));
app.use(passport.initialize());
app.use(passport.session()); 

app.use('/api/user', userAPIRouter);
app.use('/api/post', postAPIRouter);
app.use('/api/posts', postsAPIRouter);
app.use('/api/hashtag', hashtagAPIRouter);

app.listen(3065, () => {
  console.log('server is running on (서버주소) : http://localhost:3065');
});
```

## Link 컴포넌트 고급 사용법
[위로가기](#기능-완성해나가기)

코드없음

## 댓글 작성, 댓글 로딩
[위로가기](#기능-완성해나가기)

#### \back\routes\post.js
```js
const express = require('express');
const db = require('../models');

const router = express.Router();

router.post('/', async (req, res, next) => { 
  try {
    const hashtags = req.body.content.match(/#[^\s]+/g);
    const newPost = await db.Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });
    if (hashtags) {
      const result = await Promise.all(hashtags.map(tag => db.Hashtag.findOrCreate({
        where: { name: tag.slice(1).toLowerCase() },
      })));
      console.log(result);
      await newPost.addHashtags(result.map(r => r[0]));
    }
    const fullPost = await db.Post.findOne({
      where: { id: newPost.id },
      include: [{
        model: db.User,
      }],
    });
    res.json(fullPost);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.post('/images', (req, res) => {

});

router.get('/:id/comments', async (req, res, next) => {
  try {
    const post = await db.Post.findOne({ 
      where: { 
        id: req.params.id 
      } 
    });
    if (!post) {
      return res.status(404).send('포스트가 존재하지 않습니다.');
    }
    const comments = await db.Comment.findAll({
      where: {
        PostId: req.params.id,
      },
      order: [['createdAt', 'ASC']],
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }],
    });
    res.json(comments);
  } catch (e) {
    console.error(e);
    next(e);
  }
});


router.post('/:id/comment', async(req, res, next) => {
  try {
    if ( !req.user ) {
      return res.status(401).send('로그인이 필요합니다.');
    }
    const post = await db.Post.findOne({ 
      where: { id: req.params.id }
     });
     if ( !post ) {
       return res.status(404).send('포스트가 존재하지 않습니다.');
     }
     const newComment = await db.Comment.create({ 
       PostId: post.id,
       UserId: req.user.id,
       content: req.body.content,
     });
     await post.addComment(newComment.id);
     const comment = await db.Comment.findOne({
      where : {
        id: newComment.id,
      },
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }],
     });
     return res.json(comment);
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
```

## 미들웨어로 중복 제거하기
[위로가기](#기능-완성해나가기)

#### \back\routes\middlewares.js
```js
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();  
  } else {
    res.status(401).send('로그인이 필요합니다.')
  }
};

exports.isNotLoggedIn = (req, res, next) => {  
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send('로그인 한 사용자는 접근할 수 없습니다.');
  }
};
```

#### \back\routes\post.js
```js
const express = require('express');
const db = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    const hashtags = req.body.content.match(/#[^\s]+/g);
    const newPost = await db.Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });
    if (hashtags) {
      const result = await Promise.all(hashtags.map(tag => db.Hashtag.findOrCreate({
        where: { name: tag.slice(1).toLowerCase() },
      })));
      console.log(result);
      await newPost.addHashtags(result.map(r => r[0]));
    }
    const fullPost = await db.Post.findOne({
      where: { id: newPost.id },
      include: [{
        model: db.User,
      }],
    });
    res.json(fullPost);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.post('/images', (req, res) => {

});

router.get('/:id/comments', async (req, res, next) => {
  try {
    const post = await db.Post.findOne({ 
      where: { 
        id: req.params.id 
      } 
    });
    if (!post) {
      return res.status(404).send('포스트가 존재하지 않습니다.');
    }
    const comments = await db.Comment.findAll({
      where: {
        PostId: req.params.id,
      },
      order: [['createdAt', 'ASC']],
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }],
    });
    res.json(comments);
  } catch (e) {
    console.error(e);
    next(e);
  }
});


router.post('/:id/comment', isLoggedIn, async(req, res, next) => {
  try {
    const post = await db.Post.findOne({ 
      where: { id: req.params.id }
     });
     if ( !post ) {
       return res.status(404).send('포스트가 존재하지 않습니다.');
     }
     const newComment = await db.Comment.create({ 
       PostId: post.id,
       UserId: req.user.id,
       content: req.body.content,
     });
     await post.addComment(newComment.id);
     const comment = await db.Comment.findOne({
      where : {
        id: newComment.id,
      },
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }],
     });
     return res.json(comment);
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
```

#### \back\routes\user.js
```js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models');
const passport = require('passport');
const { isLoggedIn } = require('./middlewares'); 

const router = express.Router();

router.get('/', isLoggedIn, (req, res) => {
  const user = Object.assign({}, req.user.toJSON() );
  delete user.password;
  return res.json(req.user);
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

router.get('/:id', async (req, res, next) => { 
  try {
    const user = await db.User.findOne({
      where: { id: parseInt(req.params.id, 10 )},
      include: [{
        model: db.Post,
        as: 'Posts',
        attributes: ['id'],
      }, {
        model: db.User,
        as: 'Followings',
        attributes: ['id'],
      }, {
        model: db.User,
        as: 'Followers',
        attributes: ['id'],
      }],
      attributes: ['id', 'nickname'],
    });
    const jsonUser = user.toJSON();
    jsonUser.Posts = jsonUser.Posts ? jsonUser.Posts.length : 0;
    jsonUser.Followings = jsonUser.Followings ? jsonUser.Followings.length : 0;
    jsonUser.Followers = jsonUser.Followers ? jsonUser.Followers.length : 0;
    res.json(jsonUser);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.post('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('로그아웃 성공');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    } 
    if (info) {
      return res.status(401).send(info.reason);
    } 
    return req.login(user, async (loginErr) => {
      try {
        if (loginErr) { 
          return next(loginErr);
        }
        const fullUser = await db.User.findOne({
          where : {id : user.id},
          include: [{ 
            model: db.Post,
            as: 'Posts',
            attributes: ['id'],
          }, {
            model: db.User,
            as: 'Followings',
            attributes: ['id'],
          }, {
            model: db.User,
            as: 'Followers',
            attributes: ['id'],
          }],
          attributes: ['id', 'nickname', 'userId'], 
        });
        return res.json(fullUser);
      } catch (e) {
        next(e);
      }
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
router.get('/:id/posts', async (req, res, next) => {
  try {
    const posts = await db.Post.findAll({
      where: {
        UserId: parseInt(req.params.id, 10),
        RetweetId: null,
      },
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }]
    });
    res.json(posts);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router; 

```