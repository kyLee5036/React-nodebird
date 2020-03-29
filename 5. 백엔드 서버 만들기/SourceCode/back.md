# 백엔드 서버 만들기

+ [백엔드 서버 구동에 필요한 모듈들](#백엔드-서버-구동에-필요한-모듈들)
+ [HTTP 요청 주소 체계 이해하기](#HTTP-요청-주소-체계-이해하기)
+ [Sequelize와 ERD](#Sequelize와-ERD)
+ [테이블간의 관계들](#테이블간의-관계들)
+ [시퀄라이즈 Q&A와 DB 연결하기](#시퀄라이즈-Q&A와-DB-연결하기)



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