# 백엔드 서버 만들기

+ [백엔드 서버 구동에 필요한 모듈들](#백엔드-서버-구동에-필요한-모듈들)
+ [HTTP 요청 주소 체계 이해하기](#HTTP-요청-주소-체계-이해하기)
+ [Sequelize와 ERD](#Sequelize와-ERD)
+ [테이블간의 관계들](#테이블간의-관계들)
+ [시퀄라이즈 Q&A와 DB 연결하기](#시퀄라이즈-Q&A와-DB-연결하기)
+ [백엔드 서버 API 만들기](#백엔드-서버-API-만들기)
+ [회원가입 컨트롤러 만들기](#회원가입-컨트롤러-만들기)
+ [실제 회원가입과 미들웨어들](#실제-회원가입과-미들웨어들)
+ [로그인을 위한 미들웨어들](#로그인을-위한-미들웨어들)
+ [passport와 쿠키 세션 동작 원리](#passport와-쿠키-세션-동작-원리)
+ [passport 로그인 전략](#passport-로그인-전략)
+ [passport 총정리와 실제 로그인](#passport-총정리와-실제-로그인)
+ [다른 도메인간에 쿠키 주고받기](#다른-도메인간에-쿠키-주고받기)
+ [include와 as, foreignKey](#include와-as,-foreignKey)
+ [로그아웃과 사용자 정보 가져오기](#로그아웃과-사용자-정보-가져오기)
+ [게시글 작성과 데이터 관계 연결하기](#게시글-작성과-데이터-관계-연결하기)



## 백엔드 서버 구동에 필요한 모듈들
[위로가기](#백엔드-서버-만들기)

코드 없음

## HTTP 요청 주소 체계 이해하기
[위로가기](#백엔드-서버-만들기)

코드 없음

## Sequelize와 ERD
[위로가기](#백엔드-서버-만들기)

코드 없음

## 테이블간의 관계들
[위로가기](#백엔드-서버-만들기)

코드 없음

## 시퀄라이즈 Q&A와 DB 연결하기
[위로가기](#백엔드-서버-만들기)

코드 없음

## 백엔드 서버 API 만들기
[위로가기](#백엔드-서버-만들기)

코드 없음

## 회원가입 컨트롤러 만들기
[위로가기](#백엔드-서버-만들기)

코드 없음

## 실제 회원가입과 미들웨어들
[위로가기](#백엔드-서버-만들기)

#### \front\pages\signup.js
```js
import React, { useState, useCallback, useEffect } from 'react';
import { Form, Input, Checkbox, Button } from 'antd';
import { useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import router from 'next/router';
import { SIGN_UP_REQUEST } from '../reducers/user';

export const useInput = (initValue = null) => {
  const [value, setter] = useState(initValue);
  const handler = useCallback((e) => {
    setter(e.target.value);
  }, []);
  return [value, handler];
};

const Signup = () => {
  const dispatch = useDispatch();
  const {isSigningUp, me} = useSelector(state => state.user);
  const [passwordCheck, setPasswordCheck] = useState('');
  const [term, setTerm] = useState(false); 
  const [passwordError, setPasswordError] = useState(false); 
  const [termError, setTermError] = useState(false); 

  const [id, onChangeId] = useInput(''); 
  const [nick, onChangeNick] = useInput('');
  const [password, onChangePassword] = useInput('');
  
  const onSubmit = useCallback((e) => {
    e.preventDefault();
    if ( password !== passwordCheck) {
      return setPasswordError(true);
    }
    if (!term) {
      setTermError(true);
    }
    dispatch({
      type : SIGN_UP_REQUEST,
      data : {
        userId : id,
        password,
        nickname : nick, 
      }
    }); 
  }, [id, nick, password, passwordCheck, term]);
  
  const onChangePasswordCheck = useCallback((e) => {
    setPasswordError(e.target.value !== password); 
    setPasswordCheck(e.target.value);
  }, [password]); 
  const onChangeTerm = useCallback((e) => {
    setTermError(false);
    setTerm(e.target.checked);
  }, []); 


  useEffect(() => {
    if(me) {
      alert('로그인했으니 메인페이지로 이동합니다.');
      router.push('/')
    }
  }, [me && me.id]); 
  
  return (
    <>
      <Form onSubmit={onSubmit} style={{ padding : 10}} >
        <div>
          <label htmlFor="user-id">아이디</label>
          <br />
          <Input name="user-id" value={id} required onChange={onChangeId} />
        </div>
        <div>
          <label htmlFor="user-nick">닉네임</label>
          <br />
          <Input name="user-nick" value={nick} required onChange={onChangeNick} />
        </div>
        <div>
          <label htmlFor="user-password">비밀번호</label>
          <br />
          <Input name="user-password" type="password" value={password} required onChange={onChangePassword} />
        </div>
        <div>
          <label htmlFor="user-password-check">비밀번호체크</label>
          <br />
          <Input name="user-password-check" type="password" value={passwordCheck} required onChange={onChangePasswordCheck} />
          { passwordError && <div style={{color : 'red'}}>비밀번호가 일치하지 않습니다.</div> }
        </div>
        <div>
          <Checkbox name="user-term" defaultChecked={term} onChange={onChangeTerm}>약관 동의</Checkbox>
          { termError && <div style={{color : 'red'}}>약관에 동의하셔야 합니다.</div> }
        </div>
        <div style={{ marginTop : 10}}>
          <Button type="primary" htmlType="submit" loading={isSigningUp} >가입하기</Button>
        </div>
      </Form>
    </>
  );
};

export default Signup;
```

#### \front\sagas\user.js
```js
import axios from 'axios';
import { all, fork, takeLatest, call, put, delay } from 'redux-saga/effects';
import { LOG_IN_REQUEST, LOG_IN_SUCCESS, LOG_IN_FAILURE, SIGN_UP_REQUEST, SIGN_UP_FAILURE, SIGN_UP_SUCCESS } from '../reducers/user'

function loginAPI() {
  return axios.post('/login');
}

function* login() {
  try {
    // yield call(loginAPI);
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

function signUpAPI(signUpdata) {
  return axios.post('http://localhost:3065/api/user/', signUpdata);
}

function* signUp(action) {
  try {
    yield call(signUpAPI, action.data); 
    yield put({
      type: SIGN_UP_SUCCESS
    });
  } catch (e) {
    console.error(e);
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

## 로그인을 위한 미들웨어들
[위로가기](#백엔드-서버-만들기)

코드없음
보너스로 추가되어진 것이 있는데, README.md에 있음.

## passport와 쿠키 세션 동작 원리
[위로가기](#백엔드-서버-만들기)

코드없음

## passport 로그인 전략
[위로가기](#백엔드-서버-만들기)

#### \front\sagas\user.js
```js
import axios from 'axios';
import { all, fork, takeLatest, call, put, delay } from 'redux-saga/effects';
import { LOG_IN_REQUEST, LOG_IN_SUCCESS, LOG_IN_FAILURE, SIGN_UP_REQUEST, SIGN_UP_FAILURE, SIGN_UP_SUCCESS } from '../reducers/user'

function loginAPI(loginData) {
  return axios.post('/login', loginData);
}

function* login(action) {
  try {
    yield call(loginAPI, action.data);
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

function signUpAPI(signUpdata) {
  return axios
  .post('http://localhost:3065/api/user/', signUpdata);
  // .catch((err) => { console.log(err.response.data); return err.response.data });
}

function* signUp(action) {
  try {
    yield call(signUpAPI, action.data); 
    yield put({
      type: SIGN_UP_SUCCESS
    });
  } catch (err) {
    console.log(err.response.data);
    yield put({ 
      type : SIGN_UP_FAILURE,
      error : err.response.data,
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

## passport 총정리와 실제 로그인
[위로가기](#백엔드-서버-만들기)

#### \front\components\LoginForm.js
```js
import React, { useCallback } from 'react'
import { Form, Input, Button} from 'antd';
import Link from 'next/link';
import {useInput} from '../pages/signup';
import { useDispatch, useSelector } from 'react-redux';
import { LOG_IN_REQUEST } from '../reducers/user';

const LoginForm = () => {
  const dispatch = useDispatch();
  const { isLoggingIn } = useSelector(state => state.user);
  const [id, onChangeId] = useInput('');
  const [password, onChangePassword] = useInput('');

  const onsubmitForm = useCallback((e) => {
    e.preventDefault();
    dispatch({
     type: LOG_IN_REQUEST,
     data: {
       userId: id, password
     }, 
    });
  }, [id, password]);

  return (
    <Form onSubmit={onsubmitForm} style={{ padding : '10px' }}>
      <div>
        <label htmlFor="user-id">아이디</label>
        <br />
        <Input name="user-id" value={id} onChange={onChangeId} required />
      </div>
      <div>
        <label htmlFor="user-password">비밀번호</label>
        <br />
        <Input name="user-password" value={password} onChange={onChangePassword} type="password" required />
      </div>
      <div style={{marginTop: '10px'}}>
        <Button type="primary" htmlType="submit" loading={isLoggingIn}>로그인</Button>
        <Link href="/signup"><a><Button>회원가입</Button></a></Link>
      </div>
    </Form>
  )
}

export default LoginForm;
```

#### \front\components\UserProfile.js
```js
import React, { useCallback } from 'react';
import { Avatar, Card, Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { LOG_OUT_REQUEST } from '../reducers/user';

const UserProfile = () => {
  const { me } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const onLogout = useCallback(() => {
    dispatch({
      type: LOG_OUT_REQUEST,
    });
  }, []);

  return (
    <Card
      actions={[   ]}
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
  isSignedUp : false, // 회원가입이 되어졌음.
  signUpErrorReason: '', // 회원가입 실패 이유
  isSignUpSuccesFailure: false, // 회원가입 성공여부
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
        me: action.data,
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
    case SIGN_UP_REQUEST: { 
      return { 
        ...state, 
        isSigningUp: true,
        isSignedUp: false,
        signUpErrorReason: '',
        isSignUpSuccesFailure: false,
      }; 
    }
    case SIGN_UP_SUCCESS: { 
      return { 
        ...state, 
        isSigningUp: false,
        isSignedUp: true, 
        isSignUpSuccesFailure: false,
      }; 
    }
    case SIGN_UP_FAILURE: { 
      return { 
        ...state, 
        isSigningUp : false,
        signUpErrorReason : action.error, 
        isSignUpSuccesFailure: true,
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

#### \front\sagas\index.js
```js
import { all, call} from 'redux-saga/effects';
import axios from 'axios';
import user from './user';
import post from './post';

axios.defaults.baseURL = 'http://localhost:3065/api';

export default function* rootSaga() {
  yield all([
    call(user),
    call(post),
  ])
}
```

#### \front\sagas\user.js
```js
import axios from 'axios';
import { all, fork, takeLatest, call, put, delay } from 'redux-saga/effects';
import { LOG_IN_REQUEST, LOG_IN_SUCCESS, LOG_IN_FAILURE, SIGN_UP_REQUEST, SIGN_UP_FAILURE, SIGN_UP_SUCCESS } from '../reducers/user'

function loginAPI(loginData) {
  return axios.post('/user/login', loginData);
}

function* login(action) {
  try {
    const result = yield call(loginAPI, action.data);
    yield put({
      type: LOG_IN_SUCCESS,
      data: result.data
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

function signUpAPI(signUpdata) {
  return axios
  .post('/user/', signUpdata);
  // .catch((err) => { console.log(err.response.data); return err.response.data });
}

function* signUp(action) {
  try {
    yield call(signUpAPI, action.data); 
    yield put({
      type: SIGN_UP_SUCCESS
    });
  } catch (err) {
    // console.log(err.response.data);
    yield put({ 
      type : SIGN_UP_FAILURE,
      error : err.response.data,
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

## 다른 도메인간에 쿠키 주고받기
[위로가기](#백엔드-서버-만들기)

#### \front\sagas\user.js
```js
import axios from 'axios';
import { all, fork, takeLatest, call, put, delay } from 'redux-saga/effects';
import { LOG_IN_REQUEST, LOG_IN_SUCCESS, LOG_IN_FAILURE, SIGN_UP_REQUEST, SIGN_UP_FAILURE, SIGN_UP_SUCCESS } from '../reducers/user'

function loginAPI(loginData) {
  return axios.post('/user/login', loginData, {
    withCredentials: true, 
  });
}

function* login(action) {
  try {
    const result = yield call(loginAPI, action.data);
    yield put({
      type: LOG_IN_SUCCESS,
      data: result.data
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

function signUpAPI(signUpdata) {
  return axios
  .post('/user/', signUpdata);
  // .catch((err) => { console.log(err.response.data); return err.response.data });
}

function* signUp(action) {
  try {
    yield call(signUpAPI, action.data); 
    yield put({
      type: SIGN_UP_SUCCESS
    });
  } catch (err) {
    // console.log(err.response.data);
    yield put({ 
      type : SIGN_UP_FAILURE,
      error : err.response.data,
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


## include와 as, foreignKey
[위로가기](#백엔드-서버-만들기)

#### \front\components\UserProfile.js
```js
import React, { useCallback } from 'react';
import { Avatar, Card, Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { LOG_OUT_REQUEST } from '../reducers/user';

const UserProfile = () => {
  const { me } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const onLogout = useCallback(() => {
    dispatch({
      type: LOG_OUT_REQUEST,
    });
  }, []);

  return (
    <Card
      actions={[
        <div key="twit">짹짹<br />{me.Posts.length}</div>,
        <div key="following">팔로잉<br />{me.Followings.length}</div>,
        <div key="follower">팔로워<br />{me.Followers.length}</div>,
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

## 로그아웃과 사용자 정보 가져오기
[위로가기](#백엔드-서버-만들기)

#### \front\components\App.Layout.js
```js
import React, { useEffect } from 'react';
import { Menu, Input, Row, Col} from 'antd';
import Link from 'next/link'
import PropTypes from 'prop-types';
import LoginForm from './LoginForm';
import UserProfile from './UserProfile';
import { useSelector, useDispatch } from 'react-redux';
import { LOAD_USER_REQUEST } from '../reducers/user';


const AppLayout = ({ children }) => {
  const { me } = useSelector(state => state.user);
  const dispatch = useDispatch();

  useEffect( () => {
    if (!me) {
      dispatch({
        type: LOAD_USER_REQUEST
      });
    }
  }, []);

  return (
    <div>
      <Menu mode="horizontal">
        <Menu.Item key="home"><Link href="/"><a>노드버드</a></Link></Menu.Item>
        <Menu.Item key="profile"><Link href="/profile"><a>프로필</a></Link></Menu.Item>
         <Menu.Item key="mail">
            <Input.Search enterButton style={{ verticalAlign : 'middle' }} />
        </Menu.Item>
      </Menu>
      <Row gutter={10} >
        <Col xs={24} md={6} >
          { me 
          ? <UserProfile />
          : <LoginForm />
        }   
        </Col> 
        <Col xs={24} md={12} >
          {children}
        </Col>
        <Col xs={24} md={6} >
          <Link href="https://github.com/KeonYoungLeee/React-nodebird" prefetch={false} ><a target="_blank">Made by LEEKY</a></Link>
        </Col>
      </Row>
    </div>
  );
};

AppLayout.prototype = {
  children: PropTypes.node,
}

export default AppLayout;
```

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
  isLoggingOut : false, // 로그아웃 시도중
  isLogginIn : false, // 로그인 시도중
  LoginInErrorReason: '', // 로그인 실패 이유
  signedUp: false, // 회원가입 성공
  isSigningUp: false, // 회원가입 시도중
  isSignedUp : false, // 회원가입이 되어졌음.
  signUpErrorReason: '', // 회원가입 실패 이유
  isSignUpSuccesFailure: false, // 회원가입 성공여부
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
        isLoading : false,
        me: action.data,
      };
    }
    case LOG_IN_FAILURE: {
      return {
        ...state,
        isLoggingIn: false,
        LoginInErrorReason : action.error,
        me: null,
      };
    }

    case LOG_OUT_REQUEST: {
      return {
        ...state,
        isLoggingOut: true,
      };
    }
    case LOG_OUT_SUCCESS: {
      return {
        ...state,
        isLoggingOut: false,
        me: null
      };
    }
    case LOG_OUT_FAILURE: {
      return {
        ...state,
        isLoggingOut: false,
      };
    }

    case SIGN_UP_REQUEST: { 
      return { 
        ...state, 
        isSigningUp: true,
        isSignedUp: false,
        signUpErrorReason: '',
        isSignUpSuccesFailure: false,
      }; 
    }
    case SIGN_UP_SUCCESS: { 
      return { 
        ...state, 
        isSigningUp: false,
        isSignedUp: true, 
        isSignUpSuccesFailure: false,
      }; 
    }
    case SIGN_UP_FAILURE: { 
      return { 
        ...state, 
        isSigningUp : false,
        signUpErrorReason : action.error, 
        isSignUpSuccesFailure: true,
      }; 
    }
    
    case LOAD_USER_REQUEST: { 
      return { 
        ...state, 
      }; 
    }
    case LOAD_USER_SUCCESS: { 
      return { 
        ...state, 
        me : action.data, 
      }; 
    }
    case LOAD_USER_FAILURE: { 
      return { 
        ...state, 
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
import { LOG_IN_REQUEST, LOG_IN_SUCCESS, LOG_IN_FAILURE, SIGN_UP_REQUEST, SIGN_UP_FAILURE, SIGN_UP_SUCCESS, LOG_OUT_SUCCESS, LOG_OUT_FAILURE, LOG_OUT_REQUEST, LOAD_USER_SUCCESS, LOAD_USER_FAILURE, LOAD_USER_REQUEST } from '../reducers/user'

function logInAPI(logInData) {
  return axios.post('/user/login', logInData, {
    withCredentials: true, 
  });
}

function* logIn(action) {
  try {
    const result = yield call(logInAPI, action.data);
    yield put({
      type: LOG_IN_SUCCESS,
      data: result.data
    })
  } catch (e) {
    console.error(e);
    yield put({
      type: LOG_IN_FAILURE,
    })
  }
}

function* watchLogIn() {
  yield takeLatest(LOG_IN_REQUEST, logIn);
}

function signUpAPI(signUpdata) {
  return axios.post('/user/', signUpdata);
}

function* signUp(action) {
  try {
    yield call(signUpAPI, action.data); 
    yield put({
      type: SIGN_UP_SUCCESS
    });
  } catch (err) {
    yield put({ 
      type : SIGN_UP_FAILURE,
      error : err.response.data,
    });
  }
}

function* watchSignUp() {
  yield takeLatest(SIGN_UP_REQUEST, signUp);
}


function logOutAPI() {
  return axios.post('/user/logout', {}, { 
    withCredentials: true, 
  }); 
  
}

function* logOut() {
  try {
    yield call(logOutAPI); 
    yield put({
      type: LOG_OUT_SUCCESS
    });
  } catch (err) {
    yield put({ 
      type : LOG_OUT_FAILURE,
      error : err,
    });
  }
}

function* watchLogOut() {
  yield takeLatest(LOG_OUT_REQUEST, logOut);
}



function loadUserAPI(loadUserdata) {
  return axios.get('/user/', {
    withCredentials: true, 
    
  });
  
}

function* loadUser() {
  try {
    const result = yield call(loadUserAPI); 
    yield put({
      type: LOAD_USER_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({ 
      type : LOAD_USER_FAILURE,
      error : err,
    });
  }
}

function* watchLoadUser() {
  yield takeLatest(LOAD_USER_REQUEST, loadUser);
}


export default function* userSaga() {
  yield all([
    fork(watchLogIn),
    fork(watchLogOut), 
    fork(watchLoadUser), 
    fork(watchSignUp)
  ]);
}
```

## 게시글 작성과 데이터 관계 연결하기
[위로가기](#백엔드-서버-만들기)

#### \front\components\PostForm.js
```js
import React, { useCallback, useState, useEffect } from 'react';
import { Form, Input, Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { ADD_POST_REQUEST } from '../reducers/post';

const PostForm = () => {
  const { imagePaths, isAddingPost, postAdded } = useSelector(state => state.post);
  const dispatch = useDispatch();
  const [text, setText] = useState('');

  const onSubmitForm = useCallback((e) => {
    e.preventDefault();
    dispatch({
      type: ADD_POST_REQUEST,
      data: {
        content: text,
      },
    });
  }, [text]);

  const onChangeText = useCallback((e) => {
    setText(e.target.value);
  }, []);

  useEffect(() => {
    if (postAdded) {
      setText('');
    }
  }, [postAdded]);

  return (
    <Form style={{ margin: '10px 0 20px' }} encType="multipart/fomr-data" onSubmit={onSubmitForm}>
      <Input.TextArea maxLength={140} placeholder="어떤 신기한 일이 있었나요?" value={text} onChange={onChangeText} />  
      <div>
        <input type="file" multiple hidden />
        <Button>이미지 업로드</Button>
        <Button type="primary" style={{ float : 'right'}} htmlType="submit" loading={isAddingPost} >업로드</Button>
      </div>
      <div>
        {imagePaths.map((v) => (
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

#### \front\pages\index.js
```js
import React, { useEffect } from 'react';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { useDispatch, useSelector } from 'react-redux';

const Home = () => {
  const dispatch = useDispatch();
  const { me } = useSelector(state => state.user);
  const { mainPosts } = useSelector(state => state.post);
  
  return (
    <div>
      { me && <PostForm /> }
      {mainPosts.map((c) => {
        return (
          <PostCard key={c} post={c} />
        )
      })}
    </div>
  );
};

export default Home;
```

#### \front\reducers\post.js
```js
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
        mainPosts: [action.data, ...state.mainPosts], 
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

    case ADD_COMMENT_REQUEST: {
      return {
        ...state,
        isAddingComment: true,
        addCommentError: '',
        commentAdded: false, 
      };
    };
    case ADD_COMMENT_SUCCESS: {
      const postIndex = state.mainPosts.findIndex(v => v.id === action.data.postId);
      const post = state.mainPosts[postIndex];
      const Comments = [...post.Comments, dummyComment];
      const mainPosts = [...state.mainPosts];
      mainPosts[postIndex] = { ...post, Comments };
      return {
        ...state,
        isAddingComment: false,
        mainPosts,
        commentAdded: true, 
      };
    };
    case ADD_COMMENT_FAILURE: {
      return {
        ...state,
        isAddingPost: false,
        addCommentErrorReason: action.error,
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
import axios from 'axios';
import { all, fork, takeLatest, put, delay, call } from 'redux-saga/effects';
import { ADD_POST_REQUEST, ADD_POST_FAILURE, ADD_POST_SUCCESS, ADD_COMMENT_SUCCESS, ADD_COMMENT_REQUEST, ADD_COMMENT_FAILURE } from '../reducers/post';


function* AddCommentAPI() {

}
function* AddComment(action) { 
  try {
    yield delay(2000);
    yield put({
      type: ADD_COMMENT_SUCCESS,
      data: {
        postId: action.data.postId, 
      }
    })
  } catch (e) {
    console.log(e);
    yield put({
      type: ADD_COMMENT_FAILURE,
      error: e
    })
  }
}
function* matchAddComment() {
  yield takeLatest(ADD_COMMENT_REQUEST, AddComment);
}


function* addPostAPI(postData) {
  return axios.post('/post', postData, {
    withCredentials: true, 
  });
}
function* addPost(action) {
  try {
    const result = yield call(addPostAPI, action.data);
    yield put({
      type: ADD_POST_SUCCESS,
      data: result.data
    });
  } catch (e) {
    console.log(e);
    yield put({
      type: ADD_POST_FAILURE,
      error: e
    })
  }
}
function* matchAddPost() {
  yield takeLatest(ADD_POST_REQUEST, addPost);
}

export default function* postSaga() {
  yield all([
    fork(matchAddPost),
    fork(matchAddComment),
  ]);
}
```


