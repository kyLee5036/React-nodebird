# 서버 사이드 렌더링

+ [서버 사이드 렌더링 SRR](#서버-사이드-렌더링-SRR)



## 서버 사이드 렌더링 SRR
[위로가기](#서버-사이드-렌더링)

Postman에서 localhost://3060을 하면 안에 내용물이 나오지가 않는다. <br>
서버 사이드 렌더링이 하지 않았기 때문에이다. <br>

getInitialProps가 서버 사이드 렌더링에 핵심이 된다. <br>
getInitialProps가 서버, 프론트쪽에 각각 한 번이 실행이된다. <br>
서버의 실행은 처음으로 페이지를 불러올 때 getInitialProps가 실행된다. <br>
프론트에서는 next/router로 페이지 넘나들 때 getInitialProps가 실행이된다. <br>

지금 비동기호출은 redux-saga로 실행하고 있다. <br>
그러므로, getInitialProps에서 dispatch를 해주면 된다. <br>
참고로) next를 안하면 구현하기가 까다로워진다. <br>

```js
Home.getInitialProps = async (context) => {
  console.log(Object.keys(context));
};
```
context의 내용물 : <br>
```js
[
  'err',   'req',
  'res',   'pathname',
  'query', 'asPath',
  'store', 'isServer'
]
```
store의 안에, redux의 store이다. <br>
store.dispatch, store.getState로 redux작업을 할 수가 있다. <br>

#### D:\_React\_ReactStudy_inflearn\React-nodebird\7. 서버 사이드 렌더링\front\pages\index.js
```js
...생략

// 이런식으로 하는 것인데, 하기 전에 설정을 한 개 더 해줘야한다.
Home.getInitialProps = async (context) => {
  console.log(Object.keys(context));
  context.store.dispatch({
    type: LOAD_MAIN_POSTS_REQUEST,
  });
};
```
<pre><code>npm i next-redux-saga</code></pre>
next서버에서 redux-saga를 할 수 있기때문에 서버 사이드 렌더링이 된다. <br>
그리고 _app.js에서 세팅을 해준다. <br>

#### D:\_React\_ReactStudy_inflearn\React-nodebird\7. 서버 사이드 렌더링\front\pages\_app.js
```js
...생략
import WithRedux from 'next-redux-wrapper';
import WithReduxSaga from 'next-redux-saga'; // 추가해주기
...생략

const NodeBird = ({ Component, store, pageProps }) => {
  ...생략
};

...생략

const configureStore = (initalState, options) => {
  ...생략

  const store = createStore(reducer, initalState, enhancer);
  store.sagaTask = sagaMiddleware.run(rootSaga); // 이 부분 추가하기
  // store의 sagaTask에다가 sagaMiddleware를 넣어줘야한다.

  sagaMiddleware.run(rootSaga); 
  return store;
}

export default WithRedux(configureStore)(WithReduxSaga(NodeBird)); // WithReduxSaga로 NodeBird를 감싸주기
```

새로고침을 하는 순간에 게시글이 먼저 불러와져있다. <br>

