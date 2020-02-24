# 리덕스 익히기

+ [redux 주요 개념 소개](#redux-주요-개념-소개)



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

