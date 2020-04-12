# 기능 완성해나가기

+ [해시태그 링크로 만들기](#해시태그-링크로-만들기)
+ [next와 express 연결하기](#next와-express-연결하기)



## 해시태그 링크로 만들기
[위로가기](#기능-완성해나가기)

해시태그를 클릭할 수 있게 만들어줘야한다. <br>
클릭할 수 있게 만들어줄려면, content에서 해시태그를 찾아서 링크로 만들어줘야한다. <br>

#### \front\components\PostCard.js
```js
import Link from 'next/link' // 추가

...생략

<Card.Meta 
  avatar={<Avatar>{post.User.nickname[0]}</Avatar>}
  title={post.User.nickname}
  description={<div>post.content</div>} // 문자열 안에 있는 문자를 링크로 바꿔줘야한다.
  // a 태그가 아니라 -> next의 Link태그로 바꿔줘야한다. 
  // 왜? SPA를 유지할려면 a태그가 아니라 link를 해줘야하기때문이다.
/>
...생략
```

#### \front\components\PostCard.js
```js
...생략

  return (
    <div>
      ...생략
        <Card.Meta 
          avatar={<Avatar>{post.User.nickname[0]}</Avatar>}
          title={post.User.nickname}
          description={(
            <div>
              {post.content.split(/(#[^\s]+)/g).map((v, i) => { // 문자열을 나누었다
                if (v.match(/#[^\s]+/)) { // 문자열을 나누어서 해시태그이라면 링크
                  return (
                    <Link href="/hashtag" key={i} ><a>{v}</a></Link>
                  );
                }
                return v; // 그냥 문자열로 반환
              })}
            </div>
          )}
        />
      </Card>
      ...생략 
    </div>
  )
};
...생략
export default PostCard;
```

해시태그 눌러도 같은 페이지로 가고있다. <br>
"좋아요"해시태그를 누르면 "좋아요"가 달린 해시태그 게시글이 달려야하지만, <br>
여기서 주소가 고정되어서 수정이 안된다. <br>

#### \front\pages\hashtag.js
```js
import React from 'react';

const Hashtag = () => {
  return (
    <div>Hashtag</div>
  );
}

export default Hashtag;

```

> next는 동적 주소를 처리하지 못 한다(쿼리스트링으로 하면 할 수 있긴하다.) 

"좋아요" 누르면 -> hashtag/좋아요 <br>
"구독" 누르면 -> hashtag/구독 <br>
"리액트" 누르면 -> hashtag/리액트 <br>
위와 같이 프론트도 할 수 있도록 해야한다. (참고로, express는 가능) <br>

### 동적으로 바꿔주기 위해서 express 사용한다.
하지만, 위와 같이 동적으로 바꿔주는 거 express는 가능한데 next는 불가능하다. <br>
그러기 위해서는 express사용하면 된다. <br>
그럴러면 `프론트 서버에서도 express를 똑같이 연결을 해줄 것`이다. <br>
결국에는, <strong>express도 프론트 서버에서도 같이 사용한다.</strong> <br>


## next와 express 연결하기
[위로가기](#기능-완성해나가기)

next랑 express 이어져서 공존한다. <br>
express가 서버가 돌아가면, 그 안에 next서버가 돌아간다. <br>

> express 서버가 next를 돌리는 거다. 그 경우 서버 자동 재시작이 안 되기 때문에 express를 nodemon을 통해 실행합니다.

프론트에 express서버가 돌아가기 때문에, express서버에 필요한 패키지들을 설치하겠다. <br>
<pre><code>npm i morgan express express-session cookie-parser dotenv</code></pre>

`server.js`파일을 만들어준다.

#### \front\server.js 기본설정
```js
const express = require('express');
const next = require('next');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const dotenv = require('dotenv');

const dev = process.env.NOCE_ENV !== 'production'; // 이 부분이 추가
// production이 아닐때만 개발환경이다.

const prod = process.env.NOCE_ENV === 'production'; // 이 부분이 추가

const app = next({ dev }); // 이 부분이 추가
const handle = app.getRequestHandler(); // 이 부분이 추가
// handler의 의미는 next에서 그렇게 하라고 해서(만들라고 해서) 만든거다.

dotenv.config();

app.prepare().then( () => { // prepare()는 next쪽에 코드, 이 부분이 추가
  // 여기 안에다가 express 코드를 적어준다.
  const server = express(); // 프론트에서는 app이 next라서 다른 변수명을 사용하였다.
  server.use(morgan('dev'));
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(cookieParser(process.env.COOKIE_SECRET)); // 백엔드쪽이랑 쿠기 같게 해준다.
  server.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })); // 백엔드랑 비슷하게 적어주면 된다.

  server.get('*', (req, res) => { // 라우터를 하나 만들어줘야한다.
    // *은 모든요청(get)을 여기에서 처리를 하겠다는 의미
    return handle(req, res); // handler은 요청처리기 이다. 연결해주는 것도 잊지말아야한다.
  });

  server.listen(3060, () => {
    console.log("next-express running on port 3060");
  })
}); // 이렇게 하면 둘이 연결이 된다.
```
프론트 서버 주소 : http://localhost:3060 <br>

#### \front\package.json
```json
{
  ...생략
  "main": "index.js",
  "scripts": {
    "dev": "nodemon", // next를 nodemon으로 수정해줘야한다. 
    // 왜냐하면, nodemon에서 next를 실행하기 떄문에
    "build": "next build",
    "start": "next start"
  },
  "author": "LEEKY",
  "license": "MIT",
  "dependencies": {
  ...생략
  }
```

#### \front\nodemon.js

```json
{
  "watch": [
    "server.js",
    "nodemon.json"
  ],
  "exec": "node server.js",
  "ext": "js json jsx"
}
```
nodemon.js를 만들어줄려는 이유는 주소를 동적으로 할려고, <br>
해시태그 뒤에 좋아요, 구독 붙여서 검색을 하기위해서 한다. <br>


프론트에서 next와 express를 연결한건 동적라우팅을 쓰려하는데, <br>
next에서 안되니 그저 express를 동적라우팅을 쓰기위한 수단으로 사용하는 건가?? <br>

> 그렇다. 이건 next9 버전에서 동적 라우팅 기능이 추가되어 해결되었다.. <br>


여기서 새로고침을 하면, 잠깐동안 로그인 안했을 화면이 보이는데, <br> 
보통은 전체 로딩창을 하는데, 그런 사이트들이 `SPA`이다.  <br>
화면상으로 로딩창으로 가려놓고, 데이터가 다 들어오면 로딩창을 없앤다. <br>
그 방식이 상당히 지저분하다. <br>

그러기위해서 서버쪽에서 데이터를 넣어주는 기술이 `서버사이드랜더링(Server Side Rending)`이다. <br>

<br><br>
이제 여기서부터는 dummy데이터를 삭제하겠다. <br>



