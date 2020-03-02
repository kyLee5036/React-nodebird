# 리덕스 익히기

+ [redux 주요 개념 소개](#redux-주요-개념-소개)
+ [첫 리듀서 만들기](#첫-리듀서-만들기)
+ [불변성과 리듀서 여러 개 합치기](#불변성과-리듀서-여러-개-합치기)
+ [redux와 react 연결하기](#redux와-react-연결하기)
+ [redux devtools 사용하기](#redux-devtools-사용하기)
+ [react redux 훅 사용하기](#react-redux-훅-사용하기)
+ [react redux connect](#react-redux-connect)

## redux 주요 개념 소개
[위로가기](#리덕스-익히기)

설명이 주절주절 길어지니까.. <br>
솔직히 useReducer랑 많이 비슷하다...(useReducer랑 reducer는 다른 거임!!) <br>

dummy 데이터(state)는 변경될 경우가 있어서 관리하기 힘들다.. <br>
그래서 관리하기 위해서는 <strong>redux, mobx, graphQL</strong>가 있다. <br>

그리서 이번 시간에는 redux-saga로 관리를 할 것이다. <br>
흩어져 있는 state들을 하나로 모았다고 가정(중앙통제실)하고, 컴포넌트마다 필요한 state를 관리한다. <br>

예로 들어서 <br>
```js
{
  isLoggedIn : false, // 로그인 여부 -> A가 필요
  user : { // 로그인한 사용자 -> B, C가 필요
    ...
  },
  mainPost: { // 메인 게시글을 -> C 필요
    ...
  },
  // 이런 식으로 관리하기 힘들어지고 다른 곳에도 필요가 있을 경우에는 reudx를 사용한다.
} // -> store(관리)
```
> store는 state와 action, reudcer가 다 합쳐진 개념이다. <br>

### Action, Dispatch, Reducer
Action -> state를 바꾸는 행동 <br>
Dispatch -> Action을 실행  <br>
Reducer -> Action의 결과로 state를 어떻게 바꿀지 정의 <br>

> redux는 store, Action, Dispatch, Reducer를 알면 사용할 수 있다. 

Redux(state)를 사용하면 -> React의 state는 쓰지 않아도 된다. <br>
하지만, 같이 사용해도 된다. 어떨 때 사용할까?? <br>
React의 useState는 간단한 곳에 사용하고, 복잡한 곳(관리하기 힘든 곳)은 redux의 사용한다. <br>

그래서 redux왜 사용하냐?? <br>
결국에는 안정성, state 통제하기 쉬워서 사용한다. <br>

Tip) Redux는 Vue, React, Angular(?)에도 사용할 수 있다. <br>


## 첫 리듀서 만들기
[위로가기](#리덕스-익히기)

리덕스를 사용하기 위해서 패키지를 몇 개 설치하겠다. <br>

<pre><code>npm i redux react-redux</code></pre>

react-redux를 설치하는 이유는 react랑 연결해주기 위해서 react-redux도 설치해줘야 한다. <br>

reducers라는 폴더를 만들 것이다. <br>
리덕스를 하면 단점이 코드량이 상당히 많지만, 예상치 못한 동작이 생길 일은 없다. <br>

`\front\reducers` 안에 `index.js, post.js, user.js`를 생성한다. <br>

> state 구조 잡는 건 경험이 많이 쌓여야 잘 잡을 수 있다.
```js
{
  // user.js
  isLoggedIn : false, 
  user : { 
    ...
  },

  // *********구별***********
 
  // post.js 
  mainPost: { 
    ...
  },
} // -> store(관리)
```

store에 전부 넣으면 상당히 많아서, 쪼개서 나눈다. 대신에 route-store가 있어야한다. <br>
<strong>index.js라는 router-store를 만들어주고</strong>, 그 중에서 post.js, user.js를 나누어 줄 것이다. <br>

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
        ...state, // ...는 spread 문법이다.
        isLoggedIn: true,
        user: action.user,
      }
    }
    case LOG_OUT: { // 로그아웃 할 경우
      return {
        ...state,
        isLoggedIn: false, 
        user: null, // user 목록들을 null로 해준다.
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

post.js도 만들어 볼 것이다. <br>

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

#### \front\reducers\index.js
```js
// 하나로 묶어줄 것이다.
import { combineReducers } from 'redux'; // combineReducers가 redux를 하나로 묶어준다

import user from './user';
import post from './post';

const rootReducer = combineReducers({
  user,
  post,
});

export default rootReducer;
```

user reducer, post reducer가 있는데, root reducer로 묶어주었다. <br>
initalState도 하나로 묶여진다. <br>

> <strong>combineReducers</strong>가 redux를 하나로 묶어준다.

쪼개어서 보이지만, 결국에는 하나로 합쳐진다.<br><br>

`user.js`로 되었던 부분
```js
{
  // user.js
  isLoggedIn : false, 
  user : { 
    ...
  },
} // -> store(관리)
```

`post.js`로 되었던 부분
```js
{
  // post.js 
  mainPost: { 
    ...
  },
} // -> store(관리)
```

`index.js` === (user.js + post.js)
```js
{
  isLoggedIn : false, 
  user : { 
    ...
  },

  mainPost: { 
    ...
  },
} // -> store(관리)
```
결국에는 합쳐서 이런 식으로 될 것이다.


## redux와 react 연결하기
[위로가기](#리덕스-익히기)

react랑 연결을 할 것이다. <br>
`\front\pages\_app.js` 레이아웃 역할을 하고 있다. 모든 페이지에 공통적으로 들어가 있다. <br>

> app.js에 redux를 연결해줘야한다. <br>

#### \front\pages\_app.js
```js
...생략
import { Provider } from 'react-redux'; //  react-redux를 사용하기 위해서 Provider을 추가
import reducer from '../reducers/index'; // reudcer 추가

const NodeBird = ({Component, store}) => {
  return (
    // store가 redux의 state이다.
    // Provider가 최상의 props이다.
    <Provider store={store} >  // 추가
      <Head>
        <title>NodeBird</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
      </Head>
      <AppLayout >
        <Component />
      </AppLayout>
    </Provider> // 추가
  );
};
...생략
export default NodeBird;
```

react-redux에 붙이는거랑 next에 react-redux에 붙이는 거랑 달라서 next-redux-wrapper를 설치해야 한다. <br>
<pre><code>npm i next-redux-wrapper</code></pre>

하지만, 여기서 store가 구현이 안되어있다. <br>
그러기 때문에, `next-redux-wrapper`를 사용한다. <br>

#### \front\pages\_app.js
```js
import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import WithRedux from 'next-redux-wrapper'; // widthRedux를 추가한다.
import AppLayout from '../components/App.Layout';
import { Provider } from 'react-redux'; 
import reducer from '../reducers/index'; // 아직 사용 안함. 나중에 사용할 것임

const NodeBird = ({Component, store}) => {
  return (

    <Provider store={store} > 
      ...생략
    </Provider>
  );
};
...생략
export default WithRedux()(NodeBird); // withRedux가 BodeBird를 감싸준다.
```

NodeBird에는 WithRedux라는게 NodeBird 컴포넌트에 props를 store 쪽에게 넣어주는 역할이다. <br>

그냥.. 솔직히 이해를 못하면 외우면 된다. 왜냐하면 모든 프로젝트에서 똑같이 사용하기 떄문이다. <br>

#### \front\pages\_app.js
```js
...생략
import WithRedux from 'next-redux-wrapper';
import AppLayout from '../components/App.Layout';
import { Provider } from 'react-redux'; 
import reducer from '../reducers/index'; // index의 reducer를 createStore에 넣어준다.
import { createStore } from 'redux'; // 추가를 해준다

const NodeBird = ({Component, store}) => {
  return (

    <Provider store={store} > // store을 구현 해주었다.
      ...생략
    </Provider>
  );
};

NodeBird.prototype = {
  Component : PropTypes.elementType,
  store: PropTypes.object, // 추가
}

export default WithRedux((initalState, options) => {
  // state랑 reducer가 합쳐지 있는 것이 store이다 
  const store = createStore(reducer, initalState); // 기존적인 형 : reudx에 가지고 있다.
  // 여기에다가 store 커스터마이징

  return store; // 마지막에 store을 리턴해준다.
})(NodeBird);
```
`/reudcer/index.js`의 app.js의 안에 reducer를 createStore에 넣어준다.

여기서 개발자 툴에 보면 provider안에 밑에처럼 정의가 되어져있다.

#### 결과확인
```js
{
  "store": { 
    "dispatch": "dispatch",
    "subscribe": "subscribe",
    "getState": "getState",
    "replaceReducer": "replaceReducer"
  },
  "children": [
    "<Head />",
    "<AppLayout />"
  ]
}
```


## redux devtools 사용하기
[위로가기](#리덕스-익히기)

먼저 redux devtools 다운을 받자. <br>
리덕스에 기능을 추가할려면 `middlewares`를 추가해준다. <br>

#### \front\pages\_app.js
```js
...생략
import { Provider } from 'react-redux'; 
import reducer from '../reducers/index';
import { createStore, compose, applyMiddleware } from 'redux'; // 추가

const NodeBird = ({Component, store}) => {
  ...생략
};

...생략

export default WithRedux((initalState, options) => {
  const middlewares = []; // 미들웨어 추가
  // enhancer : 리덕스에 기능을 향상 시킨다.
  // compose : 미들웨어끼리 합성을 한다(합체)
  const enhancer = compose(
    applyMiddleware(...middlewares)); // 
  const store = createStore(reducer, initalState, enhancer); 
  return store; 
  // 순서를 지켜줘야 한다.
})(NodeBird);
```
<strong>enhancer</strong> : 리덕스에 기능을 향상 시킨다. <br>
<strong>compose</strong> : 미들웨어끼리 합성을 한다(합체) <br>

#### \front\pages\_app.js
```js
...생략
import { Provider } from 'react-redux'; 
import reducer from '../reducers/index';
import { createStore, compose, applyMiddleware } from 'redux'; // 추가

const NodeBird = ({Component, store}) => {
  ...생략
};

...생략

export default WithRedux((initalState, options) => {
  const middlewares = []; 
  const enhancer = compose(
    applyMiddleware(...middlewares), 
    window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' ?
    window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f,
  ); // 이 코드는 redux-devtools의 사이트에 가져왔다. 확장 프로그램 설치하면 이 window.__REDUX_DEVTOOLS_EXTENSION__를 사용할 수가 있다.


  const store = createStore(reducer, initalState, enhancer); 

  return store;
})(NodeBird);
```
미들웨어는 액션과 스토어 사이에서 동작한다. <br>

솔직히 이해하기 힘들면, 외우는 것도 나쁘지가 않다. <br>
Tip) 코딩할 때에는 이부분이 절대 바뀌지가 않는다 <br>

#### \front\pages\_app.js
```js
export default WithRedux((initalState, options) => {
  const middlewares = []; // 여기 배열만 바뀌는 것이다. (이 부분만!!!! )
  const enhancer = compose(
    applyMiddleware(...middlewares), 
    window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' ?
    window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f,
  ); 
  const store = createStore(reducer, initalState, enhancer); 
  return store;
})(NodeBird);
```

`window is not defined` 에러가 나온다. 밑에 해결방법이 있다. <br>

#### \front\pages\_app.js
```js
export default WithRedux((initalState, options) => {
  const middlewares = [];
  const enhancer = compose(
    applyMiddleware(...middlewares), 
    typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' ? window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f, // 추가 해준다
  ); 
  const store = createStore(reducer, initalState, enhancer); 
  return store;
})(NodeBird);
```

이렇게 해주면 redux-devtools을 사용할 수가 있다. <br>


여기서는 서버 확인 하는 방법이다.
#### \front\pages\_app.js
```js
export default WithRedux((initalState, options) => {
  const middlewares = [];
  const enhancer = compose(
    applyMiddleware(...middlewares), 
    
    // options.isServer를 하면 서버 임을 판단한다.
    // options는 서버인지 아닌지를 판단 할 수 있다. 
    !options.isServer && window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' ? window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f,
    
    // 여기 이 부분을 주석을 처리한다.
    // typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' ? window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f,
  ); 
  const store = createStore(reducer, initalState, enhancer); 
  return store;
})(NodeBird);
```


## react redux 훅 사용하기
[위로가기](#리덕스-익히기)

연습으로 메인화면에서 action을 dispatch를 해보겠다. <br>

<pre><code>npm i react-redux

+ react-redux@7.2.0
</code></pre>

리액트에서의 훅을 리덕스에 사용할려면 버전 7.1.0 이상이어야한다. <br>
그래야만 훅에서 리덕스를 지원해주기 때문이다. <br>

### useDispatch (action 하는 방법)
dispatch 하는 방법 <br>

#### \front\pages\index.js
```js
import React, { useEffect } from 'react'; // 추가
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { useDispatch } from 'react-redux'; // 추가
import { LOG_IN } from '../reducers/user'; // 추가

...생략

const Home = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch( {
      type: LOG_IN,
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

### useSelector (initalState를 사용하는 방법)

여기서 action만 사용했지만, state를 어떻게 사용했는지 알아보자!! <br>
-> 즉, reducers에서의 user의 initalState를 사용하는 방법을 알아보자!! <br>

#### \front\pages\index.js
```js
...생략
import { useDispatch, useSelector } from 'react-redux'; // useSelector 추가해준다.
import { LOG_IN } from '../reducers/user';

...생략

const Home = () => {
  const dispatch = useDispatch();
  const {isLoggedIn, user} = useSelector(state => state.user); 
  // 여기에서 useSelector의 전자 state는 전체 state 의미를 한다.
  //  => state.user 이 부분은 state에서 user인 state를 가져오는 것이다.
  // 즉, 전체 state에서 user를 가져오는 것이다.
  // 그리고, user안에 isLoggedIn이랑 user가 들어있다.
  // 마지막으로, 구조분해로 isLoggedIn, user를 사용한다.
  
  // 구조분해 하기 전의 모습
  const user = useSelector(state => state.user); 
  console.log(user);

  useEffect(() => {
    dispatch( {
      type: LOG_IN,
      data: {
        nickname: 'LEEKY',
      }
    })
  }, []);

  return (
    <div>
      {user ? <div>로그인 했습니다 : {user.nickname}</div> : <div>로그아웃 했습니다</div>}
      {dummy.isLoggedIn && <PostForm /> }
     ...생략
    </div>
  );
};

export default Home;
```

console.log(user)의 화면 <br>
```js 
{ isLoggedIn: false, 
  user: {
    …
  }}
```

## react redux connect
[위로가기](#리덕스-익히기)

복습하기
useDispatch : action을 실행
useSelector : reudx의 state를 사용할 수 있다.

### 옛날 방식
Hooks가 없을 때 react, react-redux 연결하는 법

```js
import React, { useEffect } from 'react';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
// import { useDispatch, useSelector } from 'react-redux'; // 사용하지 않는다
import { connect } from 'react-redux'; // 추가
import { LOG_IN } from '../reducers/user';

const dummy = {
  ....생략
}

const Home = () => {
  const dispatch = useDispatch();
  const {isLoggedIn, user} = useSelector(state => state.user); 
  ...생략
};

function MapStateToProps () { // 추가
  
}

export default connect(MapStateToProps)(Home); // 추가
```

```js
....생략
import { connect } from 'react-redux'; 
import { LOG_IN } from '../reducers/user';

const dummy = {
  ...생략
}

const Home = ({ user, dispatch, login, logout }) => {
  // const dispatch = useDispatch();
  // const {isLoggedIn, user} = useSelector(state => state.user); 
  useEffect(() => {
    login();
    logout();
    login();
  }, []);

  return (
    ...생략
  );
};

function MapStateToProps () { // 의미 : 리덕스 state react props로 만들겠다. 
  return {
    user: state.user, // props의 user가 들어간다.
  };
}

function mapDispatchToProps(dispatch) {
  return {
    login: () => dispatch(LOG_IN),
    logout: () => dispatch(LOG_OUT),
  };
}

export default connect(MapStateToProps, mapDispatchToProps)(Home);
```

취향에 따라 사용하면 된다. 아무래도 우리는 Hooks를 사용한다.

