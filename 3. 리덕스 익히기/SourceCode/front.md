# 리덕스 익히기 

+ [redux 주요 개념 소개](#redux-주요-개념-소개) 
+ [첫 리듀서 만들기](#첫-리듀서-만들기)


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
  }
}
```