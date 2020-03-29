# 백엔드 서버 만들기

+ [백엔드 서버 구동에 필요한 모듈들](#백엔드-서버-구동에-필요한-모듈들)
+ [HTTP 요청 주소 체계 이해하기](#HTTP-요청-주소-체계-이해하기)
+ [Sequelize와 ERD](#Sequelize와-ERD)

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


