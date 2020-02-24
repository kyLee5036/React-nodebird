# 리덕스 익히기

+ [redux 주요 개념 소개](#redux-주요-개념-소개)
+ [첫 리듀서 만들기](#첫-리듀서-만들기)
+ [불변성과 리듀서 여러 개 합치기](#불변성과-리듀서-여러-개-합치기)

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

