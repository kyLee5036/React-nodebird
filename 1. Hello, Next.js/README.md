# Hello NextJS


+ [프로젝트 구조와 배우는 것들](#프로젝트-구조와-배우는-것들)
+ [next와 eslint 설치하기](#next와-eslint-설치하기)


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

 

