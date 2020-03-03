# 리덕스 익히기 

+ [redux 주요 개념 소개](#redux-주요-개념-소개) 
+ [첫 리듀서 만들기](#첫-리듀서-만들기)
+ [불변성과 리듀서 여러 개 합치기](#불변성과-리듀서-여러-개-합치기)
+ [redux와 react 연결하기](#redux와-react-연결하기)
+ [redux devtools 사용하기](#redux-devtools-사용하기)
+ [react redux 훅 사용하기](#react-redux-훅-사용하기)
+ [react redux connect](#react-redux-connect)
+ [dummy 데이터로 리덕스 사용하기](#dummy-데이터로-리덕스-사용하기)

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

## redux devtools 사용하기
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
import { createStore, compose, applyMiddleware } from 'redux';

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
  const middlewares = [];
  const enhancer = compose(
    applyMiddleware(...middlewares), 
    !options.isServer && window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' ? window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f,
  ); 
  const store = createStore(reducer, initalState, enhancer); 
  return store;
})(NodeBird);
```

## react redux 훅 사용하기
[위로가기](#리덕스-익히기)

#### \front\pages\index.js
```js
import React, { useEffect } from 'react';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { useDispatch, useSelector } from 'react-redux';
import { LOG_IN } from '../reducers/user';

const dummy = {
  isLoggedIn : true,
  imagePaths: [],
  mainPosts: [{
    User: {
      id : 1,
      nickname : 'LEEKY',
    },
    content: '첫번 째 게시글',
    img: 'https://img.freepik.com/free-photo/hooded-computer-hacker-stealing-information-with-laptop_155003-1918.jpg?size=664&ext=jpg',
  }],
}

const Home = () => {
  const dispatch = useDispatch();
  const {isLoggedIn, user} = useSelector(state => state.user); 
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
      {dummy.mainPosts.map((c) => {
        return (
          <PostCard key={c} post={c} />
        )
      })}
    </div>
  );
};

export default Home;
```

#### \front\reducers\user.js
```js
export const intialState = { 
  isLoggedIn : false,
  user: {},
}

export const LOG_IN = 'LOG_IN' 
export const LOG_OUT = 'LOG_OUT';

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

## react redux connect
[위로가기](#리덕스-익히기)

옛날 방식이라서 참고만 할 것!!!!

#### \front\pages\index.js
```js
import React, { useEffect } from 'react';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { useDispatch, useSelector } from 'react-redux';
import { connect } from 'react-redux'; 
import { LOG_IN, LOG_OUT } from '../reducers/user';

const dummy = {
  isLoggedIn : true,
  imagePaths: [],
  mainPosts: [{
    User: {
      id : 1,
      nickname : 'LEEKY',
    },
    content: '첫번 째 게시글',
    img: 'https://img.freepik.com/free-photo/hooded-computer-hacker-stealing-information-with-laptop_155003-1918.jpg?size=664&ext=jpg',
  }],
}

const Home = ({ user, dispatch }) => {
  // const dispatch = useDispatch();
  // const {isLoggedIn, user} = useSelector(state => state.user); 
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
      {dummy.mainPosts.map((c) => {
        return (
          <PostCard key={c} post={c} />
        )
      })}
    </div>
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


## dummy 데이터로 리덕스 사용하기
[위로가기](#리덕스-익히기)

#### \front\components\App.Layout.js
```js
import React from 'react';
import { Menu, Input, Row, Col} from 'antd';
import Link from 'next/link'
import PropTypes from 'prop-types';
import LoginForm from './LoginForm';
import UserProfile from './UserProfile';
import { useSelector } from 'react-redux';

// dummy 삭제
const AppLayout = ({ children }) => {
  const { isLoggedIn } = useSelector(state => state.user)

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
          {isLoggedIn 
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

#### \front\components\LoginForm.js
```js
import React, { useState, useCallback } from 'react'
import { Form, Input, Button} from 'antd';
import Link from 'next/link';
import {useInput} from '../pages/signup';
import { useDispatch } from 'react-redux';

const LoginForm = () => {
  const dispatch = useDispatch();
  const [id, onChangeId] = useInput('');
  const [password, onChangePassword] = useInput('');

  const onsubmitForm = useCallback((e) => {
    e.preventDefault();
    dispatch(LO)
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
        <Button type="primary" htmlType="submit" loading={false}>로그인</Button>
        <Link href="/signup"><a><Button>회원가입</Button></a></Link>
      </div>
    </Form>
  )
}

export default LoginForm;
```

#### \front\components\PostForm.js
```js
import React from 'react';
import { Form, Input, Button } from 'antd';
import { useSelector } from 'react-redux';

const PostForm = () => {
  const { imagePaths } = useSelector(state => state.post);
  return (
    <Form style={{ margin: '10px 0 20px' }} encType="multipart/fomr-data">
      <Input.TextArea maxLength={140} placeholder="어떤 신기한 일이 있었나요?" />  
      <div>
        <input type="file" multiple hidden />
        <Button>이미지 업로드</Button>
        <Button type="primary" style={{ float : 'right'}} htmlType="submit">업로드</Button>
      </div>
      <div>
        {imagePaths.map((v) => {
          return (
            <div key={v} style={{ display: 'inline-black' }}>
              <img src={'http://localhost:3065/' + v} style={{ width : '200px' }} alt={v} />
              <div>
                <Button>제거</Button>
              </div>
            </div>
          )
        })}  
      </div>  
  </Form>
  )
}

export default PostForm;
```

#### \front\components\UserProfile.js
```js
import React, { useCallback } from 'react';
import { Avatar, Card, Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { logoutAction } from '../reducers/user';

const UserProfile = () => {
  const { user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const onLogout = useCallback(() => {
    dispatch(logoutAction);
  }, []);

  return (
    <Card
      actions={[
        <div key="twit">짹짹<br />{user.Post.length}</div>,
        <div key="following">팔로잉<br />{user.Followings.length}</div>,
        <div key="follower">팔로워<br />{user.Followers.length}</div>,
      ]}
    >
      <Card.Meta
        avatar={<Avatar>{user.nickname[0]}</Avatar>}
        title={user.nickname}
      />
      <Button onClick={onLogout}>로그아웃</Button>
    </Card> 
  )
}

export default UserProfile;
```

#### \front\pages\index.js
```js
import React, { useEffect } from 'react';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { useDispatch, useSelector } from 'react-redux';
import { LOG_IN } from '../reducers/user';


const Home = () => {
  const dispatch = useDispatch();
  const {isLoggedIn} = useSelector(state => state.user);
  const { mainPosts } = useSelector(state => state.post);
  
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
      {isLoggedIn && <PostForm /> }
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
export const initialState = {
  mainPosts: [{
    User: {
      id: 1,
      nickname: '제로초',
    },
    content: '첫 번째 게시글',
    img: 'https://img.freepik.com/free-photo/hooded-computer-hacker-stealing-information-with-laptop_155003-1918.jpg?size=664&ext=jpg',
  }],
  imagePaths: [],
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

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_POST: {
      return {
        ...state,
      };
    }
    case ADD_DUMMY: {
      return {
        ...state,
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
const dummyUser = {
  nickname: 'LEEKY',
  Post: [],
  Followings: [],
  Followers: [],
};

export const initialState = {
  isLoggedIn: false,
  user: null,
  signUpData: {},
  loginData: {},
};

export const SIGN_UP = 'SIGN_UP';
export const SIGN_UP_SUCCESS = 'SIGN_UP_SUCCESS';
export const LOG_IN = 'LOG_IN'; // 액션의 이름
export const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS'; // 액션의 이름
export const LOG_IN_FAILURE = 'LOG_IN_FAILURE'; // 액션의 이름
export const LOG_OUT = 'LOG_OUT';

export const signUpAction = (data) => {
  return {
    type: SIGN_UP,
    data,
  };
};

export const signUpSuccess = {
  type: SIGN_UP_SUCCESS,
};

export const loginAction = (data) => {
  return {
    type: LOG_IN,
    data,
  }
};
export const logoutAction = {
  type: LOG_OUT,
};
export const signUp = (data) => {
  return {
    type: SIGN_UP,
    data,
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOG_IN: {
      return {
        ...state,
        isLoggedIn: true,
        user: dummyUser,
        loginData: action.data,
      };
    }
    case LOG_OUT: {
      return {
        ...state,
        isLoggedIn: false,
        user: null,
      };
    }
    case SIGN_UP: {
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