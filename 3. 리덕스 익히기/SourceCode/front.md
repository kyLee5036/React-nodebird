# 리덕스 익히기 

+ [redux 주요 개념 소개](#redux-주요-개념-소개) 
+ [첫 리듀서 만들기](#첫-리듀서-만들기)
+ [불변성과 리듀서 여러 개 합치기](#불변성과-리듀서-여러-개-합치기)
+ [redux와 react 연결하기](#redux와-react-연결하기)

## redux 주요 개념 소개
[위로가기](#리덕스-익히기)

소스 코드 없음(설명만 있음)

## 첫 리듀서 만들기
[위로가기](#리덕스-익히기)

설명하느라 user.js만 해주었다. 

#### \front\reducers\user.js
```js
const intialState = { // 초기값
  isLoggedIn : false,
  user: {},
}

const LOG_IN = 'LOG_IN' // 액션의 이름
const LOG_OUT = 'LOG_OUT';

const loginAction = { // 실제 액션
  type: LOG_IN,
  data: { // 넣어 줄 액션
    nickname: 'LEEKY',
  }
}

const logoutAction = {
  type: LOG_OUT,
}

const reudcer = (state = intialState, action) => {
  switch(action.type) { // 기본적으로 switch으로 해준다.
    case LOG_IN: { // 로그인 할 경우
      return {
        ...state,
        isLoggedIn: true,
        user: action.user,
      }
    }
    case LOG_OUT: { // 로그아웃 할 경우
      return {
        ...state,
        isLoggedIn: false,
        user: null,
      }
    }
    default: {
      return {
        ...state,
      };
    }
  }
}
```

## 불변성과 리듀서 여러 개 합치기
[위로가기](#리덕스-익히기)

#### \front\reducers\user.js
```js
export const intialState = { 
  isLoggedIn : false,
  user: {},
}

const LOG_IN = 'LOG_IN' 
const LOG_OUT = 'LOG_OUT';

const loginAction = { 
  type: LOG_IN,
  data: { 
    nickname: 'LEEKY',
  }
}

const logoutAction = {
  type: LOG_OUT,
}

const reducer = (state = intialState, action) => {
  switch(action.type) { 
    case LOG_IN: {
      return {
        ...state,
        isLoggedIn: true,
        user: action.user,
      };
    }
    case LOG_OUT: {
      return {
        ...state,
        isLoggedIn: false,
        user: null,
      };
    }
    default: {
      return {
        ...state,
      };
    }
  }
}

export default reducer;
```

#### \front\reducers\post.js
```js
export const initalState = {
  mainPosts: [],
};

const ADD_POST = 'ADD_POST';
const ADD_DUMMY = 'ADD_DUMMY';

const addPost = {
  type: ADD_POST,
};

const addDummy = {
  type: ADD_DUMMY,
  data: {
    content: 'Hello',
    userId: 1,
    User: {
      nickname: 'LEEKY'
    }
  }
};

const reducer = (state = initalState, action) => {
  switch (action.type) {
    case ADD_POST: {
      return {
        ...state,
      };
    }
    case ADD_DUMMY: {
      return {
        ...state,
        // 불변성 유지하기 위해서 사용 -> immer를 사용할 것이다 (나중에)
        mainPosts: [action.data, ...state.mainPosts], 
      };
    }
    default: {
      return {
        ...state,
      };
    }
  }
};

export default reducer;
```

#### \front\reducers\index.js
```js
import { combineReducers } from 'redux'; 

import user from './user';
import post from './post';

const rootReducer = combineReducers({
  user,
  post,
});

export default rootReducer;
```

## redux와 react 연결하기
[위로가기](#리덕스-익히기)

#### \front\pages\_app.js
```js
import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import WithRedux from 'next-redux-wrapper';
import AppLayout from '../components/App.Layout';
import { Provider } from 'react-redux'; 
import reducer from '../reducers/index';
import { createStore } from 'redux';

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
  const store = createStore(reducer, initalState); 
  return store;
})(NodeBird);
```