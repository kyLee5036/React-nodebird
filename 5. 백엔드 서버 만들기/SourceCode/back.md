# 백엔드 서버 만들기

+ [백엔드 서버 구동에 필요한 모듈들](#백엔드-서버-구동에-필요한-모듈들)
+ [HTTP 요청 주소 체계 이해하기](#HTTP-요청-주소-체계-이해하기)
+ [Sequelize와 ERD](#Sequelize와-ERD)
+ [테이블간의 관계들](#테이블간의-관계들)
+ [시퀄라이즈 Q&A와 DB 연결하기](#시퀄라이즈-Q&A와-DB-연결하기)
+ [백엔드 서버 API 만들기](#백엔드-서버-API-만들기)
+ [회원가입 컨트롤러 만들기](#회원가입-컨트롤러-만들기)
+ [실제 회원가입과 미들웨어들](#실제-회원가입과-미들웨어들)
+ [로그인을 위한 미들웨어들](#로그인을-위한-미들웨어들)
+ [passport와 쿠키 세션 동작 원리](#passport와-쿠키-세션-동작-원리)
+ [passport 로그인 전략](#passport-로그인-전략)
+ [passport 총정리와 실제 로그인](#passport-총정리와-실제-로그인)
+ [다른 도메인간에 쿠키 주고받기](#다른-도메인간에-쿠키-주고받기)



## 백엔드 서버 구동에 필요한 모듈들
[위로가기](#백엔드-서버-만들기)

코드 없음

## HTTP 요청 주소 체계 이해하기
[위로가기](#백엔드-서버-만들기)

#### \back\index.js
```js
const express = require('express');

const app = express();

app.get('/', (req, res, next) => {
  res.send('Hello, Server');
});

app.get('/about', (req, res, next) => {
  res.send('about');
});

app.listen(8080, () => {
  console.log('server is running on localhost:8080');
});
```

## Sequelize와 ERD
[위로가기](#백엔드-서버-만들기)

#### \back\config\config.json
```json
{
  "development": {
    "username": "username-setting",
    "password": "password-setting",
    "database": "react-nodebird",
    "host": "127.0.0.1",
    "port": 3307,
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "test": {
    "username": "username-setting",
    "password": "password-setting",
    "database": "react-nodebird",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "production": {
    "username": "username-setting",
    "password": "password-setting",
    "database": "react-nodebird",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "operatorsAliases": false
  }
}
```

#### \back\models\index.js
```js
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('/../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

```

#### \back\models\user.js
```js
module.exports = (sequelilze, DataTypes) => {
  const User = sequelilze.define('User', {
    nickname: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    charset: 'utf8',
    collate: 'utf_general_ci',
  });
  User.associate = (db) => {
    db.User.hasMany(db.Post);
    db.User.hasMany(db.Comment);
  };
  return User;
};
```

## 테이블간의 관계들
[위로가기](#백엔드-서버-만들기)

#### \back\models\comment.js
```js
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    charset: 'utf8nb4',
    collate: 'utf8nb4_general_ci',
  });
  Comment.asscoiate = (db) => {
    db.Comment.belongsTo(db.User);
    db.Comment.belongsTo(db.Post);
  };
  return Comment;
};
```

#### \back\models\hashtag.js
```js
module.exports = (sequelize, DataTypes) => {
  const Hashtag = sequelize.define('Hashtag', {
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
    }
  }, {
    charset: 'utf8nb4',
    collate: 'utf8nb4_general_ci',
  });
  Hashtag.asscoiate = (db) => {
    db.Hashtag.belongsToMany(db.User, { through: 'PostHashTag' });
  };
  return Hashtag;
};
```

#### \back\models\image.js
```js
module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
    src: {
      type: DataTypes.STRING(200),
      allowNull: false,
    }
  }, {
    charset: 'utf8',
    collate: 'utf_general_ci',
  });
  Image.asscoiate = (db) => {
    db.Image.belongsTo(db.Post);
  };
  return Image;
};
```

#### \back\models\post.js
```js
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    charset: 'utf8',
    collate: 'utf_general_ci',
  });
  Post.asscoiate = (db) => {
    db.Post.belongsTo(db.User);
    db.Post.hasMany(db.Comment);
    db.Post.hasMany(db.Image);
    db.Post.belongsTo(db.Post);
  };
  return Post;
};
```

## 시퀄라이즈 Q&A와 DB 연결하기
[위로가기](#백엔드-서버-만들기)

#### \back\models\comment.js
```js
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });
  Comment.asscoiate = (db) => {
    db.Comment.belongsTo(db.User);
    db.Comment.belongsTo(db.Post);
  };
  return Comment;
};
```

#### \back\models\hashtag.js
```js
module.exports = (sequelize, DataTypes) => {
  const Hashtag = sequelize.define('Hashtag', {
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
    }
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });
  Hashtag.asscoiate = (db) => {
    db.Hashtag.belongsToMany(db.User, { through: 'PostHashTag' });
  };
  return Hashtag;
};
```

#### \back\models\image.js
```js
module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
    src: {
      type: DataTypes.STRING(200),
      allowNull: false,
    }
  }, {
    charset: 'utf8',
    collate: 'utf8_general_ci',
  });
  Image.asscoiate = (db) => {
    db.Image.belongsTo(db.Post);
  };
  return Image;
};
```

#### \back\models\index.js
```js
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.Comment = require('./comment')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);
db.Image = require('./image')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

```

#### \back\models\post.js
```js
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    charset: 'utf8',
    collate: 'utf8_general_ci',
  });
  Post.asscoiate = (db) => {
    db.Post.belongsTo(db.User);
    db.Post.hasMany(db.Comment);
    db.Post.hasMany(db.Image);
    db.Post.belongsTo(db.Post, { as : 'Retweet' }); 
    db.Post.belongsToMany(db.Hashtag, { through: 'PostHashTag' }); 
    db.Post.belongsToMany(db.User, { through: 'Like', as: 'Likers'}); 
  };
  return Post;
};
```

#### \back\models\user.js
```js
module.exports = (sequelilze, DataTypes) => {
  const User = sequelilze.define('User', {
    nickname: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    charset: 'utf8',
    collate: 'utf8_general_ci',
  });
  User.associate = (db) => {
    db.User.hasMany(db.Post, {as : 'Posts'} );
    db.User.hasMany(db.Comment);
    db.User.belongsToMany(db.Post, { through: 'Like', as: 'Liked' }); 
    db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followers' }); 
    db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followings' });
  };
  return User;
};


```

#### \back\index.js
```js
const express = require('express');

const db = require('./models');

const app = express();
db.sequelize.sync();

app.get('/', (req, res, next) => {
  res.send('Hello, Server');
});

app.get('/about', (req, res, next) => {
  res.send('about');
});

app.listen(3065, () => {
  console.log('server is running on (서버주소) : http://localhost:3065');
});
```

## 백엔드 서버 API 만들기
[위로가기](#백엔드-서버-만들기)

#### \back\routes\post.js
```js
const express = require('express');

const router = express.Router();

router.post('/', (req, res) => {

});
app.post('/images', (req, res) => {

});

module.exports = router;
```

#### \back\routes\posts.js
```js
const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {

});


module.exports = router;
```

#### \back\routes\user.js
```js
const express = require('express');
const router = express.Router();

router.get('/', (res, req) => { 

});
router.post('/', (req, res) => {

});
router.get('/:id', (req, res) => {

})
router.post('/logout', (req, res) => {

});
router.post('/login', (req, res) => {

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

module.exports = Router;

```

#### \back\index.js
```js
const express = require('express');

const db = require('./models');
const userAPIRouter = require('./routes/user');
const postAPIRouter = require('./routes/post');
const postsAPIRouter = require('./routes/posts');

const app = express();
db.sequelize.sync();

app.use('/api/user', userAPIRouter);
app.use('/api/post', postAPIRouter);
app.use('/api/posts', postsAPIRouter);


app.listen(3065, () => {
  console.log('server is running on (서버주소) : http://localhost:3065');
});
```

## 회원가입 컨트롤러 만들기
[위로가기](#백엔드-서버-만들기)

#### \back\routes\user.js
```js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models');

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
      return res.status(403).send('이미 사용중인 아이디입니다.'); 
    }
    const hashtPassword = await bcrypt.hash(req.body.password, 12); 
    const newUser = await db.User.create({
      nickname : req.body.nickname,
      userId: req.body.userId,
      password: hashtPassword,
    });
    console.log(user);
    return res.status(200).json(newUser); 
  } catch (e) {
    console.error(e);
    return next(e);
  }

});
router.get('/:id', (req, res) => {

})
router.post('/logout', (req, res) => {

});
router.post('/login', (req, res) => {

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

module.exports = Router;

```

#### \back\index.js

```js
const express = require('express');

const db = require('./models');
const userAPIRouter = require('./routes/user');
const postAPIRouter = require('./routes/post');
const postsAPIRouter = require('./routes/posts');

const app = express();
db.sequelize.sync();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use('/api/user', userAPIRouter);
app.use('/api/post', postAPIRouter);
app.use('/api/posts', postsAPIRouter);


app.listen(3065, () => {
  console.log('server is running on (서버주소) : http://localhost:3065');
});
```

## 실제 회원가입과 미들웨어들
[위로가기](#백엔드-서버-만들기)

#### \back\routes\post.js (간단한 오류 수정)
```js
const express = require('express');

const router = express.Router();

router.post('/', (req, res) => {

});
router.post('/images', (req, res) => { 

});

module.exports = router;
```

#### \back\routes\user.js
```js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models');

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

});
router.post('/login', (req, res) => {

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

module.exports = router; // 에러 수정

```

#### \back\index.js
```js
const express = require('express');
const morgam = require('morgan');
const cors = require('cors');

const db = require('./models');
const userAPIRouter = require('./routes/user');
const postAPIRouter = require('./routes/post');
const postsAPIRouter = require('./routes/posts');

const app = express();
db.sequelize.sync();

app.use(morgam('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors()); 

app.use('/api/user', userAPIRouter);
app.use('/api/post', postAPIRouter);
app.use('/api/posts', postsAPIRouter);


app.listen(3065, () => {
  console.log('server is running on (서버주소) : http://localhost:3065');
});
```

## 로그인을 위한 미들웨어들
[위로가기](#백엔드-서버-만들기)

#### \back\config\config.js
```js
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  "development": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE,
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "test": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE,
    "host": process.env.DB_HOST,
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "production": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE,
    "host": process.env.DB_HOST,
    "dialect": "mysql",
    "operatorsAliases": false
  }
}

```

#### \back\index.js
```js
const express = require('express');
const morgam = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const dotenv = require('dotenv'); // 추가

dotenv.config(); // 추가
const db = require('./models');
const userAPIRouter = require('./routes/user');
const postAPIRouter = require('./routes/post');
const postsAPIRouter = require('./routes/posts');

const app = express();
db.sequelize.sync();

app.use(morgam('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors()); 
app.use(cookieParser(process.env.COOKIE_SECRET)); 
app.use(expressSession({
  resave: false, 
  saveUninitialized: false, 
  secret: process.env.COOKIE_SECRET, 
  cookie: {
    httpOnly: true, 
    secure: false,
  }
}));

app.use('/api/user', userAPIRouter);
app.use('/api/post', postAPIRouter);
app.use('/api/posts', postsAPIRouter);

app.listen(3065, () => {
  console.log('server is running on (서버주소) : http://localhost:3065');
});
```

## passport와 쿠키 세션 동작 원리
[위로가기](#백엔드-서버-만들기)

#### \back\index.js
```js
const express = require('express');
const morgam = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config();
const db = require('./models');
const userAPIRouter = require('./routes/user');
const postAPIRouter = require('./routes/post');
const postsAPIRouter = require('./routes/posts');

const app = express();
db.sequelize.sync();

app.use(morgam('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors()); 
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(expressSession({
  resave: false, 
  saveUninitialized: false, 
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true, 
    secure: false,
  }
}));
app.use(passport.initialize());
app.use(passport.session()); 

app.use('/api/user', userAPIRouter);
app.use('/api/post', postAPIRouter);
app.use('/api/posts', postsAPIRouter);

app.listen(3065, () => {
  console.log('server is running on (서버주소) : http://localhost:3065');
});
```

#### \back\passport\index.js
```js
const passport = require('passport');
const db = require('../models');

module.exports = () => {
  passport.serializeUser((user, done) => { 
    return done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    try {
      const user = await db.User.findOne({
        where: {id},
      });
      return done(null, user);
    } catch (e) {
      console.error(e);
      return done(e);
    }
  })
}

```

## passport 로그인 전략
[위로가기](#백엔드-서버-만들기)

#### \back\passport\index.js
```js
const passport = require('passport');
const db = require('../models');
const local = require('./local');

module.exports = () => {
  passport.serializeUser((user, done) => { 
    return done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    try {
      const user = await db.User.findOne({
        where: {id},
      });
      return done(null, user);
    } catch (e) {
      console.error(e);
      return done(e);
    }
  });
  local();
}
```

#### \back\passport\local.js
```js
const passport = require('passport');
const { Strategy : LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');
const db = require('../models');

module.exports = () => {
  passport.use(new localStorage({
    usernameField: 'userId', 
    passwordField: 'password'
  }, async ( userId, password, done) => {
    try {
      const user = await db.User.findOne({ 
        userId
      });
      if (!user) { 
        return done(null, false, {reason: '존재하지 않는 사용자입니다.'});
      }
      const result = await bcrypt.compare(password, user.password); 
      if (result) { 
        return done(null, user);
      }
      return done(null, false, {reason: '비밀번호가 틀립니다.'});
    } catch (e) {
      console.error(e);
      return done(e); 
    }
  }));
}

```

#### \back\routes\user.js
```js
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
    return req.login(user, (loginErr) => {
      if (loginErr) { 
        return next(loginErr);
      }
      const filteredUser = Object.assign({}, user);
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

dotenv.config();
const app = express();
db.sequelize.sync();
passportConfig(); 

app.use(morgam('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors()); 
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(expressSession({
  resave: false, 
  saveUninitialized: false, 
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true, 
    secure: false,
  }
}));
app.use(passport.initialize());
app.use(passport.session()); 

app.use('/api/user', userAPIRouter);
app.use('/api/post', postAPIRouter);
app.use('/api/posts', postsAPIRouter);

app.listen(3065, () => {
  console.log('server is running on (서버주소) : http://localhost:3065');
});
```

## passport 총정리와 실제 로그인
[위로가기](#백엔드-서버-만들기)

#### \back\routes\user.js
```js
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

dotenv.config();
const app = express();
db.sequelize.sync();
passportConfig(); 

app.use(morgam('dev'));
app.use(cors()); 
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
  }
}));
app.use(passport.initialize());
app.use(passport.session()); 

app.use('/api/user', userAPIRouter);
app.use('/api/post', postAPIRouter);
app.use('/api/posts', postsAPIRouter);

app.listen(3065, () => {
  console.log('server is running on (서버주소) : http://localhost:3065');
});
```

## 다른 도메인간에 쿠키 주고받기
[위로가기](#백엔드-서버-만들기)

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

app.listen(3065, () => {
  console.log('server is running on (서버주소) : http://localhost:3065');
});
```