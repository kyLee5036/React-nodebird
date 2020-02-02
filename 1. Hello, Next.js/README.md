# Hello NextJS


+ [프로젝트 구조와 배우는 것들](#프로젝트-구조와-배우는-것들)
+ [next와 eslint 설치하기](#next와-eslint-설치하기)
+ [next 라우팅 시스템](#next-라우팅-시스템)


## 프로젝트 구조와 배우는 것들
[위로가기](#Hello-NextJS)

### 프론트 서버<br>
>React, Next, Redux, Redux-saga Styled Components <br>

### 백엔드 서버<br>
> 디비 (MySQL), ORM (시퀄라이즈), passprot, multer (S3), Socket.io, 이미지 압축(람다)


### 왜 프론트/백엔드 분리하는 이유 <br>

먼저 장단점을 소개하겠다. <br> 
장점 : 스케일링 이슈 <br> 
단점 : 복잡도 증가 <br>

<strong>프론트 서버</strong> 역할은 프론트화면 js파일, html파일, css파일을 전달하는 역할 (화면 그려주는 역할) <br>
<strong>백엔드 서버</strong> 역할은 프론트 서버에 발생하는 데이터를 처리를 한다. (데이터 역할을 잘 해주어야 한다.) <br>

### 이렇게 복잡한데, 왜? 프론트 서버랑 백엔드 서버 통합은 하지 않는 이유는?
프론트 서버랑 백엔드 서버 통합하면 화면 그려주는 요청이 많아 졌을 때 프론트 서버 늘리면서 백엔드 서버도 같이 늘려야 한다. <br>
그러면 불필요한 메모리, 자원을 차지하기 때문에 프론트랑 백엔드를 분리를 한다. (스케일링 이슈)<br>

대신, 안좋은 점은 복잡도 증가해진다. 서버가 2개다 보니까 데이터를 주고 받기가 힘들고, 또한 <strong>CORS</strong> 등의 이슈가 있다. (복잡도 증가) <br>
하지만 여기서는 복잡도 증가도를 처리하는 역할을 배운다. <br>

### 프론트인데 왜 서버가 있냐? 백엔드가 서버가 아니냐? 
프론트 서버는 프론트가 서버로부터 데이터를 받아서 화면을 그려준다. 그 데이터가 매 번 바뀐다. <br>
( 예로들면, 페이스북 화면 보여줄 때 내가 보이는 화면이랑 상대방 보이는 화면이 다르다)<br>

### Next를 사용하는 이유
대부분 웹 사이트에 요구가 검색엔진이다. 검색이 잘 되야만 고객 유입이 잘 된다.<br>
Angular, React, Vue는 싱글 어플리케이션은 검색엔진이 잘 안된다. <br>
구글엔진(검색 봇)은 똑똑해서 검색이 잘 된다. 하지만, 네이버나 카카오 톡은....<br>
그래서 리액트에서 나온 기술이 서버 사이드 렌더링이 나왔다. <br>
서버 사이드 렌더링뿐만 아니라 코드 스플릿팅이라는 기술이 하나 더 있다.<br>

> 코드 스플릿팅이란?<br>
> 리액트로 페이지를 500페이지나 되는 사이트를 만들었다. <br> 
> 실제 고객이 10페이지는 보이는데 쓸데 없이 490페이지를 안 보게 된다. 그래서 필요한 페이지를 불러 오는 것이다.


실무에서는 개발 할 때 Next를 쓰는 것을 추천한다. <br> 
왜냐하면 나중에 리액트만 개발하면 위에 있는 적혀져 있는 문제가 일어나기때문에 미리 Next를 사용하는 것이 좋다. <br>
Vue는 Nuex가 있다. <br>


## next와 eslint 설치하기
[위로가기](#Hello-NextJS)

<pre><code>npm init

npm i react react-dom next
npm i -D nodemon webpack
npm i -D eslint
</code></pre>

### eslint란?

프로젝트할 때 협업을 하는데, 코드 스타일이 다르다. <br> 
에로들면 (';', ',') 붙이는 사람도 있고, 안 하는 사람이 있어서 코드가 전부 다르다. <br>
실무에서는 팀으로 움직이기 때문에 코딩을 같이하면 중궁난방이 난다. <br>
eslint를 붙이면 규칙을 정할 수가 있다. <br>

eslint설정 <br>
.eslinttr파일 생성 : js처럼 동작한다 <br>

여기에서 코딩 스타일을 설정한다.

#### .eslintrc
```js
{
  "parserOptions": {
    "ecmaVersion" : 2019, // 2019년 기준, 2018하면 2018년 기준
    
    // 노드랑 리액트 사용하기 때문에 module를 쓴다. script도 있다.
    "scourceType" : "module", 
    "ecmaFeatures" : {
      "jsx" : true // 이걸 안하면 eslint에서 jsx파일을 허용을 안 한다.
    },
  },
  "env" : {
    "browser" : true, // 브라우저를 할 수 있게한다.
    "node" : true, // 노드를 할 수 있게 한다.
  },
  
  // 여러가지 규칙이 있다. 
  "extends": [
    "eslint:recommended", // eslint가 추천하는 코딩스타일이다.
    // 리액트 코딩하기 때문에 eslint가 추천하는 리액트 코딩스타일이다.
    "plugin:react/recommended" 
  ],
  // eslint에서는 react랑 import, export, hooks 지원을 안하는데
  // 여기에서 plugins 설정을 해줘야 한다.
  "plugins" : [ // 여기 플로그인들은 직접 설치를 해야한다.
    "import",
    "react-hooks"
  ]
}
```

> 에디터별로 eslint를 활성화해야 할 수도 있다.

위에 있는 plugins들은 직접 설치를 해줘야 한다.<br>
<pre><code>npm i -D eslint-plugin-import eslint-plugin-react eslint-plugin-react-hooks</code></pre>
설치하면 eslint가 잘 움직일 것이다.<br>

> Tip ) dependencies, devDependencies 중에서 devDependencies에 몰아주는게 좋다. <br> 개발 할 때만 사용하기 떄문이다. 

 
## next 라우팅 시스템
[위로가기](#Hello-NextJS)

새로운 디렉토리(폴더) pages를 만든다. <br>
react에서 react-router를 많이 사용하는데, next는 next의 라우터가 있어서 react-router보다 쓰기 편하다. <br>
그래서 react-router가 필요가 없다.<br>

index.js가 메인페이지가 된다. <br>
<pre><cdoe>npm i -g next</code></pre>
명령어로 next를 써줘야한다. 3가지 방법 ( global(-g), npx, package.json에서 사용방법) <br>

#### package.json (package.json에서 사용방법)
```js
{
  "name": "react-nodebird-front",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev" : "next", // 추가
    "build" : "next build", // 추가
    "start" : "next start" // 추가
  },
  "author": "LEEKY",
  "license": "MIT",
  "dependencies": {
    "next": "^9.2.1",
    "react": "^16.12.0",
    "react-dom": "^16.12.0"
  },
  "devDependencies": {
    "eslint": "^6.8.0",
    "nodemon": "^2.0.2",
    "webpack": "^4.41.5",
    "eslint-plugin-import": "^2.20.0",
    "eslint-plugin-react": "^7.18.0",
    "eslint-plugin-react-hooks": "^2.3.0"
  }
}
```

실행 방법 <br>
<pre><cdoe>npm run dev</code></pre>

여기서 `import React from 'react'` 를 안하는 이유는? <br>
next에서는 위에 import 생략해도 된다. (굉장히 편하네) <br>
하지만 eslint에서 import하라고 나온다.. 그리고!! useState, useEffect...등등 <br>
사용하기 위해서도 import를 해줘야한다. 결국엔 import를 해주자! <br>

#### pages/index.js
```js
import React from 'react';

const Home = () => {
  return (
    <div>Hello, Next!</div>
  );
};

export default Home;
```

여기에서 폴더 이름이 pages이유가 있다. <br>

일단 폴더랑, js파일을 추가하겠다. <br>

#### pages/user/create.js
```js
import React from 'react';

const Create = () => {
  return (
    <div>유저를 만들어봅시다.</div>
  )
}

export default Create;
```


#### pages/about.js
```js
import React from 'react';

const about = () => {
  return (
    <div>about.</div>
  )
}

export default about;
```

> about.js의 URL은 `localhost:3000/about` <br>
> user/create.js의 URL은 `localhost:3000/user/create` <br>

걍... 존나 편하다.... 레알로.. <br>
라우터 체계는 next의 강점이다.. <br>
그리고 서버 사이드 렌더링, 코드 스플릿트를 알아서 해주는 장점도 있다. <br>

### link 추가

#### pages/index.js

```js
import React from 'react';
import Link from 'next/link'; // next에서 Link를 가져온다.

const Home = () => {
  return (
    <>
      <Link href="/about"><a>about</a></Link>  {/* Link 하는 방법 */}
      <div>Hello, Next!</div>
    </>
  );
};

export default Home;
```

