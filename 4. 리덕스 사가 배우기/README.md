# 리덕스 사가 배우기

+ [리덕스 사가의 필요성과 맛보기](#리덕스-사가의-필요성과-맛보기)
+ [사가 미들웨어 리덕스에 연결하기](#사가-미들웨어-리덕스에-연결하기)
+ [ES2015 제너레이터](#ES2015-제너레이터)
+ [사가의 제너레이터 이해하기](#사가의-제너레이터-이해하기)
+ [사가에서 반복문 제어하기](#사가에서-반복문-제어하기)
+ [takeEvery takeLatest](#takeEvery-takeLatest)


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


## ES2015 제너레이터
[위로가기](#리덕스-사가-배우기)

예로들면 <br>
```js
function a() {
  console.log('1');
  console.log('2');
  console.log('3');
}

a();
// 1,2,3
```
결과가 1,2,3인데 여기서 1,2만 하고 3은 안하고싶다!! <br>
```js
function* generator() {
  console.log('1');
  console.log('2');
  console.log('3');
}

generator();

/*
▶ generator {<suspended>}
  __proto__: Generator
  [[GeneratorLocation]]: VM56:1
  [[GeneratorStatus]]: "suspended"
  [[GeneratorFunction]]: ƒ* generator()
  [[GeneratorReceiver]]: Window
  [[Scopes]]: Scopes[3]
*/

```

제너레이터를 실행할려면 next를 사용해야한다. <br>

```js
function* generator() {
  console.log('1');
  console.log('2');
  console.log('3');
}

const gen = generator();
gen.next(); 

//▶ {value: undefined, done: true}
```
실행이 되었다. `done: true`가 되었다. <br>

그리고, 다시 실행해보면 <br>
```js
gen;
//▶ generator {<closed>}
```
`generator {<closed>}` 이 처럼 종료되었다. <br>
`next`는 `closed`되기 전까지 게속 사용할 수 있다. <br>

### 중단점(yield)

이번에는 중단점을 만들어보겠다. <br>
```js
function* generator() {
  console.log('1');
  console.log('2');
  yield;
  console.log('3');
}

const gen = generator();
gen.next(); 

/* 
1
2
▶ {value: undefined, done: false}
*/
```
계속 이어서 `gen.next`를 하겠다.
```js
gen.next(); 

/*
▶ {value: undefined, done: true}
*/
```

이번에는 yield에 값을 넣어보겠다. <br>
```js
function* generator() {
  console.log('1');
  console.log('2');
  yield 5;
  console.log('3');
}

const gen = generator();
gen.next(); 

/*
1
2
▶ {value: 5, done: false}
*/
```
value에 값이 들어있는 것을 확인할 수가 있다. <br>
또 한번 더, `gen.next()`를 해보겠다. <br>

```js
// ▶ {value: undefined, done: true}
```
값에 `undefined`가 정의되어있다. <br>

> yield에 중단점이고, 값을 넣을 수가 있다. <br>
```js
function* generator() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield* '나는 반복이다!';
}

const gen = generator();

```
yield에 `*`에 있다. `*`는 반복(interable)을 하겠다라는 의미이다. <br>
interable: 반복 가능 값<br>
```js
gen.next(); 
// ▶ {value: 1, done: false}
gen.next(); 
// ▶ {value: 2, done: false}
gen.next(); 
// ▶ {value: 3, done: false}
gen.next(); 
// ▶ {value: 4, done: false}
gen.next(); 
// ▶ {value: "나", done: false}
gen.next(); 
// ▶ {value: "는", done: false}
gen.next(); 
// ▶ {value: " ", done: false}
gen.next(); 
// ▶ {value: "반", done: false}
gen.next(); 
// ▶ {value: "복", done: false}
gen.next(); 
// ▶ {value: "이", done: false}
gen.next(); 
// ▶ {value: "다", done: false}
gen.next(); 
// ▶ {value: "!", done: false}
gen.next();  // 마지막에 true가 된다.
// ▶ {value: undefined, done: true}
```

yield를 await로 생각하면 된다. <br>

### 반복문 컨트롤하기
```js
function* generator() {
  let i = 0;
  while(true) {
    yield i++
  }
}

const gen = generator();
```

무한 반복문이 실제로 무한 반복을 하지않는다. <br>
```js
gen.next(); // {value: 0, done: false}
gen.next(); // {value: 1, done: false}
gen.next(); // {value: 2, done: false}
gen.next(); // {value: 3, done: false}
...
```
무한 반복문을 컨트롤할 수가 있게된다. <br>

## 사가의 제너레이터 이해하기
[위로가기](#리덕스-사가-배우기)

saga(사가)는 next를 알아서 (이펙트에 따라) 해주는 제너레이터이다. <br>


```js
import { all, fork, takeLatest, call, put, take } from 'redux-saga/effects';

export const HELLO_SAGA = 'HELLO_SAGA';

function* hello() {
  try {
    yield put({type: HELLO_SAGA});
  } catch (e) {
    console.error(e);
  }
}

function* helloSaga() {
  yield take(HELLO_SAGA); // take가 hellow_saga를 기다린다.
  // 재개를 해줄려면 next함수를 사용해야하는데 next는 사가 마들웨어에서 알아서해준다.
  // gen.next()의 next이다.
  // 여기에다가 비동기 요청, 타이머를 넣어준다.
}
```

```js
// Componet라고 가정치고
useEffect( () => {
  dispatch({
    type: HELLO_SAGA
  });
  dispatch({
    type: HELLO_SAGA
  });
  dispatch({
    type: HELLO_SAGA
  });
})


// *******************************************
function* helloSaga() {
  while(true) { // hellowSaga가 
    yield take(HELLO_SAGA); // 위에서 dispatch를 3번을 했는데
    // while이 없으면 한 반밖에 안한다.
    // 3번 연속으로 해주기 위해서는 while문을 넣어주었다.
    // 이벤트리스너를 동기적으로 표현했다고 보면 된다.
  }
  
}
```
### take
take : 해당 액션이 dispatch되면 제너레이터를 next하는 이펙트

> tip ) 컴포넌트에 직접 dispatch를 해줘야한다.

## 사가에서 반복문 제어하기
[위로가기](#리덕스-사가-배우기)

이벤트 리스너를 사용하면 콜백이 나오는데 콜백을 생각하면 콜백헬(callback hell)이 나온다. <br>

```js
import { all, fork, takeLatest, call, put, take } from 'redux-saga/effects';

const HELLO_SAGA = 'HELLO_SAGA';

function* watchHello() {
  while(true) {
    yield take(HELLO_SAGA);
    // yield는 중단점
    // take에 액션(HELLO_SAGA)가 들어올 떄 실행이 된다.
  }
}

export default function* userSaga() {
  yield all([ // all은 여러 이펙트를 동시에 실행할 수 있게 된다.
    watchHello(),
  ]);
}

// ******************************
// Componet라고 가정치고
useEffect( () => {
  dispatch({ type: HELLO_SAGA });
  dispatch({ type: HELLO_SAGA });
  dispatch({ type: HELLO_SAGA });
  dispatch({ type: HELLO_SAGA });
  dispatch({ type: HELLO_SAGA });
  dispatch({ type: HELLO_SAGA });
}) // 6번이 호출이 된다.
```
이벤트 리스너가 일어나면 removeEventListenr로 제거를 해줘야하는데, <br>
사가는 이벤트를 제어할 수 있는 큰 장점이 있다. <br>

> 사가는 리덕스랑 별개로 움직인다.


### put
put은 dispatch (사가의 dispatch이다.) <br>

#### \front\sagas\user.js
```js
import { all, fork, takeLatest, call, put, take, delay } from 'redux-saga/effects';
...생략

function* watchLogin() {
  yield take(LOG_IN); // 로그인하고 로그아웃한다면, 한 번 밖에 실행이 안된다.
  yield put({
    type: LOG_IN_SUCCESS
  });
}

export default function* userSaga() {
  yield all([
    watchLogin(),
  ]);
}
```

#### \front\sagas\user.js
```js
import { all, fork, takeLatest, call, put, take, delay } from 'redux-saga/effects';
...생략

function* watchLogin() {
  while(true) { // 그래서 while(true)로 감싸준다.
    yield take(LOG_IN);
    yield delay(2000); // 2초 뒤에 로그인 성공을 할 수가 있다. 
    yield put({
      type: LOG_IN_SUCCESS
    });
  }
  
}

export default function* userSaga() {
  yield all([
    watchLogin(),
  ]);
}
```

## takeEvery takeLatest
[위로가기](#리덕스-사가-배우기)

`takeEvery, takeLatest` 들은 while문을 대신해서 사용하는 것이다.

```js
function* helloSaga() {
  while(true) { 
    yield take(HELLO_SAGA); 
    console.log(1);
    console.log(2);
    console.log(3);
    console.log(4);
  }
};
```

```js

function* helloSaga() {
  while(true) { 
    yield take(HELLO_SAGA); 
    console.log(1);
    console.log(2);
    console.log(3);
    console.log(4);
  }
};
```



