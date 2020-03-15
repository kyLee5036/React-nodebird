# 리덕스 사가 배우기

+ [리덕스 사가의 필요성과 맛보기](#리덕스-사가의-필요성과-맛보기)
+ [사가 미들웨어 리덕스에 연결하기](#사가-미들웨어-리덕스에-연결하기)
+ [ES2015 제너레이터](#ES2015-제너레이터)
+ [사가의 제너레이터 이해하기](#사가의-제너레이터-이해하기)
+ [사가에서 반복문 제어하기](#사가에서-반복문-제어하기)

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
