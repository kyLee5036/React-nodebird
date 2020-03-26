# 리덕스 사가 배우기

+ [리덕스 사가의 필요성과 맛보기](#리덕스-사가의-필요성과-맛보기)
+ [사가 미들웨어 리덕스에 연결하기](#사가-미들웨어-리덕스에-연결하기)
+ [ES2015 제너레이터](#ES2015-제너레이터)
+ [사가의 제너레이터 이해하기](#사가의-제너레이터-이해하기)
+ [사가에서 반복문 제어하기](#사가에서-반복문-제어하기)
+ [takeEvery takeLatest](#takeEvery-takeLatest)
+ [fork call 사가 총정리](#fork-call-사가-총정리)
+ [사가 패턴과 Q&A](#사가-패턴과-Q&A)
+ [eslingConfigAirbnb와 코드 정리](#eslingConfigAirbnb와-코드-정리)
+ [redux state와 action 구조 잡기](#redux-state와-action-구조-잡기)
+ [로그인 리덕스 사이클](#로그인-리덕스-사이클)
+ [회원가입 리덕스 사이클](#회원가입-리덕스-사이클)
+ [게시글 작성 리덕스 사이클](#게시글-작성-리덕스-사이클)
+ [next Router로 페이지 이동하기](#next-Router로-페이지-이동하기)
+ [댓글 컴포넌트 만들기](#댓글-컴포넌트-만들기)



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
  while(true) { // while문 대신에 사용할 takeEvery, takeLatest를 사용한다.
  // while(true) 를 사용하면 뭔가 어색하기 때문에이다. 
    yield take(HELLO_SAGA); 
    console.log(1);
    console.log(2);
    console.log(3);
    console.log(4);
  }
};
```

### takeEvery

```js
// while의 경우
function* watchHello() {
  while(true) { 
    yield take(HELLO_SAGA); 
    console.log(1);
    console.log(2);
    console.log(3);
    console.log(4);
  }
};

// takeEvery, takeLatest의 경우
function* watchHello() {
  yield takeEvery(HELLO_SAGA, function*() { // taketakeEvery의 경우
    yield put({
      type : 'BYE_SAGA'
    })
  })
};


export default* function* () {
  yield all([
    watchHello(),
  ])
}

```
`takeEvery`의 제너레이터(*)함수를 넣어야한다. <br>
HelloSaga액션의 동작을 함수 안에 적어준다. <br>

```js
  useEffect(() => {
    dispatch({
      type : HELLO_SAGA
    });
    dispatch({
      type : HELLO_SAGA
    });
    dispatch({
      type : HELLO_SAGA
    });
    dispatch({
      type : HELLO_SAGA
    });
  })
```
> 총 8번이 실행, HELLOW_SAGA가 4번, BYE_SAGA가 4번

### takeLatest, delay

```js
// while의 경우
function* watchHello() {
  while(true) { 
    yield take(HELLO_SAGA); 
    yield delay(1000); // delay를 사용해서 타이머를 제어할 수도 있다.
    console.log(1);
    console.log(2);
    console.log(3);
    console.log(4);
  }
};

// takeEvery, takeLatest의 경우
function* watchHello() {
  yield takeLatest(HELLO_SAGA, function*() { // takeLatest의 경우
    yield put({
      type : 'BYE_SAGA'
    })
  })
};


export default* function* () {
  yield all([
    watchHello(),
  ])
}

```

```js
  useEffect(() => {
    dispatch({
      type : HELLO_SAGA
    });
    dispatch({
      type : HELLO_SAGA
    });
    dispatch({
      type : HELLO_SAGA
    });
    dispatch({
      type : HELLO_SAGA
    });
  })
```
> 총 5번이 실행, HELLOW_SAGA가 4번, BYE_SAGA가 1번 <br>

<strong>takeLatest</strong>는 이전 요청이 끝나지 않는게 있다면 이전 요청을 취소한다. <br>
 
`takeLatest`를 하면 동시에 여러번 액션을 실행하면 마지막 액션을 실행한다. <br>
예로들면, 로그인 버튼을 막 클릭하면, 사가에서 제어를 해주기 위해서 `takeLatest`를 사용한다. <br>
또한, 클라이언트에서 제대로 처리못하면, 로그인처리가 10번 이상 할 수 있는 상황이 생기기 때문에, `takeLatest`를 사용한다. <br>

> takeEvery, takeLatest를 뭐 할지 고민된다면 ? <br>
> 
버튼을 게속 클릭했을 때, 전부 OK를 해줄건지, 마지막에 처리를 OK해줄건지 구분을 하면된다. <br>
예로들면, 실수해서 로그인 버튼 3번 클릭하면, takeLatest를 사용하면 한 번만 처리한다. <br>
또, 카운트(Count)를 계속 증가 시키고 싶으면,  takeEvery를 사용하는게 알맞는 것 같다. <br>


## fork call 사가 총정리
[위로가기](#리덕스-사가-배우기)

#### \front\sagas\user.js
```js
import { all, fork, takeLatest, takeEvery, call, put, take, delay } from 'redux-saga/effects';
import { LOG_IN, LOG_IN_SUCCESS, LOG_IN_FAILURE } from '../reducers/user'

function loginAPI() {

}

function* login() {
  try {
    yield call(loginAPI);
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
  yield takeEvery(LOG_IN, login);
}

export default function* userSaga() {
  yield all([
    fork(watchLogin()),
  ]);
}

```
여기에 자세히 보면

```js
export default function* userSaga() {
  yield all([
    // 셋 다 함수 실행이다.
    // 하지만, 사가를 사용하면 첫번 째 watchLogin()보다는 그 밑에 줄 call, fork로 감싸주는게 좋다
    watchLogin(),
    call(watchLogin()),
    fork(watchLogin()),
  ]);
}
```

### call(동기호출), fork(비동기호출)

```js
... 생략

function loginAPI() {
  // 서버에 요청을 보내는 부분
}

function* login() {
  try {
    yield call(loginAPI); // 이 부분은 동기부분인 call로 해줘야한다.
    // fork를 하면, 서버에 요청을 오든 말든, LOG_IN_SUCCESS를 바로 실행하기 때문에,
    // 문제가 바로 생긴다. 
    // 즉, 서버로 보내는 요청이 끝나야만, LOG_IN_SUCCESS가 실행된다.
    // call이 오류가 나면 catch문에 간다.
    yield put({
      type: LOG_IN_SUCCESS,
    })
  } catch (e) {
    ...생략
  }
}

function* watchLogin() {
  yield takeEvery(LOG_IN, login);
}

export default function* userSaga() {
  yield all([
    watchLogin(), // fork를 안해줘도 상관은 없다. 하지만, fork를 해준다.
    fork(watchLogin()), // 사실 이 부분은 fork를 붙이는 이유는
    // fork라는 의미를 공부하기 위해서 사용한다. 비동기라는 것의 중점을 두기위해서
  ]);
}

```


> <strong>call</strong> : 순서를 지킬 때 사용하면 된다. <br>
> <strong>fork</strong> : 순서가 필요 없고, 바로 넘어가고 싶을 때 사용한다. <br>


좀 더 와 닿는 예제를 본다면, 
```js
... 생략

function loginAPI() {
  // 서버에 요청을 보내는 부분
}

function* login() {
  try {
    // logger의 call할 경우
    yield call(logger); // 내 기록을 로깅하는 함수, 하지만 10초 걸린다.
    // 이 함수가 상당히 10초 걸리는데, call을 사용하면 10초 기다린 다음에 loginAPI가 실행된다.
    
    // logger의 fork할 경우
    // 이럴 경우에는 logger함수를 실행하는데 10초가 걸리니까, 다음 것을 실행시켜주기 위해서 fork를 사용해주는 것도 있다. 
    yield fork(logger);  // 즉, 쓸데없는 부과적인 것은 fork를 사용해준다.
    yield call(loginAPI); 
    yield put({
      type: LOG_IN_SUCCESS,
    })
  } catch (e) {
    ...생략
  }
}

function* watchLogin() {
  yield takeEvery(LOG_IN, login);
}

export default function* userSaga() {
  yield all([
    watchLogin(),     
    fork(watchLogin()),   
  ]);
}

```

총 정리를 하면 <br>
`all, fork, takeLatest, takeEvery, call, put, take, delay` 8가지를 배웠지만, <br>
`race, cancel, select, throttle, debounce 이펙트`도 자주 사용하기 때문에, <br>
나중에 알아서 공부해주는 것이 좋다. <br>
take는 한 번만 실행해준다. takeLatest랑 takeEvery는 계속 실행해준다. <br>

제너레이터라는게 별거 없다. 일단 yeild로 중단하고, next를 실행해서 움직이는데, 리덕스 사가에서는 알아서 next를 실행해준다. <br>


+ [사가 패턴과 QA](#사가-패턴과-QA)
[위로가기](#리덕스-사가-배우기)

로그인 요청 (LOG_IN_REQUEST) <br>
↓ <br>
(서버 갔다옴) <br>
↓ <br>
로그인 성공 or 로그인 성공 <br>
(LOG_IN_SUCCESS or LOG_IN_SUCCESS) <br>

-> 자세히 보면 패턴이 생겨졌다. <br>
```js
// 비동기 액션
export const SIGN_UP_REQUEST = 'SIGN_UP_REQUEST';
export const SIGN_UP_SUCCESS = 'SIGN_UP_SUCCESS';
export const SIGN_UP_FAILURE = 'SIGN_UP_FAILURE';

export const LOG_IN_REQUEST = 'LOG_IN_REQUEST'; // 액션의 이름
export const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS'; // 액션의 이름
export const LOG_IN_FAILURE = 'LOG_IN_FAILURE'; // 액션의 이름

export const LOG_OUT_REQUEST = 'LOG_OUT_REQUEST';
export const LOG_OUT_SUCCESS = 'LOG_OUT_SUCCESS';
export const LOG_OUT_FAILURE = 'LOG_OUT_FAILURE';

// 동기 액션
export const INCREMENT_NUMBER = 'INCREMENT_NUMBER'; 

```
이런 식으로 반듯하게, 이름맞추도록 정했다. (정해진건 아닌데, 우연하게 딱 맞아서 보기가 좋다.) <br>
`REQUEST, SUCCESS, FAILURE`가 있으면 비동기액션이라고 생각하면 좋다. <br>

-> 여기에서 `REQUEST`에서는 보통 로딩 창 돌아가는 것을 많이 해준다. <br>

#### \front\reducers\user.js
```js
...생략

export default (state = initialState, action) => {
  switch (action.type) {
    case LOG_IN_REQUEST: {
      return {
        ...state,
        isLoggedIn: true,
        loginData: action.data,
        isLoading : true, // 여기에서 request에서 true를 해준다
      };
    }

    case LOG_IN_REQUEST: {
      return {
        ...state,
        isLoading : false, // 성공하면 로딩 창을 false을 해준다
        user: dummyUser, // 데이터도 같이 넣어준다.
      };
    }
    ...생략
    default: {
      return {
        ...state,
      }
    }
  }
};
```

try, catch를 해주는 이유는? <br>
자바스크립트에서 에러가 나면 서버가 죽어버리는 경우가 있는데, try, catch를 하면 서버가 보호되기 때문에 사용한다. <br>


## eslingConfigAirbnb와 코드 정리
[위로가기](#리덕스-사가-배우기)

eslint설치를 하였는데, 코드를 잡아주는게 없어서 <br>
<pre><code>npm i -d eslint-config-airbnb</code></pre>
`eslint-confing-airbnb`가 코드를 잡아는게 엄격하다. <br>

또한, 설치해줘야하는게 한가지 더 있다. <br>
<pre><cdoe>npm i -D eslint eslint-plugin-jsx-a11y (숫자 1이다)</code></pre>
또한, 바벨 최신문법을 지원해주기 위해서 <br>
<pre><cdoe>npm i -D babel-eslint</code></pre>

> 실행한 결과 : 잘 되지가 않고, 찾아봤는데 안되어서 일단, 보류하겠다.
참고 페이지 : https://dev.to/pixari/eslint-not-working-in-vs-code-5g4d

### \front\.eslintrc
```js
{
  "parser": "babel-eslint", // babel-eslint를 연결해준다.
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "env": {
    "browser": true,
    "node": true,
    "es6": true // es6 허가
  },
  "extends": [
    "airbnb" // 코드스타일을 airbnb를 하겠다다는 의미
  ],
  "plugins": [
    "import",
    "react-hooks"
  ],
  "rules": {
    "no-underscore-dangle": "off",
    "react/forbid-prop-types": 0, // 0 or Off // 의미 : 엄격하게 안하겠다.
    "object-curly-newline": 0
  }
}
```

```js
export const signUpAction = (data) => {
  return {
    type: SIGN_UP_REQUEST,
    data,
  }
};

export const signUpAction = data => ({
  type: SIGN_UP_REQUEST,
  data,
});
```

위, 아래랑 같은 것인데, 바로 올바른 문법은 아래의 것이다. <br>
바로 리턴을 해주어야기 떄문이다. <br>


## redux state와 action 구조 잡기
[위로가기](#리덕스-사가-배우기)

### axios
axios는 서버에 요청을 보내는 모듈이다. <br>
제일 유명해서 사용한다. 심지어 구글에서도 사용한다. <br>


```js
function signUpAPI() {

}

function* signUp() {
  try {
    yield call(signupCall);
    yield put({
      type: SIGN_UP_SUCCESS
    })
  } catch (e) {
    console.error(r);
    yield put({ 
      type : SIGN_UP_FAILURE}
    );
  }
}

function* watchSignUp() {
  yield takeLatest(SIGN_UP_REQUEST, signUp);
}

```
3개의 함수가 하나의 싸이클을 이룬다. <br>
`SIGN_UP_REQUEST`회원가입 액션이 들어오고, <br>
call에서 성공인가, 실패인가 처리를 해준다.  <br>


일단 에러가 걸리는데 나중에 해결한다. <br>
#### \front\sagas\user.js
```js
import { all, fork, takeLatest, takeEvery, call, put, take, delay } from 'redux-saga/effects';
import { LOG_IN, LOG_IN_SUCCESS, LOG_IN_FAILURE, SIGN_UP_REQUEST, SIGN_UP_FAILURE, SIGN_UP_SUCCESS } from '../reducers/user'
import axios from 'axios';

function loginAPI() {
  return axios.post('/login');
}

function* login() {
  try {
    yield call(loginAPI);
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

function signUpAPI() {
  return axios.post('/signup');
}

function* signUp() {
  try {
    yield call(signUpAPI);
    yield put({
      type: SIGN_UP_SUCCESS
    })
  } catch (e) {
    console.error(r);
    yield put({ type : SIGN_UP_FAILURE});
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
자세히 보면 공통된 부분이 보일 것이다. <br>

#### \front\reducers\user.js
```js
const dummyUser = {
  nickname: 'LEEKY',
  Post: [],
  Followings: [],
  Followers: [],
  signUpData: [],
};

export const initialState = {
  isLoggedIn: false, // 로그인 여부
  isLoggingOut : false, // 로그아웃 시도중
  isLogginIn : false, // 로그인 시도중
  LoginInErrorReason: '', // 로그인 실패 이유
  signedUp: false, // 회원가입 성공
  isSigningUp: false, // 회원가입 시도중
  signUpErrorReason: '', // 회원가입 실패 이유
  me: null, // 내 정보
  followingList : [], // 팔로잉 리스트
  followerList: [], // 팔로워 리스트
  userInfo: [], // 남의 정보
};
// 회원가입
export const SIGN_UP_REQUEST = 'SIGN_UP_REQUEST';
export const SIGN_UP_SUCCESS = 'SIGN_UP_SUCCESS';
export const SIGN_UP_FAILURE = 'SIGN_UP_FAILURE';
// 로그인
export const LOG_IN_REQUEST = 'LOG_IN_REQUEST'; // 액션의 이름
export const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS'; // 액션의 이름
export const LOG_IN_FAILURE = 'LOG_IN_FAILURE'; // 액션의 이름
// 로그인 후 사용자 정보 불러오기
export const LOAD_USER_REQUEST = 'LOAD_USER_REQUEST';
export const LOAD_USER_SUCCESS = 'LOAD_USER_SUCCESS';
export const LOAD_USER_FAILURE = 'LOAD_USER_FAILURE';
// 로그아웃
export const LOG_OUT_REQUEST = 'LOG_OUT_REQUEST';
export const LOG_OUT_SUCCESS = 'LOG_OUT_SUCCESS';
export const LOG_OUT_FAILURE = 'LOG_OUT_FAILURE';
// 팔로워 하는 액션
export const FOLLOW_USER_REQUEST = 'FOLLOW_USER_REQUEST';
export const FOLLOW_USER_SUCCESS = 'FOLLOW_USER_SUCCESS';
export const FOLLOW_USER_FAILURE = 'FOLLOW_USER_FAILURE';
// 팔로워 목록
export const LOAD_FOLLOW_REQUEST = 'LOAD_FOLLOW_REQUEST';
export const LOAD_FOLLOW_SUCCESS = 'LOAD_FOLLOW_SUCCESS';
export const LOAD_FOLLOW_FAILURE = 'LOAD_FOLLOW_FAILURE';
// 언팔로우 하는 액션
export const UNFOLLOW_USER_REQUEST = 'UNFOLLOW_USER_REQUEST';
export const UNFOLLOW_USER_SUCCESS = 'UNFOLLOW_USER_SUCCESS';
export const UNFOLLOW_USER_FAILURE = 'UNFOLLOW_USER_FAILURE';
// 팔로워 삭제
export const REMOVE_USER_REQUEST = 'REMOVE_USER_REQUEST';
export const REMOVE_USER_SUCCESS = 'REMOVE_USER_SUCCESS';
export const REMOVE_USER_FAILURE = 'REMOVE_USER_FAILURE';

// 이건 나중에 설명을 따로 한다. 리듀서의 단점을 보완하기 위한 액션
// 나중에 설명함!!!
export const ADD_POST_TO_ME = 'ADD_POST_TO_ME';

export default (state = initialState, action) => {
  switch (action.type) {
    case LOG_IN_REQUEST: {
      return {
        ...state,
        isLoading : true,
      };
    }
    case LOG_IN_SUCCESS: {
      return {
        ...state,
        isLoggedIn : true,
        isLoading : false,
        me: dummyUser,
      };
    }
    case LOG_IN_FAILURE: {
      return {
        ...state,
        isLoggedIn : false,
        me: null,
      };
    }

    case LOG_OUT_REQUEST: {
      return {
        ...state,
        isLoggedIn: false,
        user: null,
        isLoading : true,
      };
    }
    case SIGN_UP_REQUEST: { // sigun up추가하기
      return { 
        ...state, 
        signUpData: action.data, 
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
나중에 액션에서 더 추가 할 것이라서 일단 모양으로만 만들어 놓았다. <br>

#### \front\reducers\post.js
```js
export const initialState = {
  mainPosts: [{
    User: {
      id: 1,
      nickname: '제로초',
    },
    content: '첫 번째 게시글',
    img: 'https://img.freepik.com/free-photo/hooded-computer-hacker-stealing-information-with-laptop_155003-1918.jpg?size=664&ext=jpg',
  }], // 화면에 보일 포스터들
  imagePaths: [], // 미리보고 이미지 경로
  addPostError: false, // 포스트 업로드 실패 이유
  isAddingPost: false, // 포스트 업로드 중
};

// 포스트 업로드
export const ADD_POST_REQUEST = 'ADD_POST_REQUEST';
export const ADD_POST_SUCCESS = 'ADD_POST_SUCCESS';
export const ADD_POST_FAILURE = 'ADD_POST_FAILURE';
// 메인 포스트 로딩
export const LOAD_MAIN_REQUEST = 'LOAD_MAIN_REQUEST';
export const LOAD_MAIN_SUCCESS = 'LOAD_MAIN_SUCCESS';
export const LOAD_MAIN_FAILURE = 'LOAD_MAIN_FAILURE';
// 해쉬태그 검색했을 결과
export const LOAD_HASHTAG_POSTS_REQUEST = 'LOAD_HASHTAG_POSTS_REQUEST';
export const LOAD_HASHTAG_POSTS_SUCCESS = 'LOAD_HASHTAG_POSTS_SUCCESS';
export const LOAD_HASHTAG_POSTS_FAILURE = 'LOAD_HASHTAG_POSTS_FAILURE';
// 사용자가 어떤 게시글 작성했는지
export const LOAD_USER_POSTS_REQUEST = 'LOAD_USER_POSTS_REQUEST';
export const LOAD_USER_POSTS_SUCCESS = 'LOAD_USER_POSTS_SUCCESS';
export const LOAD_USER_POSTS_FAILURE = 'LOAD_USER_POSTS_FAILURE';
// 이미지 업로드 액션
export const UPLOAD_IMAGES_REQUEST = 'UPLOAD_IMAGES_REQUEST';
export const UPLOAD_IMAGES_SUCCESS = 'UPLOAD_IMAGES_SUCCESS';
export const UPLOAD_IMAGES_FAILURE = 'UPLOAD_IMAGES_FAILURE';
// 이미지 업로드 취소 (유일하게 비동기가 아니다.)
export const REMOVE_IMAGE = 'REMOVE_IMAGE';
// 포스트 좋아요 
export const LIKE_POST_REQUEST = 'LIKE_POST_REQUEST';
export const LIKE_POST_SUCCESS = 'LIKE_POST_SUCCESS';
export const LIKE_POST_FAILURE = 'LIKE_POST_FAILURE';
// 포스트 좋아요(취소)
export const UNLIKE_POST_REQUEST = 'UNLIKE_POST_REQUEST';
export const UNLIKE_POST_SUCCESS = 'UNLIKE_POST_SUCCESS';
export const UNLIKE_POST_FAILURE = 'UNLIKE_POST_FAILURE';
// 댓글 남기는 거
export const ADD_COMMENT_REQUEST = 'ADD_COMMENT_REQUEST';
export const ADD_COMMENT_SUCCESS = 'ADD_COMMENT_SUCCESS';
export const ADD_COMMENT_FAILURE = 'ADD_COMMENT_FAILURE';
// 댓글 불러오기
export const LOAD_COMMENTS_REQUEST = 'LOAD_COMMENTS_REQUEST';
export const LOAD_COMMENTS_SUCCESS = 'LOAD_COMMENTS_SUCCESS';
export const LOAD_COMMENTS_FAILURE = 'LOAD_COMMENTS_FAILURE';
// 리트윗 
export const RETWEET_REQUEST = 'RETWEET_REQUEST';
export const RETWEET_SUCCESS = 'RETWEET_SUCCESS';
export const RETWEET_FAILURE = 'RETWEET_FAILURE';
// 게시글 삭제 (개인적으로)
export const REMOVE_POST_REQUEST = 'REMOVE_POST_REQUEST';
export const REMOVE_POST_SUCCESS = 'REMOVE_POST_SUCCESS';
export const REMOVE_POST_FAILURE = 'REMOVE_POST_FAILURE';
// 게시글 수정 (개인적으로)
export const UPDATE_POST_REQUEST = 'UPDATE_POST_REQUEST';
export const UPDATE_POST_SUCCESS = 'UPDATE_POST_SUCCESS';
export const UPDATE_POST_FAILURE = 'UPDATE_POST_FAILURE';


const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_POST_REQUEST: {
      return {
        ...state,
      };
    };
    case ADD_POST_SUCCESS: {
      return {
        ...state,
      };
    };
    case ADD_POST_FAILURE: {
      return {
        ...state,
      };
    };

    default: {
      return {
        ...state,
      };
    }
  }
};

export default reducer;
```

## 로그인 리덕스 사이클
[위로가기](#리덕스-사가-배우기)

#### \front\components\LoginForm.js
```js
...생략
import { useDispatch, useSelector } from 'react-redux';
import { LOG_IN_REQUEST } from '../reducers/user';

const LoginForm = () => {
  const dispatch = useDispatch();
  const { isLoggingIn } = useSelector(state => state.user);
  const [id, onChangeId] = useInput('');
  const [password, onChangePassword] = useInput('');

  // Form형식을 이렇게 바꾸었다. dispatch로 id, password들을 전달한다.
  const onsubmitForm = useCallback((e) => {
    e.preventDefault();
    dispatch({
     type: LOG_IN_REQUEST, 
     data: {
       id, password
     } 
    });
  }, [id, password]);

  return (
    <Form onSubmit={onsubmitForm} style={{ padding : '10px' }}>
      ...생략
        <label htmlFor="user-password">비밀번호</label>
        <br />
        <Input name="user-password" value={password} onChange={onChangePassword} type="password" required />
      </div>
      <div style={{marginTop: '10px'}}>
        <Button type="primary" htmlType="submit" loading={isLoggingIn}>로그인</Button> // 추가
        <Link href="/signup"><a><Button>회원가입</Button></a></Link>
      </div>
    </Form>
  )
}

export default LoginForm;
```

#### \front\sagas\user.js
```js
...생략

function loginAPI() {
  return axios.post('/login');
}

function* login() {
  try {
    // 일단 백엔드 서버에 유저 데이터가 없어서 확인하기 위하여 delay를 해주었다.
    // yield call(loginAPI); // 일단 주석처리를 한다.
    yield delay(2000); 
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

export default function* userSaga() {
  yield all([
    fork(watchLogin),
    fork(watchSignUp)
  ]);
}
```


일단 백엔드 서버에 유저 데이터가 없어서 확인하기 위하여 delay를 해주었다.

#### \front\reducers\user.js
```js
const dummyUser = {
  nickname: 'LEEKY',
  Post: [],
  Followings: [],
  Followers: [],
  signUpData: [],
};

export const initialState = {
  isLoggedIn: false, // 로그인 여부
  isLoggingOut : false, // 로그아웃 시도중
  isLogginIn : false, // 로그인 시도중
  LoginInErrorReason: '', // 로그인 실패 이유
  signedUp: false, // 회원가입 성공
  isSigningUp: false, // 회원가입 시도중
  signUpErrorReason: '', // 회원가입 실패 이유
  me: null, // 내 정보
  followingList : [], // 팔로잉 리스트
  followerList: [], // 팔로워 리스트
  userInfo: [], // 남의 정보
};
// 회원가입
export const SIGN_UP_REQUEST = 'SIGN_UP_REQUEST';
export const SIGN_UP_SUCCESS = 'SIGN_UP_SUCCESS';
export const SIGN_UP_FAILURE = 'SIGN_UP_FAILURE';
// 로그인
export const LOG_IN_REQUEST = 'LOG_IN_REQUEST'; // 액션의 이름
export const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS'; // 액션의 이름
export const LOG_IN_FAILURE = 'LOG_IN_FAILURE'; // 액션의 이름
// 로그인 후 사용자 정보 불러오기
export const LOAD_USER_REQUEST = 'LOAD_USER_REQUEST';
export const LOAD_USER_SUCCESS = 'LOAD_USER_SUCCESS';
export const LOAD_USER_FAILURE = 'LOAD_USER_FAILURE';
// 로그아웃
export const LOG_OUT_REQUEST = 'LOG_OUT_REQUEST';
export const LOG_OUT_SUCCESS = 'LOG_OUT_SUCCESS';
export const LOG_OUT_FAILURE = 'LOG_OUT_FAILURE';
...생략

// 이건 나중에 설명을 따로 한다. 리듀서의 단점을 보완하기 위한 액션
export const ADD_POST_TO_ME = 'ADD_POST_TO_ME';

export default (state = initialState, action) => {
  switch (action.type) {
    case LOG_IN_REQUEST: {
      return {
        ...state,
        isLoggingIn: true,
      };
    }
    case LOG_IN_SUCCESS: {
      return {
        ...state,
        isLoggingIn: false,
        isLoggedIn : true,
        isLoading : false,
        me: dummyUser,
      };
    }
    case LOG_IN_FAILURE: {
      return {
        ...state,
        isLoggingIn: false,
        isLoggedIn : false,
        LoginInErrorReason : action.error,
        me: null,
      };
    }

    case LOG_OUT_REQUEST: {
      return {
        ...state,
        isLoggedIn: false,
        user: null,
        isLoading : true,
      };
    }
    case SIGN_UP_REQUEST: { // sigun up추가하기
      return { 
        ...state, 
        signUpData: action.data, 
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

설명이 허접하지만, 많이 해보면 적응이 된다. <br>
순서가 <br>
Form의 ID, password 입력 <br> 
↓<br>
로그인 버튼을 누르면 <br>
↓<br>
LoginForm의 (LOG_IN_REQUEST)가 실행한다<br>
↓<br>
LoginForm의 (isLggingIn)가 true라면 <br>
reducers랑 saga과 동시에 실행<br>
↓<br>
saga에서는 watchLogin함수<br>
↓<br>
saga의 LOG_IN_REQUEST가 실행이 되면서, login함수가 실행<br>
↓<br>
2초후에 saga의 LOG_IN_SUCCESS실행<br>
↓<br>
reducer의 LOG_IN_SUCCESS가 성공이 되서 데이터 전달<br>

### 이때까지 자동으로 로그인 된 부분을 수정하였다.
#### \front\pages\index.js (수정 전)
```js
...생략
import { useDispatch, useSelector } from 'react-redux';
import { LOG_IN_REQUEST } from '../reducers/user';


const Home = () => {
  ...생략

  /// 여기 index화면에 useEffect로 정보를 받아오고 있었기 때문에 자동로그인이 되었다.
  useEffect(() => {
    dispatch( {
      type: LOG_IN_REQUEST,
      data: {
        nickname: 'LEEKY',
      }
    })
  }, []);

  return (
    ...생략
  );
};

export default Home;
```

#### \front\pages\index.js (수정 후)
```js
...생략

const Home = () => {
  ...생략
  // useEffect를 삭제하였음.
  return (
    ...생략
  );
};

export default Home;
```

#### \front\components\UserProfile.js
```js
...생략 
import { LOG_OUT_REQUEST } from '../reducers/user';

const UserProfile = () => {
  const { me } = useSelector(state => state.user); // 수정
  const dispatch = useDispatch();
  const onLogout = useCallback(() => {
    dispatch({ // LOG_OUT_REQUEST 추가
      type: LOG_OUT_REQUEST,
    });
  }, []);

  return (
    <Card
      actions={[
        <div key="twit">짹짹<br />{me.Post.length}</div>,// user-> me로 수정
        <div key="following">팔로잉<br />{me.Followings.length}</div>,// user-> me로 수정
        <div key="follower">팔로워<br />{me.Followers.length}</div>, // user-> me로 수정
      ]}
    >
      <Card.Meta
        avatar={<Avatar>{me.nickname[0]}</Avatar>}
        title={me.nickname}
      />
      <Button onClick={onLogout}>로그아웃</Button>
    </Card> 
  )
}

export default UserProfile;
```

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
    dispatch({ // 여기에 SIGN_UP_REQUEST 수정을 해준다.
      type : SIGN_UP_REQUEST,
      data : {
        id, password, nick
      }
    }); 
  }, [password, passwordCheck, term]);
  
  ...생략
  return (
    <>
     ...생략
    </>
  );
};

export default Signup;
```

## 회원가입 리덕스 사이클
[위로가기](#리덕스-사가-배우기)

#### \front\pages\signup.js
```js
...생략
import { SIGN_UP_REQUEST } from '../reducers/user';

// 모듈을 만들어서 재 사용을 하겠다.
export const useInput = (initValue = null) => {
  const [value, setter] = useState(initValue);
  const handler = useCallback((e) => {
    setter(e.target.value);
  }, []);
  return [value, handler];
};

const Signup = () => {
  const dispatch = useDispatch();
  const {isSigningUp} = useSelector(state => state.user); // 추가
  ...생략
  return (
    <>
      <Form onSubmit={onSubmit} style={{ padding : 10}} >
        ...생략
        <div>
          <Checkbox name="user-term" defaultChecked={term} onChange={onChangeTerm}>약관 동의</Checkbox> // 수정 checked -> defalutChecked
          { termError && <div style={{color : 'red'}}>약관에 동의하셔야 합니다.</div> }
        </div>
        <div style={{ marginTop : 10}}>
          <Button type="primary" htmlType="submit" loading={isSigningUp} >가입하기</Button> // loading추가 (isSigninUp)
        </div>
      </Form>
    </>
  );
};

export default Signup;
```

checked의 오류가 있어서 수정한 부분이 있다. 코드 소스 참고할 것 <br>
또한, 가입하기 버튼을 누르면 로딩 창 표시하도록 추가하였다. <br>

#### \front\reducers\user.js
```js
...생략
export const initialState = {
  isLoggedIn: false, // 로그인 여부
  isLoggingOut : false, // 로그아웃 시도중
  isLogginIn : false, // 로그인 시도중
  LoginInErrorReason: '', // 로그인 실패 이유
  signedUp: false, // 회원가입 성공
  isSigningUp: false, // 회원가입 시도중
  // ******************** 밑부분 추가 **************************
  isSignedUp : false, // 회원가입이 되어졌음. (추가하였음)


  signUpErrorReason: '', // 회원가입 실패 이유
  me: null, // 내 정보
  followingList : [], // 팔로잉 리스트
  followerList: [], // 팔로워 리스트
  userInfo: [], // 남의 정보
};
...생략

export default (state = initialState, action) => {
  switch (action.type) {
    ...생략
    case SIGN_UP_REQUEST: { 
      return { 
        ...state, 
        isSigningUp: true,
        isSignedUp: false,
        signUpErrorReason: '',
      }; 
    }
    case SIGN_UP_SUCCESS: { 
      return { 
        ...state, 
        isSigningUp: false,
        isSignedUp: true, 
      }; 
    }
    case SIGN_UP_FAILURE: { 
      return { 
        ...state, 
        signUpErrorReason : '', 
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
import axios from 'axios';
import { all, fork, takeLatest, call, put, delay } from 'redux-saga/effects';
import { LOG_IN_REQUEST, LOG_IN_SUCCESS, LOG_IN_FAILURE, SIGN_UP_REQUEST, SIGN_UP_FAILURE, SIGN_UP_SUCCESS } from '../reducers/user'

...생략

function signUpAPI() {
  return axios.post('/signup');
}

function* signUp() {
  try {
    yield delay(2000);
    // yield call(signUpAPI); 
    yield put({
      type: SIGN_UP_SUCCESS
    });
  } catch (e) {
    console.error(r);
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
솔직히, 지금부터는 형태가 많이 비슷할 것이다. <br>
SING_REQUEST, SIGN_UP_SUCCESS, SIGN_UP_FAILURE가 있다. <br>


## 게시글 작성 리덕스 사이클
[위로가기](#리덕스-사가-배우기)

#### \front\components\PostForm.js
```js
import React, { useCallback, useState, useEffect } from 'react';
import { Form, Input, Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { ADD_POST_REQUEST } from '../reducers/post';

const PostForm = () => {
  const { imagePaths, isAddingPost, postAdded } = useSelector(state => state.post);
  const dispatch = useDispatch(); // 추가
  const [text, setText] = useState(''); // 추가

  const onSubmitForm = useCallback((e) => { // 추가
    e.preventDefault();
    dispatch({
      type: ADD_POST_REQUEST,
      data: {
        text,
      }
    });
  }, []);

  const onChangeText = useCallback((e) => { // 추가
    setText(e.target.value);
  }, []);

  // 게시글이 작성되었을 때 text를 리셋해야한다.
  // postAdded(포스트업로드 성공)은 reducer의 추가되었다. 
  useEffect(() => {
    if (postAdded) {
      setText('');
    }
  }, [postAdded]);

  return (
    <Form style={{ margin: '10px 0 20px' }} encType="multipart/fomr-data" onSubmit={onSubmitForm}>
      <Input.TextArea maxLength={140} placeholder="어떤 신기한 일이 있었나요?" value={text} onChange={onChangeText} />  // 추가
      <div>
        <input type="file" multiple hidden />
        <Button>이미지 업로드</Button>
        <Button type="primary" style={{ float : 'right'}} htmlType="submit" loading={isAddingPost} >업로드</Button> // loading 추가
      </div>
      <div>
        {imagePaths.map((v) => {
          return (
            <div key={v} style={{ display: 'inline-black' }}>
              <img src={'http://localhost:3065/' + v} style={{ width : '200px' }} alt={v} />
              <div>
                <Button>제거</Button>
              </div>
            </div>
          )
        })}  
      </div>  
  </Form>
  )
}

export default PostForm;
```

#### \front\reducers\post.js
```js
export const initialState = {
  mainPosts: [{
    User: {
      id: 1,
      nickname: '제로초',
    },
    content: '첫 번째 게시글',
    img: 'https://img.freepik.com/free-photo/hooded-computer-hacker-stealing-information-with-laptop_155003-1918.jpg?size=664&ext=jpg',
  }], // 화면에 보일 포스터들
  imagePaths: [], // 미리보고 이미지 경로
  addPostError: false, // 포스트 업로드 실패 이유
  isAddingPost: false, // 포스트 업로드 중
  postAdded: false, // 포스트 업로드 성공 ( ***** 추가 ********)
};

//일단 임시로 추가한다.
const dummyPost = { 
  User: {
    id: 1,
    nickname: 'dummyNickName',
  },
  content: 'dummyTestContent',
}

...생략

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_POST_REQUEST: {
      return {
        ...state,
        isAddingPost: true,
        addPostError: '',
        postAdded: false, 
      };
    };
    case ADD_POST_SUCCESS: {
      return {
        ...state,
        isAddingPost: false,
        // 기존의 있던 포스트에 더미 포스트를 넣어준다
        // 그 다음에 사가도 구성같이 해준다.
        mainPosts: [dummyPost, ...state.mainPosts], 
        postAdded: true, 
      };
    };
    case ADD_POST_FAILURE: {
      return {
        ...state,
        isAddingPost: false,
        addPostError: action.error,
      };
    };

    default: {
      return {
        ...state,
      };
    }
  }
};

export default reducer;
```

#### \front\sagas\post.js
```js
import { all, fork, takeLatest, put, delay } from 'redux-saga/effects';
import { ADD_POST_REQUEST, ADD_POST_FAILURE, ADD_POST_SUCCESS } from '../reducers/post';

function* addPost() {
  try {
    yield delay(2000);
    yield put({
      type: ADD_POST_SUCCESS,
    })
  } catch (e) {
    console.log(e);
    yield put({
      type: ADD_POST_FAILURE,
      error: e
    })
  }
}

function* matchAddPost() {
  yield takeLatest(ADD_POST_REQUEST, addPost)
}

export default function* postSaga() {
  yield all([
    fork(matchAddPost),
  ]);
}
```

## next Router로 페이지 이동하기
[위로가기](#리덕스-사가-배우기)

### 회원가입 페이지에서 로그인하면 회원가입 페이지 안되도록 하는 방법!!!!(중요!!!)

#### \front\pages\signup.js
```js
...생략
import router from 'next/router'; // 추가
...생략


...생략

const Signup = () => {
  const dispatch = useDispatch();
  const {isSigningUp, me} = useSelector(state => state.user); // me추가
  ...생략


  // 프로그래밍적으로 링크를 바꿀 수가 있다.
  useEffect(() => {
    // next의 Link도 있는데 router로 사용할 수도 있다.
    if(me) {
      alert('로그인했으니 메인페이지로 이동합니다.');
      router.push('/')
    }
  }, [me && me.id]); // 참고로 배열안에 객체를 넣어주지 말고, 객체 안의 값을 넣어줘야한다.
  // 왜냐하면, 비교하는게 힘들기 때문이다.
  // 자바스크립트는 undefined일 수도 있으니까 보호해주기 위해서 &&연산자를 사용
  
  return (
    <>
      ...생략
    </>
  );
};

export default Signup;
```



#### \front\components\PostForm.js(코드 잠깐 수정)
```js
...생략

const PostForm = () => {
  ...생략

  return (
    <Form style={{ margin: '10px 0 20px' }} encType="multipart/fomr-data" onSubmit={onSubmitForm}>
      ...생략
      <div>
        {imagePaths.map((v) => ( // 잠깐 코드 수정(그렇게 중요하지 않다.)
          <div key={v} style={{ display: 'inline-black' }}>
            <img src={`http://localhost:3065/${v}`} style={{ width : '200px' }} alt={v} />
            <div>
              <Button>제거</Button>
            </div>
          </div>
        ))}  
      </div>  
  </Form>
  )
}

export default PostForm;
```

## 댓글 컴포넌트 만들기
[위로가기](#리덕스-사가-배우기)

#### \front\components\PostCard.js
```js
import React, { useState, useCallback } from 'react';
import { Card, Icon, Button, Avatar, Form, Input, List, Comment } from 'antd';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { ADD_COMMENT_REQUEST } from '../reducers/post';

const PostCard = ({post}) => {

  const [commentFormOpened, setCommentFormOpened] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { me } = useSelector(state => state.user);
  const dispatch = useDispatch();

  const onToggleComment = useCallback(() => {
    // 펼쳐져 있으면 닫고, 닫혀져있으면 열고
    setCommentFormOpened(prev => !prev); // 함수형 setState이다. !!!!!기능적으로 중요!!!
  }, []);
  /* 설명 추가!!!!!!!!!!!
  prev가 과거의 값 이다. prev => !prev는 과거의 값을 반전하라는 뜻이다.
  function(prev) { return !prev }와 같다.
  prev가 false였다면 반전해서 true로 만들고
  true였다면 반전해서 false로 만들게 됩니다.

  여기서 질문!!!!
  실질적으로, 콘솔에, 변환하기전 Before 과 변환후를 After를 
  찍어보면은,  값은 변하지는 않고 다 false 만 나오네???!!!!!!!!!
  해답 :
  setCommentFormOpened(prev => !prev);는 비동기이다. 
  전후로 console.log찍어도 setCommentFormOpened(prev => !prev);보다 먼저 실행돼서 둘 다 false로 뜹니다.

  */
  
  const onSubmitComment = useCallback((e) => {
    e.preventDefault();
    // 로그인을 안하면 자꾸 리턴을 해줘서 돌아간다. 그러니까 로그인을 하면 ADD_COMMENT_REQUEST가 반응한다.
    if (!me) { // 댓글은 로그인을 했던 사람만 불러올 수 있도록 if문을 사용
      return alert('로그인이 필요합니다.');
    };
    dispatch({
      type: ADD_COMMENT_REQUEST,
    })
  }, []);

  // 이거는 리액트 기초편에 설명있음
  const onChangeCommentText = useCallback((e) => {
    setCommentText(e.target.value);
  }, []);

  return (
    <div>
      <Card
        key={+post.createAt}
        cover={post.img && <img alt="example" src={post.img} />}
        actions={[
          <Icon type="retweet" key="retweet" />,
          <Icon type="heart" key="heart" />,
          <Icon type="message" key="message" onClick={onToggleComment} />,
          <Icon type="ellipsis" key="ellipsis" />,
        ]}
        extra={<Button>팔로우</Button>}
      >
        {/* 카드 세부 정보  */}
        <Card.Meta 
          avatar={<Avatar>{post.User.nickname[0]}</Avatar>}
          title={post.User.nickname}
          description={post.content}
        />
      </Card>
      // prev => !prev의 기능이 열고 닫고 해준다.
      {commentFormOpened && ( // 열려있으면 true, 닫혀져있으면 false 
        <> // 이거 사용해주기 위해서 <div></div>로 일단 감싸줬다.
          <Form onSubmit={onSubmitComment}>
            <Form.Item>
              // value는 항상 onchange가 있어야한다. (리액트 기본편)
              <Input.TextArea rows={4} value={commentText} onChange={onChangeCommentText}/> 
            </Form.Item>
            <Button type="primary" htmlType="submit">클릭</Button>
          </Form>
          <List
            header={`${post.Comments ? post.Comments.length : 0} 댓글`}
            itemLayout="horizontal"
            dataSource={post.Comment || []}
            renderItem={ item => ( // 
              <li>
                <Comment
                  author={item.User.nickname}
                  avatar={<Avatar>{item.User.nickname}</Avatar>}
                  content={item.content}
                  datetime={item.createAt}
                />
              </li>
            )}
          />
        </>
      )} 
    </div> 
  )
};

PostCard.prototypes = {
  post: PropTypes.shape({
    User : PropTypes.object,
    content : PropTypes.string,
    img: PropTypes.string,
    createAt: PropTypes.object,  
  }),
}

export default PostCard;
```