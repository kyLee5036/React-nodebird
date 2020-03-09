# 리덕스 사가 배우기

+ [리덕스 사가의 필요성과 맛보기](#리덕스-사가의-필요성과-맛보기)

# 리덕스 사가의 필요성과 맛보기
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
