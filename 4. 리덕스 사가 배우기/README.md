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