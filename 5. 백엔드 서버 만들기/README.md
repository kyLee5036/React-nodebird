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



## 백엔드 서버 구동에 필요한 모듈들
[위로가기](#백엔드-서버-만들기)

백엔드 서버는 NodeJS로 하겠다. <br>

> 노드는 자바스크립트 실행기(런터임)이다. <br>

노드가 http모듈을 제공하는데, http요청을 받아서 응답을 한다. <br>
그래서 노드를 서버로 사용할 수 있다. 하지만, 노드서버가 기능, 코드도 많이 부족하지만, <br>
프레임워크를 하나 올려서 만든다(예로들면, 리엑트에 리덕스를 사용하는 것과 비슷) <br>
그 프레임워크가 가장 유명한 것이  `express` 이다. <br>
<pre><code>npm i express</code></pre>

서버에서 필요한 것을 설치하겠다. <br>
<pre><code>npm i axios
npm i bcrypt
npm i cookie-parser
npm i express-session
npm i dotenv
npm i cors
npm i helmet hpp
npm i morgan
npm i multer
npm i passport passport-local
npm i sequelize sequelize-cli
npm i mysql2
</code></pre>
+ <strong>axios</strong> : 서버쪽이나 프론트쪽에 http요청을 보낼 때 사용 <br>
+ <strong>bcrypt</strong> : 비밀번호 암호화에 사용 <br>
+ <strong>cookie-parser</strong> : 로그인할 때 쿠키랑 세션을 사용하기 위해서 <br>
+ <strong>express-session</strong> : 쿠키랑 정보 저장을 위해서 <br>
+ <strong>dotenv</strong> : 환경 변수(비밀번호, 암호화 관리) <br>
+ <strong>cors</strong> : 서버랑 프론트가 주소가 다를 때 사용(주소가 다르면 보안떄문에 제약이 걸려서 그것을 풀어줄려고 사용) <br>
+ <strong>helmet, hpp</strong> : 노드, 익스프레스 보안을 당담(이건 일단 무조건 설치) <br>
+ <strong>morgan</strong> : 서버 로그를 보기위해 사용 <br>
+ <strong>multer</strong> : 이미지 업로드에 사용 <br>
+ <strong>passport, passport-local</strong> : 로그인 관리, 회원가입에서 사용 <br>
+ <strong>sequelize, sequelize-cli</strong> : sequelize는 DB로 MySQL을 사용(다른 SQL사용해도 상관없음) <br>
+ <strong>mysql2</strong> : mysql을 사용하기 위해서 <br>

<pre><code>npm i -D eslint eslint-config-airbnb
npm i -D eslint-plugin-jsx-a11y
npm i -D nodemon
</code></pre>

+ <strong>eslint eslint-config-airbnb</strong> : 코딩스타일 설정 <br>
+ <strong>eslint-plugin-jsx-a11y</strong> : 코딩스타일 설정 <br>
+ <strong>nodemon</strong> : 서버 쪽 코드를 바꾸면 재부팅하기위해서 nodemon을 사용 (서버를 껐다, 켰다하기가 귀찮기 때문) <br>

#### \back\package.json의 설정
```json
...생략
"scripts": {
  "dev": "nodemon"
},
...생략
```

nodemon의 설정이 필요하다. <br>

#### \back\nodemon.json
```js
{
  "watch" : [
    "index.js", // 메일파일인 index.js가 있다.
    // index.js가 바꼈다. 파일이나, 폴더가 바뀌면 exec를 다시 실행하겠다.
    "routes", // 폴더
    "config", // 폴더
    "passport", // 폴더
    "models", // 폴더
    "nodemon.json" // 파일
  ],
  "exec" : "node index.js", // 노드 서버 실행하는 명령어
  "ext": "js json"
}
```
> 즉, watch에 있는 파일, 폴더가 내용이 바뀐다면 exec가 노드 서버를 다시 실행하게 한다.<br>

## HTTP 요청 주소 체계 이해하기
[위로가기](#백엔드-서버-만들기)

#### \back\index.js
```js
const express = require('express');

const app = express();

app.get('/', (req, res, next) => { // req(request의 생략), res(response의 생략)
  res.send('Hello, Server');
});

app.listen(8080, () => { // 8080은 서버의 주소(로컬호스트 서버)
  console.log('server is running on localhost:8080');
});
```

app.get의 `'/'`는 주소이다. 로컬호스트의 뒤에 붙는 주소이다. <br>

프론트(클라이언트) <br>
↓(요청)　↑(응답) <br>
서버(백엔드) <br>

프론트에서 요청을 보내면 백엔드가 요청을 돌려보낸다(응답) <br>
요청과 응답이 종류가 많아서 약속을 정했다. <br> 
그 약속이 RESTAPI, GRAPH-QL이라는 대포적으로 두 가지 방식이 있다. <br>

실제로 RESPAPI 규칙이 있는데, 규칙 지키는게 힘들어서 HTTP API으로 타협을 본다. <br>
/user : 유저 <br>
/posts : 게시글 <br>
/user/follow : 사용자의 팔로워 <br>
이렇게만 봐서 힘들기 때문에 메서드라는게 있다 <br>
메서드는 `GET(조회), POST(생성), PUT(전체 수정), PATC(일부 수정)), DELETE(삭제)`가 있다. <br>

/user : 유저(GET) <br>
/posts : 게시글(POST) <br>
/user/follow : 사용자의 팔로워(DELETE) 로 정해져 있다면, <br>
user는 유저 조회하고, post 게시글을 생성하고, user/follow는 유저 팔로워를 삭제한다. <br>

웹사이트 접속, 페이지 로딩, 새로고침은 GET 주소 요청이다. <br>

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

`http://localhost:8080/` 를 하면 `Hello, Server`가 나온다. <br>
`http://localhost:8080/about` 를 하면 `about`가 나온다. <br>

그리고 포트 8080(http에 사용), 443(https에 사용)은 숨겨져있다. <br>
예시) https://도메인주소:443/ <br>

## Sequelize와 ERD
[위로가기](#백엔드-서버-만들기)

<pre><code>npm i -g sequelize-cli</code></pre>
이번에는 전역변수로 설치해준다.<br>
이걸 해줘야만, sequelize라는 명령어를 사용할 수 있다. <br>

<pre><code>sequelize init</code></pre>
위에 명령어를 사용하면, config(.gitignore에 설정해서 안보임), models의 폴더가 생긴다. <br>

#### \back\models\index.js의 기본설정 (전에 있던 내용 다 삭제하고 이렇게 바꿈)
```js
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('/../config/config.json')[env]; // config.json을 불러온다. 
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config); // 시퀄라이즈를 초기화 한다.
// sequelize를 조작해서 db를 컨트롤(시작, 종류, 진행 등) 할 수 있다.
// 시퀄라이즈로 트렌젝션 처리도 가능하다.

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

```

models의 폴더에 파일(comment.js, hashtag.js, image.js, post.js, user.js)를 만들어준다. <br>

#### \back\models\user.js
```js
module.exports = (sequelilze, DataTypes) => {
  const User = sequelilze.define('User', {
    nickname: {
      type: DataTypes.STRING(20), // 20자 이하
      allowNull: false, // 필수
    },
    userId: {
      type: DataTypes.STRING(20), // 20자 이하
      allowNull: false,
      unique: true, // 고유한 값, 겹치지 않는다.
    },
    password: {
      type: DataTypes.STRING(100), // 100자 이하
      allowNull: false,
    },
  }, {
    charset: 'utf8', // charset, collate를 해줘야 한글이 저장된다. 
    collate: 'utf_general_ci', // charset, collate를 해줘야 한글이 저장된다.
  });
  User.associate = (db) => {
    db.User.hasMany(db.Post); // User가 Post의 글을 여러게 작성할 수 있다.
    db.User.hasMany(db.Comment); // User가 Post의 댓글을 여러게 작성할 수 있다.
  };
  return User;
};
```

## 테이블간의 관계들
[위로가기](#백엔드-서버-만들기)

#### \back\models\post.js
```js
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    content: {
      type: DataTypes.TEXT, // 글자가 몇 글자수가 될지 모를 떄 TEXT를 사용
      allowNull: false,
    }
  }, {
    charset: 'utf8nb4', // 한글 + 이모티콘 사용가능
    collate: 'utf8nb4_general_ci',
  });
  Post.asscoiate = (db) => {
    db.Post.belongsTo(db.User); // Post가 User에 속해져 있다.
    db.post.hasMany(db.Comment);
    db.Post.hasMany(db.Image);
  };
  return Post;
};
```
> belongsTo가 있는 테이블에 다른 테이블의 id를 저장한다. (Post 테이블에 UserId 저장)


#### \back\models\image.js
```js
module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
    src: {
      type: DataTypes.STRING(200), // 이미지 경로를 적어놓았다.
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

#### \back\models\image.js
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
    // 다대다 관계에는 중간에 테이블이 생긴다. 
    // 서로 간의 관게를 정리해주는 테이블이다.
    // 그 중간 테이블(through)의 이름은 PostHashTag라고 한다.
    // PostHashTag도 테이블이라는 것 잊지말기!! 
  };
  return Hashtag;
};
```

다대다 관계, M:N관계를 형성하고 있다. <br>
다대다 관계에서는 중간 테이블이 있다. <br>
그 중간 테이블의 정의할려면 `through`을 사용한다. <br>

여기에서 <strong>다대다 관계</strong>를 정리할려고하는데, <br>
HashTag랑 User의 해쉬태그 M:N관계(다대다관계) <br>
User랑 Post의 좋아요 M:N관계(다대다관계) <br>
User랑 User의 팔로워 M:N관계(다대다관계) <br>
Post랑 Post의 리트윗 M:N관계(다대다관계) <br>



### 테이블정리
> 일반 테이블 5개 (Comment, Hashtag, Iamge, Post, User) <br>
> 다대다 관계에서 생기는 테이블 4개 (Like, Follow, PostHashTag, Retweet) <br>
> 총 테이블 : 9개(Comment, Hashtag, Iamge, Post, User, Like, Follow, PostHashTag, Retweet) <br>

실제로 moelds에서는 파일 5개(index.js제외)이지만, 중간 테이블도 합해서 늘어났다. <br>

유독히, SNS가 테이블관계가 많이 생긴다. <br>

다음 DB설명을 계속 진행될 것이다. 


## 시퀄라이즈 Q&A와 DB 연결하기
[위로가기](#백엔드-서버-만들기)

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
    // 여기에 보면 Post, Post똑같다 구별이 안되서 as로 구별하면 된다.
    db.Post.belongsTo(db.Post, { as : 'Retweet' }); // 리트윗 테이블
    db.Post.belongsToMany(db.Hashtag, { through: 'PostHashTag' }); 
    db.Post.belongsToMany(db.User, { through: 'Like' }); 
    
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
    collate: 'utf_general_ci',
  });
  User.associate = (db) => {
    db.User.hasMany(db.Post, {as : 'Post'} );
    db.User.hasMany(db.Comment);
    db.User.belongsToMany(db.Post, { through: 'Like', as: 'Liked' }); 
    // 하지만 여기에서  db.User.hasMany(db.Post);, db.User.belongsToMany(db.Post, { through: 'Like' }); 
    // db.User, db.Post 이름 똑같은 곳이 2개가 있어서 구별이 안된다.
    // 그러기 위해서 한 쪽에 as를 넣어서 구별을 해주는 것이 좋다.

    db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followers' }); // 사용자랑 사용자의 팔로워 관계
    db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followings' }); // 사용자랑 사용자의 팔로잉 관계
    // 그리고 같은 테이블에 다대다 관계있으면 as를 꼭 적어줘야한다. 위에 보면 예시가 있다.
    // as는 꼭 적어줘야한다. 값을 가져올 때 as라는 이름으로 가져온다.

    
  };
  return User;
};
```
> Tip) belongsToMany는 as를 넣어주는게 좋다.

```js
mysql.query('SELECT * FROM USER JOIN .... GROUB BY... HAVING');
```
위에 경우에는 문자열이 되는순간, 자바스크립트에서 관리하기 힘들어진다. <br>
재사용하기도 힘들고, 재 사용할려면 시퀄라이즈처럼 바껴진다. <br>

MySql - knex - sequelize/typeorm <br>
생 쿼리 - 자바스크립트로 SQL만들어준다 - 테이블까지 자바스크립트로 관리 <br>

생 쿼리는 MySQL자신 있으면 사용하면된다. <br>
왜냐하면, 쿼리문은 100줄, 1000줄 넘을 수도 있기때문이다. <br>
결국에는 knex 또는 sequelize를 사용하게 된다. <br>


```js
  const User = sequelilze.define('User', { 
```
define옆에 보면 `User`가 있는다.  <br>
테이블 생성할 때 자동으로 `user(소문자)`로 바꿔진다. <br>
바껴지는게 싫어한다면 <br>
```js
module.exports = (sequelilze, DataTypes) => {
  const User = sequelilze.define('User', { 
    ...생략
  }, {
    charset: 'utf8',
    collate: 'utf_general_ci',
    tableName: '테이블명 마음대로 정하기' // 테이블 명을 내가 정할 수가 있다.
  });
  User.associate = (db) => {
    ...생략
  };
  return User;
};
```

#### \back\index.js
```js
const express = require('express');

const db = require('./models'); // models의 파일을 불러온다.

const app = express();
db.sequelize.sync(); /// 자동으로 테이블 생성 
app.get('/', (req, res, next) => {
  res.send('Hello, Server');
});
...생략

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

db.Comment = require('./comment')(sequelize, Sequelize); // 설정해준다.
db.Hashtag = require('./hashtag')(sequelize, Sequelize); // 설정해준다.
db.Image = require('./image')(sequelize, Sequelize); // 설정해준다.
db.Post = require('./post')(sequelize, Sequelize); // 설정해준다.
db.User = require('./user')(sequelize, Sequelize); // 설정해준다.
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

```

시작하기전에 밑에 실행해주기 <br>
`sequelize db:create` <br>
그리고 또한 에러메세지가 나온다. 에러메시지는 구글에 검색하면서 하면 해결할 수 있을 것이다. <br>
불안하다면, back.md파일에 있다. <br>

> 정상적으로 실행하면 실제로 테이블이 5개 추가되는데, 좋아요버튼이나, 리트윗버튼을 누르면 테이블이 새로 생긴다.  <br>



## 백엔드 서버 API 만들기
[위로가기](#백엔드-서버-만들기)

<strong>API</strong>는 다른 서비스가 내 서비스의 기능을 실행할 수 있게 열어둔 창구 <br>
프론트에서 백엔드서버에서 요청을 할 수 있고, 응답도 할 수 있게한다. <br>

> 즉, API를 더 간단하게 설명하자면, 다른 서버가 내 것을 서비스를 사용할 수있게 하는 것이다.<br>

#### \back\index.js
```js
const express = require('express');

const db = require('./models');

const app = express();
db.sequelize.sync();

// 내 정보 가져오기
app.get('/api/user', (res, req) => { // api는 api라는 것을 알려주기 위해 붙여줬다.

});

// 사용자 등록하기
app.post('/api/user', (req, res) => { // api는 api라는 것을 알려주기 위해 붙여줬다.

});

app.get('/api/user/:id', (req, res) => { // api는 api라는 것을 알려주기 위해 붙여줬다.

})
app.post('/api/user/logout', (req, res) => { // api는 api라는 것을 알려주기 위해 붙여줬다.

});
app.post('/api/user/login', (req, res) => { // api는 api라는 것을 알려주기 위해 붙여줬다.

});
app.get('/api/user/:id/follow', (req, res) => { // api는 api라는 것을 알려주기 위해 붙여줬다.

});
app.post('/api/user/:id/follow', (req, res) => {

});
app.delete('/api/user/:id/follow', (req, res) => {

});
app.delete('/api/user/:id/follower', (req, res) => {

});
app.get('/api/user/:id/posts', (req, res) => {

});

app.listen(3065, () => {
  console.log('server is running on (서버주소) : http://localhost:3065');
});
```

다른 유저 정보 가져오기(:id 에다가 id를 넣어준다) <br>

### :id의 의미(req.params.id도 포함)
> :id는 req,params.id로 가져올 수 있다. <br>

ex) /api/user/3의 의미는 user의 ID가 3인 정보를 가져온다라는 것이다.<br> 

### 중요!!!
대충 주소만 읽어도 뭐하는 건지 일단 대충 만들어도 좋다(형태를 만들기 위해서이다.)<br>
코딩보다는 설계가 더 중요하다!!<br>

여기에서 user만 이정도 있는데, post, hashtag등이 있으면 코드가 길어진다. 그래서 지금부터 <strong>분리</strong>를 하겠다. <br>
왜? 분리를 하면 라우터 하나당 get, post 이런 것들이 다 합하면 100줄 넘기 때문이다. <br>

Tip) 되도록이면 서버에서는 import는 사용지할고, require를 사용한다. 왜냐하면, import를 사용하면 귀찮이는게 많아지기 때문이다. <br>

#### \back\index.js
```js
const express = require('express');

const db = require('./models');
const userAPIRouter = require('./routes/user'); // 추가해준다

const app = express();
db.sequelize.sync();

app.use('/api/user', userAPIRouter); // 추가해준다
// 이렇게 하면 합쳐진다

app.get('/api/posts', (req, res) => {

});
app.post('/api/post', (req, res) => {

});
app.post('/api/post/images', (req, res) => {

});

app.listen(3065, () => {
  console.log('server is running on (서버주소) : http://localhost:3065');
});
```

routes폴더, user.js를 생성해준다. <br>

#### \back\routes\user.js
```js
const express = require('express');
const router = express.Router();

// /api/user를 삭제해준다.
router.get('/', (res, req) => { // 합쳐져서: /api/user/

});
router.post('/', (req, res) => {

});
router.get('/:id', (req, res) => {

})
router.post('/logout', (req, res) => { // /api/logout

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

여기에서 routes의 폴더에 `post.js`, `posts.js`가 두 개있는데 단수, 복수를 구별해주기 위해서 만들어주었다. <br>

> post.js는 하나의 게시글 <br>
> posts.js는 여러 개의 게시글이다. <br>

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
보다시피 전의 index.js랑 비교하면 코드가 깔끔해지고 보기가 좋아졌다. <br>


## 회원가입 컨트롤러 만들기
[위로가기](#백엔드-서버-만들기)

### 의미중요!!!!!
GET /user (사용자 정보를 가져온다)<br>
POST /user (사용자 등록 -> 데이터가 필요한다.)<br>
이럴 때 요청(req)에 헤더(header) 본문(body) 같이 보낼 수 있다. 즉, req => header + body<br>
본문에다가 데이터를 넣어서 보낸다. <br>

res(응답) <br>
여기서 req, res의 의미는 <br> 
req(Requset)  : 요청  <br>
res(Response) : 응답 <br>

200 : 성공 <br>
300 : 리다이렉션 <br>
400 : 요청 오류 <br>
500 - 서버오류 <br>

```js
  // 이건 에러의 의미가 아니다.
  // stats가 있어야만 에러가 된다.
  return res.status(400~500).send('이미 사용중인 아이디입니다.'); 의미이다.
  // 이건 에러의 의미는 아니다
  return res.send('이미 사용중인 아이디입니다.');
```
 
#### \back\routes\user.js
```js
const express = require('express');
const bcrypt = require('bcrypt'); // 추가
const db = require('../models'); // 추가

const router = express.Router();


router.get('/', (res, req) => { 

});

router.post('/',  async (req, res) => { // POST /api/user 회원가입
  try {
    // 유저 회원가입 있는지 판단
    // DB의 유저 아이디를 찾는다 (db.User.findeOne)
    const exUser = await db.User.findOne({ // 비동기라서 await를 붙어준다
      where: {
        userId: req.body.userId,
      },
    });
    if (exUser) { // 유저가 존재하면
      return res.status(403).send('이미 사용중인 아이디입니다.'); 
    }
    const hashtPassword = await bcrypt.hash(req.body.password, 12); // 비밀번호를 암호화한다 
    // 보통 10~12사이로 한다. 숫자가 클 수록 암호화가 좋지만, 시간이 너무 걸린다.
    const newUser = await db.User.create({// 새로운 유저 등록
      nickname : req.body.nickname,
      userId: req.body.userId,
      password: hashtPassword,
    });
    console.log(user);
    // 새로운 생성된 유저가 등록된다.
    return res.status(200).json(newUser); // json 객체를 보낸다 <-> send는 문자열이다.
    // json형식으로 되어있으니, json형식으로 보내주는 것이다.
  } catch (e) {
    // 에러가 났을 때에는 여기가 걸린다.
    // 여기 2가지 방법이 있다.
    console.error(e);
    return res.status(403).send(e); // 이런식으로 해도된다.

    // next를 사용할 경우에는 에러처리를 해야한다.
    // 왜냐하면 에러걸리면 다 에러로 통과하기 때문에
    return next(e);
  }

});
...생략

module.exports = Router;
```

#### \back\index.js

```js
...생략

const app = express();
db.sequelize.sync();

// 두 줄을 추가해야한다.
app.use(express.json()); // json 형식 본문을 처리한다. 
app.use(express.urlencoded({ extended: true })); // form으로 넘어오는 데이터를 처리를 한다
// 그래서 이 두개를 추가해야만, req.body가 정상적으로 동작한다.

app.use('/api/user', userAPIRouter);
...생략
```

## 실제 회원가입과 미들웨어들
[위로가기](#백엔드-서버-만들기)

실제 회원가입하기 위해서 프론트 코드를 바꿔 줘야한다. <br>

#### \front\pages\signup.js
```js
...생략
const Signup = () => {
  ...생략
  
  const onSubmit = useCallback((e) => {
    e.preventDefault();
    if ( password !== passwordCheck) {
      return setPasswordError(true);
    }
    if (!term) {
      setTermError(true);
    }
    dispatch({
      type : SIGN_UP_REQUEST,
      data : {
        userId : id, // 수정
        password, // 수정
        nickname : nick, // 수정
        // userId, password, nickname를 서버로 보내야한다.
      }
    }); 
    // useCallback안에 배열인자는 useState를 넣어주는 것 잊지말기
    }, [id, nick, password, passwordCheck, term]);
  ...생략
```

#### \front\pages\signup.js
```js
import axios from 'axios';
import { all, fork, takeLatest, call, put, delay } from 'redux-saga/effects';
import { LOG_IN_REQUEST, LOG_IN_SUCCESS, LOG_IN_FAILURE, SIGN_UP_REQUEST, SIGN_UP_FAILURE, SIGN_UP_SUCCESS } from '../reducers/user'
...생략

function signUpAPI(signUpdata) {
  // 일단 다른 서버이기 때문에 주소를 붙여줘야한다.
  return axios.post('http://localhost:3065/api/user/', signUpdata);
  // 이렇게 axios가 post요청을 보내준다. 첫번 쨰는 주소, 두 번쨰는 데이터

  // 그 다음에 백엔드로 간다.
}

function* signUp(action) { // 여기 action에 데이터(userId, pssword, nickname)가 들어있다
  try {
    yield call(signUpAPI, action.data); // call의 첫번 째가 함수이고, 두번 째가 인자이다
    // action.data가 signUpAPI의 매겨변수(signUpdata)에 전달된다.
    yield put({
      type: SIGN_UP_SUCCESS
    });
  } catch (e) {
    console.error(e);
    yield put({ 
      type : SIGN_UP_FAILURE,
      error : e,
    });
  }
}

function* watchSignUp() {
  yield takeLatest(SIGN_UP_REQUEST, signUp);
}

export default function* userSaga() {
  yield all([
    fork(watchLogin),
    fork(watchSignUp)
  ]);
}
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

app.use(morgam('dev')); // 요청들어오는 것에 대해서 기록이 남는다.
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
 
로그 기록이 안되어서 `morgan`을 사용하겠다. <br>


### CORS문제 해결
에러 내용이 나오는데 <br>
> Access to XMLHttpRequest at 'http://localhost:3065/api/user/' from origin 'http://localhost:3000'  <br>
> has been blocked by CORS policy: Cross origin requests are only supported <br>
> for protocol schemes: http, data, chrome, chrome-extension, https. <br>
프론트 주소 : http://localhost:3000 <br>
백엔드 주소 : http://localhost:3065/api/user/ <br>

해결하기 위해서 CORS를 설치 했을 것이다. CORS문제는 서버(백엔드)쪽에서 해줘야한다. <br>

### 백엔드 응답메세지를 프론트에 출력!!
res.send, res.status.(400~500).send 프론트 쪽에 메세지출력을 하고 싶은데 어떻게 해야할까? <br>
```js
if (exUser) {
  // return res.send('이미 사용중인 아이디입니다.');
  return res.status(403).send('이미 사용중인 아이디입니다.'); 
}
```
즉, `이미 사용중인 아이디입니다`의 응답메세지를 프론트에 출력을 어떻게 해줘야 하나요??

> 프런트에서 axios를 사용한다면 `axios.post().catch((err) => err.response.data)`에 있다.


## 로그인을 위한 미들웨어들
[위로가기](#백엔드-서버-만들기)


이제부터 로그인을 할 것이다. <br>
로그인을 하기위해서 준비사항이 있다. <br>

아이디로 기존 가입했던 사람비교, 가입한 사람있으면 비밀번호 비교, 비밀번호 맞으면 성공<br>
하지만 여기서 끝이 아니다. 로그인을 했으면 기록을 남겨야한다.<br>
그 유저의 정보를 프론트, 서버(백엔드)에도 전달해야한다.<br>
게다가, 유저정보는 민감한 것이라서 서버(백엔드)쪽에 많이 둔다. <br>
근데 이것을 알기위해서 인증을 받아야한다. 그 인증을 쉬운 방법이 <strong>쿠기(cookie)</strong>가 있다. <br>
쿠키가 남아있으면 "로그인이 되어있구나" 라고 알아차린다. 그래서 쿠키의 존재여부가 중요하다. <br>
쿠키는 서버쪽에서 프론트쪽으로 보내준다. 그것을 설정해줘야한다. <br>

> 정리) 사용자 정보는 서버의 세션에, 프론트에는 세션을 조회할 수 있는 쿠키를 전달 <br>

지금부터 쿠기 및 세션설정을 시작하겠다. <br>

#### \back\index.js
```js
...생략
const cookieParser = require('cookie-parser'); // 추가
const expressSession = require('express-session'); // 추가

...생략

app.use(morgam('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors()); 
app.use(cookieParser('nodebirdcookie'));
app.use(expressSession({
  resave: false, // 매번 새션 강제 저장
  saveUninitialized: false, // 빈 값도 저장
  
  // 여기서 쿠키 값들도 암호화를 해줘야한다.
   secret: 'nodebirdcookie',
   // 쿠키 설정
   cookie: {
     httpOnly: true, // 자바스크립트로 쿠키 접근을 못한다. 항상 true를 해준다.
     secure: false, // https를 사용할 때 true를 해줘야한다.
   }

   // 여기서 소스코드가 털리면 nodebirdcookie가 유출된다.  
}));

app.use('/api/user', userAPIRouter);
...생략
```

그래서 여기에 `.env` 등장할 것이다.

#### \back\index.js
```js
...생략
const dotenv = require('dotenv'); // 추가

dotenv.config(); // 추가
const db = require('./models');
const userAPIRouter = require('./routes/user');
...생략

...생략
app.use(cors()); 
app.use(cookieParser(process.env.COOKIE_SECRET)); // 수정
app.use(expressSession({
  resave: false, 
  saveUninitialized: false, 
  secret: process.env.COOKIE_SECRET, // 수정
  cookie: {
    httpOnly: true, 
    secure: false,
  }
}));

...생략
```

그리고 DB설정했던 것들 `config/config.json` json파일을 `config/config.js` js파일로 바꿔준다. <br>
json파일 -> js파일 (모듈화를 해줘야한다.) <br>

#### \back\config\config.json (수정 전)
```json
"development": {
  "username": "유저이름",
  "password": "비밀번호",
  "database": "DB명",
  "host": "호스트 설정(ex 127.0.0.9)",
  "port": "포트명설정(정수형으로) 예시)3265",
  "dialect": "mysql",
  "operatorsAliases": false
},
"test": {
  "username": "유저이름",
  "password": "비밀번호",
  "database": "DB명",
  "host": "호스트 설정(ex 127.0.0.9)",
  "dialect": "mysql",
  "operatorsAliases": false
},
"production": {
  "username": "유저이름",
  "password": "비밀번호",
  "database": "DB명",
  "host": "호스트 설정(예시:127.0.0.9)",
  "dialect": "mysql",
  "operatorsAliases": false
}
```

#### \back\config\config.js (수정 후)
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

### *** 보너스 추가 ( 이미 회원가입된 유저확인) ***
<strong>즉, 백엔드에서의 메세지를 프론트에 출력하기</strong><br>
순서 : sagas -> reducer -> pages/signup.js <br>

```js
if (exUser) { 
  // return res.send('이미 사용중인 아이디입니다.'); // 에러 안나오게 하는거
  return res.status(403).send('이미 사용중인 아이디입니다.'); // 에러나오게 하는거
}
// 백엔드 이 메세지를 프론트에 출력하겠다.
```

#### \front\pages\signup.js
```js
...생략

const Signup = () => {
  ...생략
  const {isSigningUp, me, isSignUpSuccesFailure, signUpErrorReason} = useSelector(state => state.user); // isSignUpSuccesFailure, signUpErrorReason 추가

  ...생략
  
  return (
    <>
      <Form onSubmit={onSubmit} style={{ padding : 10}} >
        ...생략
        ...생략
        ...생략
        <div style={{ marginTop : 10}}>
          <Button type="primary" htmlType="submit" loading={isSigningUp} >가입하기</Button>
        </div>
        <div>
          {isSignUpSuccesFailure && <div>{signUpErrorReason}</div>} // 추가
        </div>
      </Form>
    </>
  );
};

export default Signup;
```

#### \front\reducers\user.js
```js
...생략
export const initialState = {
  ...생략
  signedUp: false, // 회원가입 성공
  isSigningUp: false, // 회원가입 시도중
  isSignedUp : false, // 회원가입이 되어졌음.
  signUpErrorReason: '', // 회원가입 실패 이유
  isSignUpSuccesFailure: false, // 회원가입 성공여부 (추가)
  me: null, // 내 정보
  ...생략
};

...생략

export default (state = initialState, action) => {
  switch (action.type) {
    ...생략
    ...생략
    case SIGN_UP_REQUEST: { 
      return { 
        ...state, 
        isSigningUp: true,
        isSignedUp: false,
        signUpErrorReason: '',
        isSignUpSuccesFailure: false, // 추가
      }; 
    }
    case SIGN_UP_SUCCESS: { 
      return { 
        ...state, 
        isSigningUp: false,
        isSignedUp: true, 
        isSignUpSuccesFailure: false, // 추가
      }; 
    }
    case SIGN_UP_FAILURE: { 
      return { 
        ...state, 
        isSigningUp : false,
        signUpErrorReason : action.error, // 추가
        isSignUpSuccesFailure: true, // 추가
      }; 
    } 
    default: {
      return {
        ...state,
      }
    }
  }
};
```


#### \front\sagas\user.js
```js
...생략

function* watchLogin() {
  yield takeLatest(LOG_IN_REQUEST, login);
}

function signUpAPI(signUpdata) {
  return axios
  .post('http://localhost:3065/api/user/', signUpdata);
  // .catch((err) => { console.log(err.response.data); return err.response.data }); 
  // 위에 주석된 처리를 보면, 여기서 DB에 저장된 유저정보를 다시 입력폼에 똑같은 아이디, 닉네임, 패스워드 입력하고 
  // 가입하기 버튼을 누르면, Redux Devtools를 보면 결과가 SIGN_UP_SUCCESS가 나온다.
  // 해결하기 위해서는 
  // 밑에 function* signUp(action) 이 부분의 소스를 보면
}

function* signUp(action) {
  try {
    yield call(signUpAPI, action.data); 
    yield put({
      type: SIGN_UP_SUCCESS
    });
  } catch (err) {
    // axios 뒤에 직접 catch를 붙이시면 에러들이 해결된 것으로 나와버린다. axios 뒤에는 catch를 떼야한다.
    console.dir(err); // 이것도 참고
    yield put({ 
      type : SIGN_UP_FAILURE,
      error : err.response.data, // 여기!! 에러메세지를 여기에 전달을 해줘야한다.
      // 서버(백엔드)의 에러 처리를 여기에 받아서 reducer에 그 데이터를 넘겨주는 것이다
    });
  }
}

function* watchSignUp() {
  yield takeLatest(SIGN_UP_REQUEST, signUp);
}
...생략
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
// passport.session()은 expressSession()밑에다가 작성해줘야한다.
// passport.session()이 expressSession을 내부적으로 사용해서 
//먼저 expressSession 실행완료된 후에  passport.session()이 실행해야한다.
// -> 미들웨어간에 서로 의존관계가 있는 경우 순서가 중요하다.



app.use('/api/user', userAPIRouter);
app.use('/api/post', postAPIRouter);
app.use('/api/posts', postsAPIRouter);

app.listen(3065, () => {
  console.log('server is running on (서버주소) : http://localhost:3065');
});
```

passport폴더를 생성한다. 그리고 index.js, local.js도 만들어준다. <br>

#### \back\passport\index.js
```js
const passport = require('passport');
const db = require('../models');

module.exports = () => {
  passport.serializeUser((user, done) => { // 서버쪽에 [{id :3, cookie: 'asdfgh'}]
  // 이런식으로 배열 안에 저장한다. cookie는 프론트에 보낸다. 
  // 프론트에서 cookie의 'asdfgh'라는 쿠키를 서버에 보내면 'asdfgh'는 id가 3번이랑 연결되어있구나라고 판단을 한다. 
  // 이걸 serializeUser작업이라고한다. id가 3인 것만 서버쪽에 저장하니까 메모리 낭비하지 않는다.
  // 여기서 실제로 데이터를 사용할 때에는 id가 3인 밖에 모른다.
  // 그래서 deserializeUser작업을 해서 유저정보를 되찾는다. id가 3인 데이터를 찾는다.
  // done은 나중에 설명한다.
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
프로필을 보면 나의 정보가 어마어마하게 많다고 가정하면, <br>
이 모든 것들을 서버에 저장하면 서버에 무리가 있기때문에, 서버가 터진다. <br>
서버 안 터지게 할려면, `serializeUser`, `deserializeUser` 를 사용한다. <br><br>


대부분 90퍼 사이트 쿠키, 세션으로 되어있다. <br>
여기서 jwt 인증방식도 있는데 요청이 많이 쏟아지거나 대규모에서 사용한다. <br>


## passport 로그인 전략
[위로가기](#백엔드-서버-만들기)

#### \front\sagas\user.js
```js
...생략
function loginAPI(loginData) { // loginData추가
  return axios.post('/login', loginData); // loginData 추가
}

function* login(action) { // action추가
  try {
    yield call(loginAPI, action.data); // action.data 추가
    yield put({
      type: LOG_IN_SUCCESS,
    })
  } catch (e) {
    console.error(e);
    yield put({
      type: LOG_IN_FAILURE,
    })
  }
}

function* watchLogin() {
  yield takeLatest(LOG_IN_REQUEST, login);
}
...생략
```

passport의 local이 로그인 전력이라고 한다. <br>

#### \back\passport\local.js
```js
const passport = require('passport');
const { Strategy : LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');
const db = require('../models');

module.exports = () => {
  passport.use(new localStorage({
    // 프론트에서 id, password가 여기에 들어온다.
    usernameField: 'userId', // 여기에다가 req.body의 속성명을 입력한다.
    passwordField: 'password'
  }, async ( userId, password, done) => {
    // 여기에서 로그인 전략이 수행한다.
    try {
      const user = await db.User.findOne({ // DB에서 유저 아이디 검색
        userId // async의 userID
      });
      if (!user) { 
        return done(null, false, {reason: '존재하지 않는 사용자입니다.'});
      }
      const result = await bcrypt.compare(password, user.password); // 프론트에 password랑 디비에 password를 비교한다
      // compare는 bcrypt에서 제공해준다.
      if (result) { // 로그인 성공했을 때
        return done(null, user);
      }
      // 로그인 실패 했을 때
      return done(null, false, {reason: '비밀번호가 틀립니다.'});
    } catch (e) {
      console.error(e);
      return done(e); // 서버에러
    }
  }));
}

```

<h3>done의 의미</h3>
여기에서 <strong>done</strong>은 <br>
`done( 첫번째 인수, 두번쨰 인수, 세번쨰 인수)` <br>
`첫번째 인수 : 서버에러` <br>
`두번쨰 인수 : 성공여부` <br>
`세번쨰 인수 : 로직상에서 에러가 나왔을 때, 즉, 존재하지 않는 사용자라서 강제적으로 종료시킨다.` <br>

#### \back\passport\index.js
```js
...생략
const local = require('./local');

module.exports = () => {
  ...생략
  });
  local(); // 마지막으로 local로 연결해준다.

}
```

#### \back\passport\index.js
```js
...생략
const passport = require('passport');

const passportConfig = require('./passport'); // 추가
const db = require('./models');
...생략

dotenv.config(); 
const app = express();
db.sequelize.sync();
passportConfig(); // 추가

app.use(morgam('dev'));
...생략
```

여기까지 했으면, 실제로 <br>
프론트에서 서버(백엔드) 요청도 보내야 할 것이다. <br>

#### \back\routes\user.js
```js
...생략
const passport = require('passport'); // 추가

const router = express.Router();

...생략

// 여기에다가 요청을 보내 줄 것이다. 
// 여기에서 passport = require('pass') 불러오는 코드가 필요하다.
router.post('/login', (req, res, next) => { // POST /api/user/login
  // 구글 로그인 구현하고 싶으면
  // passport.authenticate('google', )
  // 네이버 로그인 구현하고 싶으면
  // passport.authenticate('naver', )

  passport.authenticate('local', (err, user, info) => {
    // err, user, info는 
    // done의 (첫번째 인수(서버 에러), 두번쨰 인수(성공여부), 세번쨰 인수(로직상 에러)) 이다
    if (err) {// 서버에러 일 경우
      console.error(err);
      return next(err);
    } 
    if (info) { // 로직 상 에러 일 경우
      return res.status(401).send(info.reason); // 에러 내용을 보낸다.
      // info.reason가 '존재하지 않는 사용자입니다.', '비밀번호가 틀립니다'가 실행된다. 
    } 
    return req.login(user, (loginErr) => { // 로그인을 시켜준다
      if (loginErr) { // 하지만, 로그인 에러가 나올 수도 있으니까 사용해준다.
        return next(loginErr);
      }
      // 로그인을 성공하면 서버쪽에 쿠기, 세션이 저장이된다. 그리고 사용자 정보를 보내준다.
      // 프론트에 사용자 정보를 JSON형태로 보내주는데, 사용자 정보에 비밀번호가 들어있다. 비밀번호를 감춰주기 위해서는 밑에 형식과 같이 적어준다.
      const filteredUser = Object.assign({}, user); // 참조, 복사를 해준다
      delete filteredUser.password; // 패스워드를 삭제해준다.
      return res.json(filteredUser); // 패스워드를 제외한 데이터를 보내준다.
    });
  })(req, res, next);
});
...생략
```
여기까지 로그인 싸이클이다. <br>


