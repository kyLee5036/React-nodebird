# 리덕스 사가 배우기

+ [리덕스 사가의 필요성과 맛보기](#리덕스-사가의-필요성과-맛보기)
+ [사가 미들웨어 리덕스에 연결하기](#사가-미들웨어-리덕스에-연결하기)


## 리덕스 사가의 필요성과 맛보기
[위로가기](#리덕스-사가-배우기)


복습하기 <br>
Redux와 Redux-Saga의 차이점? <br>
Redux는 동기처리를 하고, Redux-saga는 비동기 처리까지 한다. <br>
그래서, Redux-saga를 같이 사용하는 경우가 많다. <br>

```
{
  type: LOG_IN,
  data: { id: 'LEEKY', password: '1231230'}
}
```

서버쪽에 data가 전달하고, 서버가 로그인 성공이라는 응답을 보내고, <br>
그걸 다시 받아서 로그인한다. <br>
여기에서 redux에서는 데이터터를 동기적으로 바꾸는 밖에 못한다. <br>
그래서 비동기 처리도 같이 해줘야하기 때문에 무엇가 하나도 더 필요하다. <br>

그래서 해결하기 위해서는 `thunk, redux-saga` 등이 있다. <br>

redux-saga를 맛보기  <br>
<pre><code>npm i redux-saga</code></pre>

saga는 문법 자체가 익숙하지 않다.

### 제너레이터(*)
```js
function* generator() { }
```

이것을 <strong>제너레이터(*)</strong>라고 한다.  <br>
제너레이터는 <strong>중간에 멈출 수 있고, 원할 때 재개할 수 있는 것이다.</strong>  <br>

> Tip) 제너레이터는 무한의 개념 및 비동기에서 많이 사용한다. <br>

#### \front\saga\index.js
```js
import { all, call} from 'redux-saga/effects';
import user from './user';
import post from './post';

export default function* rootSaga() {
  yield all([
    call(user),
    call(post),
  ])
}
```
#### \front\saga\user.js
```JS
import { all } from 'redux-saga/effects';

export default function* userSaga() {
  yield all([]);
}
```
#### \front\saga\post.js
```JS
import { all } from 'redux-saga/effects';

export default function* postSaga() {
  yield all([]);
}
```
일단 post-saga, user-saga랑 합쳐서 index-saga에 모아준다.

#### \front\saga\user.js
```js
import { all, fork, takeLatest, call, put } from 'redux-saga/effects';
import { LOG_IN, LOG_IN_SUCCESS, LOG_IN_FAILURE } from '../reducers/user'

function loginAPI() {
 // 2) 로그인에 요청을 보낸다. 서버에 요청을 보내는 부분
}

function* login() {
  try {
    yield call(loginAPI);
    // 3) 서버에서 요청을 했는데 성공했다. `LOG_IN_SUCCESS`가 실행된다.
    yield put({ // put은 dispatch랑 비슷하다.
      type: LOG_IN_SUCCESS,
    });
  } catch (e) {
    // 3) 서버에서 요청을 했는데 실패했다. `LOG_IN_FAILURE`가 실행된다.
    console.error(e);
    yield put({ // put은 dispatch랑 비슷하다.
      type: LOG_IN_FAILURE,
    });
  }
}

function* watchLogin() {
  // 1) 로그인 이라는 액션을 기다린다.
  yield takeLatest(LOG_IN, login);
  
  // takeLatest가 LOG_IN 액션이 dispatch되길 기다려서
  // dispatch될 때 login 재너레이터를 호출한다.

}

export default function* userSaga() {
  yield all([
    fork(watchLogin),
  ]);
}
```

### 여기 설명부터 중요!!! 
로그인, 회원가입같은 비동기 액션을 실행하고 싶을 때에는 `LOG_IN`가 있다. <br>

로그인 동작을 할 때  <br>

서버에 요청을 보낸다 -> request(비동기) <br>
request(비동기)에서 <br>
성공 할 경우 -> 로그인 성공 (LOG_IN_SUCCESS) <br>
실패 할 경우 -> 로그인 실패 (LOG_IN_FAILURE) <br>

### call, fork, put
<strong>call</strong>은 함수 동기적 호출  <br>
<strong>fork</strong>는 함수 비동기적 호출  <br>
<strong>put</strong>은 액션 dispatch (즉, dispatch랑 비슷)  <br>


#### 위에 코드 순서 
1. `function* watchLogin(){}`  <br>
2. `function loginAPI(){}`  <br>
3. `function* login(){}`  <br>

     
reudx에서 LOG_IN실행  <br>
redux-saga에서 OG_IN이라는 액션이 실행되는지 대기  <br>
비동기 동작  <br>
완료되었을 때 SUCCESS 또는 FAILURE를 실행   <br>

즉,<strong>redus-saga</strong>를 사용하는 이유 <br>
redux만 사용할 때에는 서버에 비동기할 틈이 없었는데, 그 틈을 redux-saga가 만들어준다.  <br>


## 사가 미들웨어 리덕스에 연결하기
[위로가기](#리덕스-사가-배우기)

#### \front\pages\_app.js
```js
...생략
import reducer from '../reducers/index';
import { createStore, compose, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga'; // 미들웨어 사가 만들기

const NodeBird = ({Component, store}) => {
  ...생략
};

NodeBird.prototype = {
  ...생략
}

export default WithRedux((initalState, options) => {
  const sagaMiddleware = createSagaMiddleware(); // 미들웨어 사가 만들기
  const middlewares = [];
  const enhancer = compose(
    applyMiddleware(...middlewares), 
    !options.isServer && window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' ? window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f,
  ); 
  const store = createStore(reducer, initalState, enhancer); 
  return store;
})(NodeBird);
```
여기서 왜 사가를 만드는데 왜 sagas폴더에 createSagaMiddleware를 따로 만들지 않는 이유? <br>
따로 만드는 경우는 단 한번만 reateSagaMiddleware함수가 실행된다(노드 모듈 캐싱). <br>
서버사이드렌더링을 위해서는 중간중간 저 함수를 다시 실행해주어야 하는데 <br>
이 때 configureStore 함수 내부에 함수를 두어야 한다.  <br>
configureStore 함수가 여러번 재실행되면서 createSagaMiddleware 함수도 그때마다 새로 실행된다. <br>

#### \front\pages\_app.js
```js
...생략
export default WithRedux((initalState, options) => {
  const sagaMiddleware = createSagaMiddleware(); 
  const middlewares = [sagaMiddleware]; // 여기에다가 미들웨어 넣으면 끝!!!
  const enhancer = compose(
    applyMiddleware(...middlewares), 
    !options.isServer && window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' ? window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f,
  ); 
  const store = createStore(reducer, initalState, enhancer); 
  return store;
})(NodeBird);
```

#### \front\pages\_app.js
```js
import rootSaga from '../sagas';

...생략
export default WithRedux((initalState, options) => {
  const sagaMiddleware = createSagaMiddleware(); 
  const middlewares = [sagaMiddleware]; 
  const enhancer = compose(
    applyMiddleware(...middlewares), 
    !options.isServer && window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' ? window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f,
  ); 
  const store = createStore(reducer, initalState, enhancer); 
  sagaMiddleware.run(rootSaga); // rootSaga를 등록을 해줘야한다. 
  // rootSaga를 sagaMiddleware에 연결해줘야한다.
  return store;
})(NodeBird);
```

> 정리하자면, createSagaMiddleware를 만들어주고, rootSaga를 sagaMiddleware에 연결해줘야만 한다. 

#### \front\pages\_app.js
#### 완성본 (거의 바뀌지 않는다. 외우는 것도 나쁘지 않다.)
```js
...생략
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas';

...생략
export default WithRedux((initalState, options) => {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [sagaMiddleware];
  const enhancer = compose(
    applyMiddleware(...middlewares), 
    !options.isServer && window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' ? window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f,
  ); 
  const store = createStore(reducer, initalState, enhancer);
  sagaMiddleware.run(rootSaga); 
  return store;
})(NodeBird);
```

#### \front\pages\_app.js
#### 실제 서비스에서 사용해주기 위해서는 이하와 같이 사용한다.
```js
...생략
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas';

...생략
export default WithRedux((initalState, options) => {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [sagaMiddleware];
  
  // 실제 서비스에서 사용할 때 redux-devetools의 개발자 툴을 안보여주기 위해서 사용하였다.
  const enhancer = process.env.NODE_ENV === 'production' 
  ? compose( 
    applyMiddleware(...middlewares))
  : compose(
    applyMiddleware(...middlewares), 
      !options.isServer && window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' ? window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f,
  );

  const store = createStore(reducer, initalState, enhancer);
  sagaMiddleware.run(rootSaga); 
  return store;
})(NodeBird);
```

각 줄, 각 함수들이 알고있는지 사용하는게 가장좋고, <br>
패턴처럼 만들어놓고, 바뀔 부분만 외워두고 그대로 복사, 붙이기도 나쁘지 않다. (왜냐하면 거의 바뀌지 않기때문이다.) <br>

### 하위 컴포넌트 만드는 방법

미들웨어가 액션, state 어디에 위치하는지? <br>
미들웨어 만드는 방법 <br>
> <strong>currying</strong>이라는 기법을 사용한다. 인자 하나를 받아 다른 함수를 리턴하는 것이다. <br>

```js

const middleware = (state) => (next) => (action) => {
  console.log(action); // 다른 작업들은 여기에
  next(action);
}


const connect = (mapStateToProps) => (Component) => () => { // 기존 컴포넌트를 강화(추가를 한다.)
  console.log('I`m hoc'); 
  return (
    <Component props={mapStateToProps} hello="I`m hot"/> 
  )
}

const hoc = (Component) => () => {
  console.log('I`m hoc'); // 기록용으로 사용할 수 있다.
  return (
    <Component hello="I`m hot"/> // 별의 별 props를 넣어줄 수가 있다.
  )
}

connect(mapStateToProps)(Component);
hoc(Component); // 특징이 컴포넌트를 마음대로 조작할 수가 있다.
```
이런식으로 하위 컴포넌트를 만들어 줄 수 있다.  <br>

