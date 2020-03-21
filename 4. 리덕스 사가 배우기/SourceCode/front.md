# 리덕스 사가 배우기

+ [리덕스 사가의 필요성과 맛보기](#리덕스-사가의-필요성과-맛보기)
+ [사가 미들웨어 리덕스에 연결하기](#사가-미들웨어-리덕스에-연결하기)
+ [ES2015 제너레이터](#ES2015-제너레이터)
+ [사가의 제너레이터 이해하기](#사가의-제너레이터-이해하기)
+ [사가에서 반복문 제어하기](#사가에서-반복문-제어하기)
+ [takeEvery takeLatest](#takeEvery-takeLatest)
+ [fork call 사가 총정리](#fork-call-사가-총정리)
+ [사가 패턴과 Q&A](#사가-패턴과-Q&A)



## 리덕스 사가의 필요성과 맛보기
[위로가기](#리덕스-사가-배우기)

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

#### \front\saga\post.js
```js
import { all } from 'redux-saga/effects';

export default function* postSaga() {
  yield all([]);
}
```

#### \front\saga\user.js
```js
import { all, fork, takeLatest, call, put } from 'redux-saga/effects';
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
  yield takeLatest(LOG_IN, login);
}

export default function* userSaga() {
  yield all([
    fork(watchLogin),
  ]);
}
``` 

## 사가 미들웨어 리덕스에 연결하기
[위로가기](#리덕스-사가-배우기)

#### \front\pages\_app.js
```js
import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import WithRedux from 'next-redux-wrapper';
import AppLayout from '../components/App.Layout';
import { Provider } from 'react-redux'; 
import reducer from '../reducers/index';
import { createStore, compose, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas';

const NodeBird = ({Component, store}) => {
  return (
    <Provider store={store} > 
      <Head>
        <title>NodeBird</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
      </Head>
      <AppLayout >
        <Component />
      </AppLayout>
    </Provider>
  );
};

NodeBird.prototype = {
  Component : PropTypes.elementType,
  store: PropTypes.object,
}

export default WithRedux((initalState, options) => {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [sagaMiddleware];
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

## ES2015 제너레이터
[위로가기](#리덕스-사가-배우기)
(코드 없음)

## 사가의 제너레이터 이해하기
[위로가기](#리덕스-사가-배우기)
(코드 없음)

## 사가에서 반복문 제어하기
[위로가기](#리덕스-사가-배우기)

#### \front\sagas\user.js
```js
import { all, fork, takeLatest, call, put, take, delay } from 'redux-saga/effects';
import { LOG_IN, LOG_IN_SUCCESS, LOG_IN_FAILURE } from '../reducers/user'

function loginAPI() {

}

function* login() {
  try {
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
  while(true) {
    yield take(LOG_IN);
    yield delay(2000);
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

(코드 없음)

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

+ [사가 패턴과 Q&A](#사가-패턴과-Q&A)
[위로가기](#리덕스-사가-배우기)

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
  isLoggedIn: false,
  user: null,
  signUpData: {},
  loginData: {},
};

export const SIGN_UP_REQUEST = 'SIGN_UP_REQUEST';
export const SIGN_UP_SUCCESS = 'SIGN_UP_SUCCESS';
export const SIGN_UP_FAILURE = 'SIGN_UP_FAILURE';

export const LOG_IN_REQUEST = 'LOG_IN_REQUEST'; // 액션의 이름
export const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS'; // 액션의 이름
export const LOG_IN_FAILURE = 'LOG_IN_FAILURE'; // 액션의 이름

export const LOG_OUT_REQUEST = 'LOG_OUT_REQUEST';
export const LOG_OUT_SUCCESS = 'LOG_OUT_SUCCESS';
export const LOG_OUT_FAILURE = 'LOG_OUT_FAILURE';

export const signUpAction = (data) => {
  return {
    type: SIGN_UP_REQUEST,
    data,
  };
};

export const signUpSuccess = {
  type: SIGN_UP_SUCCESS,
};

export const loginAction = (data) => {
  return {
    type: SIGN_UP_REQUEST,
    data,
  }
};
export const logoutAction = {
  type: LOG_OUT_REQUEST,
};
export const signUp = (data) => {
  return {
    type: SIGN_UP_REQUEST,
    data,
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOG_IN_REQUEST: {
      return {
        ...state,
        isLoggedIn: true,
        loginData: action.data,
        isLoading : true,
      };
    }

    case LOG_IN_REQUEST: {
      return {
        ...state,
        isLoading : false,
        user: dummyUser,
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