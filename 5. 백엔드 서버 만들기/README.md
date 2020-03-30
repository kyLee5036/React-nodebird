# 백엔드 서버 만들기

+ [백엔드 서버 구동에 필요한 모듈들](#백엔드-서버-구동에-필요한-모듈들)
+ [HTTP 요청 주소 체계 이해하기](#HTTP-요청-주소-체계-이해하기)
+ [Sequelize와 ERD](#Sequelize와-ERD)
+ [테이블간의 관계들](#테이블간의-관계들)
+ [시퀄라이즈 Q&A와 DB 연결하기](#시퀄라이즈-Q&A와-DB-연결하기)
+ [백엔드 서버 API 만들기](#백엔드-서버-API-만들기)


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