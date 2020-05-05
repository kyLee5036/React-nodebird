# 서버 사이드 렌더링

+ [서버 사이드 렌더링 SRR](#서버-사이드-렌더링-SRR)
+ [SSR을 위해 쿠키 넣어주기](#SSR을-위해-쿠키-넣어주기)
+ [리덕스 사가 액션 로딩하기](#리덕스-사가-액션-로딩하기)
+ [SSR에서 내 정보 처리하기](#SSR에서-내-정보-처리하기)
+ [회원가입 리다이렉션과 포스트 제거](#회원가입-리다이렉션과-포스트-제거)
+ [페이지네이션](#페이지네이션)
+ [더보기 버튼](#더보기-버튼)
+ [인피니트 스크롤링](#인피니트-스크롤링)
+ [쓰로틀링(throttling)](#쓰로틀링(throttling))
+ [immer로 불변성 쉽게 쓰기](#immer로-불변성-쉽게-쓰기)
+ [프론트 단에서 리덕스 액션 호출 막기](#프론트-단에서-리덕스-액션-호출-막기)
+ [개별 포스트 불러오기](#개별-포스트-불러오기)
+ [reactHelmet으로 head 태그 조작하기](#reactHelmet으로-head-태그-조작하기)





## 서버 사이드 렌더링 SRR
[위로가기](#서버-사이드-렌더링)

Postman에서 localhost://3060을 하면 안에 내용물이 나오지가 않는다. <br>
서버 사이드 렌더링이 하지 않았기 때문에이다. <br>

getInitialProps가 서버 사이드 렌더링에 핵심이 된다. <br>
getInitialProps가 서버, 프론트쪽에 각각 한 번이 실행이된다. <br>
서버의 실행은 처음으로 페이지를 불러올 때 getInitialProps가 실행된다. <br>
프론트에서는 next/router로 페이지 넘나들 때 getInitialProps가 실행이된다. <br>

지금 비동기호출은 redux-saga로 실행하고 있다. <br>
그러므로, getInitialProps에서 dispatch를 해주면 된다. <br>
참고로) next를 안하면 구현하기가 까다로워진다. <br>

```js
Home.getInitialProps = async (context) => {
  console.log(Object.keys(context));
};
```
context의 내용물 : <br>
```js
[
  'err',   'req',
  'res',   'pathname',
  'query', 'asPath',
  'store', 'isServer'
]
```
store의 안에, redux의 store이다. <br>
store.dispatch, store.getState로 redux작업을 할 수가 있다. <br>

#### \front\pages\index.js
```js
...생략

// 이런식으로 하는 것인데, 하기 전에 설정을 한 개 더 해줘야한다.
Home.getInitialProps = async (context) => {
  console.log(Object.keys(context));
  context.store.dispatch({
    type: LOAD_MAIN_POSTS_REQUEST,
  });
};
```
<pre><code>npm i next-redux-saga</code></pre>
next서버에서 redux-saga를 할 수 있기때문에 서버 사이드 렌더링이 된다. <br>
그리고 _app.js에서 세팅을 해준다. <br>

#### \front\pages\_app.js
```js
...생략
import WithRedux from 'next-redux-wrapper';
import WithReduxSaga from 'next-redux-saga'; // 추가해주기
...생략

const NodeBird = ({ Component, store, pageProps }) => {
  ...생략
};

...생략

const configureStore = (initalState, options) => {
  ...생략

  const store = createStore(reducer, initalState, enhancer);
  store.sagaTask = sagaMiddleware.run(rootSaga); // 이 부분 추가하기
  // store의 sagaTask에다가 sagaMiddleware를 넣어줘야한다.

  sagaMiddleware.run(rootSaga); 
  return store;
}

export default WithRedux(configureStore)(WithReduxSaga(NodeBird)); // WithReduxSaga로 NodeBird를 감싸주기
```

새로고침을 하는 순간에 게시글이 먼저 불러와져있다. <br>

## SSR을 위해 쿠키 넣어주기
[위로가기](#서버-사이드-렌더링)

```js
...생략
// import { LOAD_USER_REQUEST } from '../reducers/user'; // 삭제


const AppLayout = ({ children }) => {
  const { me } = useSelector(state => state.user);
  const dispatch = useDispatch();

  // 이부분을 _app.js로 옮길 거다.
  // 삭제되었으므로 주석처리한다.
  // useEffect( () => {
  //   if (!me) {
  //     dispatch({
  //       type: LOAD_USER_REQUEST,
  //     });
  //   }
  // }, []);

  // 여기서 내 정보가 없을 때 ㅐ유저가 나오게해야한다.

  return (
    ....생략
  );
};

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AppLayout;
```

#### \front\pages\_app.js
```js
...생략
import WithRedux from 'next-redux-wrapper';
import WithReduxSaga from 'next-redux-saga';
import { createStore, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux'; 
import { LOAD_USER_REQUEST } from '../reducers/user'; // 추가
import createSagaMiddleware from 'redux-saga';

...생략

const NodeBird = ({ Component, store, pageProps }) => {
  return (
    ...생략
  );
};

...생략

NodeBird.getInitialProps = async (context) => {
  const { ctx, Component } = context;
  let pageProps = {};
  ctx.store.dispatch({
    type: LOAD_USER_REQUEST,
  });
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx); 
  }
  return { pageProps };
};

...생략
```

하지만, 내 정보가 없을 유저 정보를 불러와줘야한다. <br>

#### \front\pages\_app.js
```js
...생략
import WithRedux from 'next-redux-wrapper';
import WithReduxSaga from 'next-redux-saga';
import { createStore, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux'; 
import { LOAD_USER_REQUEST } from '../reducers/user'; // 추가
import createSagaMiddleware from 'redux-saga';

...생략

const NodeBird = ({ Component, store, pageProps }) => {
  return (
    ...생략
  );
};

...생략

NodeBird.getInitialProps = async (context) => {
  const { ctx, Component } = context;
  let pageProps = {};
  // 여기서 내 정보가 없을 때 ㅐ유저가 나오게해야한다.
  // 순서도 중요하다.
  const state = ctx.store.getState();
  if(!state.user.me) {
    ctx.store.dispatch({
      type: LOAD_USER_REQUEST,
    });
  }
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx); // 게시글들을 가져온다.
  }
  return { pageProps };
};

// LOAD_USER_REQUEST를 실행하고, 게시글들을 가져온다.

...생략
```

클라이언트에서 axiox의 요청을 보내면 브라우저가 쿠키를 같이 동봉해준다. <br>
서버 사이드 렌더링할 때, 브라우저가 없다. <br>
그러면 수동으로 우리가 직접 구현을 해줘야한다. <br>
withCredentials로 인해 쿠키를 직접넣어줘야한다. <br>

#### \front\pages\_app.js
```js
import { LOAD_USER_REQUEST } from '../reducers/user'; // 추가
import axios from 'axios'; // 추가

...생략

NodeBird.getInitialProps = async (context) => {
  const { ctx, Component } = context;
  let pageProps = {};
  const state = ctx.store.getState();
  // 쿠키를 직접구현 해준다.
  // 프론트 서버에서 우리가 직접  쿠키를 구현해서 넣어줘야한다.
  const cookie = ctx.isServer ? ctx.req.headers.cookie : ''; // 서버일 때랑 서버아닐 때도 명확하게 구분해야한다.
  // ctx안에는 req, res가 둘 다 있다.
  
  console.log('cookie', cookie);
  // 하지만 클라이언트에서는 브라우저가 알아서 쿠키를 넣어주니까 
  // 굳이 실행할 필요가 없어서
  // 서버 환경일 떄만 쿠키를 직접 넣어주게한다.
  if (ctx.isServer) {
    axios.defaults.headers.Cookie = cookie;
  }
  if(!state.user.me) {
    ctx.store.dispatch({
      type: LOAD_USER_REQUEST,
    });
  }
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }
  return { pageProps };
};

...생략
```

> 클라이언트 환경에서는 브라우저가 쿠키를 넣어주고, <br>
> 서버일 때는 우리가 직접 넣어줘야한다. <br>

마지막으로, 에러 수정 <br>
최종적으로 밑에 있는 것처럼 해줘야한다. <br>

#### \front\pages\_app.js
```js
...생략

NodeBird.getInitialProps = async (context) => {
  const { ctx, Component } = context;
  let pageProps = {};
  const state = ctx.store.getState();
  const cookie = ctx.isServer ? ctx.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (ctx.isServer && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  if(!state.user.me) {
    ctx.store.dispatch({
      type: LOAD_USER_REQUEST,
    });
  }
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }
  return { pageProps };
};
```

## 리덕스 사가 액션 로딩하기
[위로가기](#서버-사이드-렌더링)

#### \front\pages\hashtag.js
```js
...생략

const Hashtag = ({ tag }) => {
  const { mainPosts } = useSelector(state => state.post);

  // useEffect는 삭제
  // useEffect(() => {
  //   dispatch({
  //     type: LOAD_HASHTAG_POSTS_REQUEST,
  //     data: tag,
  //   });
  // }, []);

  return (
    <div>
      {mainPosts.map(c => (
        <PostCard key={+c.createdAt} post={c} />
      ))}
    </div>
  );
};

Hashtag.propTypes = {
  tag: PropTypes.string.isRequired,
};

Hashtag.getInitialProps = async (context) => {
  // 서버 사이드 렌더링을 적용하기 위해서 이하와 같이 적어준다.
  const tag = context.query.tag;
  context.sotre.dispatch({
    type: LOAD_HASHTAG_POSTS_REQUEST,
    data: tag,
  })
  return { tag };
};

export default Hashtag;
```

User.js도 SSR을 적용시키겠다.
#### \front\pages\user.js
```js
...생략

const User = ({ id }) => {
  // const dispatch = useDispatch(); // 삭제함
  const { mainPosts } = useSelector(state => state.post);
  const { userInfo } = useSelector(state => state.user);

  // 삭제
  // useEffect(() => {
  //   dispatch({
  //     type: LOAD_USER_REQUEST,
  //     data: id,
  //   });
  //   dispatch({
  //     type: LOAD_USER_POSTS_REQUEST,
  //     data: id,
  //   });
  // }, []);

  return (
    <div>
      {userInfo
        ? (
          <Card
            actions={[
              <div key="twit">
                짹짹
                <br />
                {userInfo.Posts}
              </div>,
              <div key="following">
                팔로잉
                <br />
                {userInfo.Followings}
              </div>,
              <div key="follower">
                팔로워
                <br />
                {userInfo.Followers}
              </div>,
            ]}
          >
            <Card.Meta
              avatar={<Avatar>{userInfo.nickname[0]}</Avatar>}
              title={userInfo.nickname}
            />
          </Card>
        )
        : null}
      <div>
        {mainPosts.map(c => (
          <PostCard key={+c.createdAt} post={c} />
        ))}
      </div>
    </div>
  );
};

User.propTypes = {
  id: PropTypes.number.isRequired,
};

User.getInitialProps = async (context) => {
  const id = parseInt(context.query.id, 10); // id를 불러온다.
  context.store.dispatch({ // dispatch를 시켜준다.
    type: LOAD_USER_REQUEST,
    data: id,
  });
  context.store.dispatch({ // dispatch를 시켜준다.
    type: LOAD_USER_POSTS_REQUEST,
    data: id,
  });
  return { id };
};

export default User;
```

로깅해주는 커스텀 로그 확인방법
#### \front\pages\_app.js
```js
...생략
const configureStore = (initalState, options) => {
  const sagaMiddleware = createSagaMiddleware();
  // 밑에 부분처럼 추가해주면 된다.
  // 로그 확인을 해준다.
  const middlewares = [sagaMiddleware, (store) => (next) => (action) => {
    console.log(action);
    next(action);
  }];


  const enhancer = process.env.NODE_ENV === 'production' 
  ? compose( 
    applyMiddleware(...middlewares))
  : compose(
    applyMiddleware(...middlewares), 
      !options.isServer && window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' ? window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f,
  );

  const store = createStore(reducer, initalState, enhancer);
  store.sagaTask = sagaMiddleware.run(rootSaga);
  sagaMiddleware.run(rootSaga); 
  return store;
}

...생략
```

> 이렇게 리덕스 사가 에러 찾아내는 방식을 기억해두는게 좋다
>> 커스텀 미들웨어

#### \back\routes\hashtag.js
```js
...생략

router.get('/:tag', async(req, res, next) => {
  try {
    const posts = await db.Post.findAll({
      include: [{
        model: db.Hashtag,
        // 한글, 특수문자를 하기 위해서 decodeURIComponent추가
        where: { name: decodeURIComponent(req.params.tag) },
      }, {
        model: db.User,
        attributes: ['id', 'nickname'],
      }, {
        model: db.Image,
      }, {
        model: db.User,
        through: 'Like',
        as: 'Likers',
        attributes: ['id'],
      }],
    });
    res.json(posts);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router;
```

#### \front\sagas\post.js
```js
...생략

function loadHashtagPostsAPI(tag) {
  // 한글, 특수문자를 하기 위해서 encodeURIComponent추가
  return axios.get(`/hashtag/${encodeURIComponent(tag)}`);
}

function* loadHashtagPosts(action) {
  try {
    const result = yield call(loadHashtagPostsAPI, action.data);
    yield put({
      type: LOAD_HASHTAG_POSTS_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LOAD_HASHTAG_POSTS_FAILURE,
      error: e,
    });
  }
}

function* watchLoadHashtagPosts() {
  yield takeLatest(LOAD_HASHTAG_POSTS_REQUEST, loadHashtagPosts);
}

...생략
```

## SSR에서 내 정보 처리하기
[위로가기](#서버-사이드-렌더링)

로그인 후에, 프로필 화면에 SSR을 적용시키겠다. <br>

#### \front\pages\profile.js
```js
import React, { useEffect, useCallback } from 'react';
import {Form, Input, Button, List, Card, Icon} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import NickNameEditForm from '../components/NickNameEditForm';
import { LOAD_FOLLOWERS_REQUEST, LOAD_FOLLOWINGS_REQUEST, UNFOLLOW_USER_REQUEST, REMOVE_FOLLOWER_REQUEST } from '../reducers/user';
import { LOAD_USER_POSTS_REQUEST } from '../reducers/post';
import PostCard from '../components/PostCard';

const Profile = () => {
  const dispatch = useDispatch();
  const { me, followingList, followerList } = useSelector(state => state.user);
  const { mainPosts } = useSelector(state => state.post);

  // useEffect 삭제
  // useEffect(() => {
  //   if (me) {
  //     dispatch({
  //       type: LOAD_FOLLOWERS_REQUEST,
  //       data: me.id,
  //     });
  //     dispatch({
  //       type: LOAD_FOLLOWINGS_REQUEST,
  //       data: me.id,
  //     });
  //     dispatch({
  //       type: LOAD_USER_POSTS_REQUEST,
  //       data: me.id,
  //     });
  //   }
  // }, [me && me.id]);

  const onUnfollow = useCallback(userId => () => {
    dispatch({
      type: UNFOLLOW_USER_REQUEST,
      data: userId,
    });
  }, []);

  const onRemoveFollower = useCallback(userId => () => {
    dispatch({
      type: REMOVE_FOLLOWER_REQUEST,
      data: userId,
    });
  }, []);

  return (
    ...생략
  );
};

// 프로필 SSR을 해주기 위해서 getInitialProps추가
Profile.getInitialProps = async ( context ) => {
  const state = context.store.getState(); // getState로 state를 불러온다.
  context.store.dispatch({
    type: LOAD_FOLLOWERS_REQUEST,
    data: state.user.me && state.user.me.id, 
    // 이전과 달리 여기에서는는
    // state에서 user를 찾고, user의 me.id를 찾는 방식이다
  });
  context.store.dispatch({
    type: LOAD_FOLLOWINGS_REQUEST,
    data: state.user.me && state.user.me.id,
    // 이전과 달리 여기에서는는
    // state에서 user를 찾고, user의 me.id를 찾는 방식이다
  });
  context.store.dispatch({
    type: LOAD_USER_POSTS_REQUEST,
    data: state.user.me && state.user.me.id,
    // 이전과 달리 여기에서는는
    // state에서 user를 찾고, user의 me.id를 찾는 방식이다
  });
}

export default Profile;
```

> 서버 사이드 렌더링을 하였는데, 프로필화면이 안 보인다. <br>

이 직전에 _app.js를 보면 LOAD_USERS_REQUEST가 시작한다. <br>
문제는 LOAD_USERS_REQUEST가 끝나야만, state.user.me가 생긴다. <br>

```js
Profile.getInitialProps = async ( context ) => {
  const state = context.store.getState();
  context.store.dispatch({
    type: LOAD_FOLLOWERS_REQUEST,
    // state.user.me가 생길려면 LOAD_USERS_REQUEST가 끝나야한다.
    data: state.user.me && state.user.me.id, 
  });
  context.store.dispatch({
    type: LOAD_FOLLOWINGS_REQUEST,
    data: state.user.me && state.user.me.id,
  });
  context.store.dispatch({
    type: LOAD_USER_POSTS_REQUEST,
    data: state.user.me && state.user.me.id,
  });

  // 즉, 이쯤에서 !!LOAD_USERS_SUCCESS!! 되어서 state.user.me가 생긴다.
 
 // 그러면 문제이다. state.user.me접근 못해서 
  // 나의 팔로잉, 게시글, 팔로워의 데이터를 가져오지를 못한다.

}
```
> 문제해결 하기 위해서 2가지 방법이 있다. <br>

### 첫 번째 방법: <br>
`LOAD_USERS_SUCCESS`가 끝난 후에, `LOAD_FOLLOWERS_REQUEST`, `LOAD_FOLLOWINGS_REQUEST`, `LOAD_USER_POSTS_REQUEST`을 해준다. <br>
하지만, 이 방법은 구현도 어렵고, 시간이 오래 걸린다. <br>

### 두 번째 방법: <br>
4개를 동시에 보내면서 정상적으로 동작하는 것이다. <br>
그래서 여기서 주목하는 특성이 `LOAD_USERS_SUCCESS`를 불러오기 전에 생각을 할 것이다. <br>
`LOAD_USERS_SUCCESS`을 호출 전에는 `state.user.me, state.user.me.id`가 <strong>Null</strong>이 되어져있다. <br>
즉, 데이터가 Null이면 내가 요청을 보냈다고 간주로 하면 된다. (Null 특성 활용하기) <br>


#### \front\sagas\post.js
```js
...생략

function loadUserPostsAPI(id = 0) { // null대신에 0을 넣어준다. 0은 기본값으로 간주한다.
  // 서버 쪽에서 id가 0이면 내정보로 간주한다.
  return axios.get(`/user/${id}/posts`);
}

function* loadUserPosts(action) {
  try {
    const result = yield call(loadUserPostsAPI, action.data);
    yield put({
      type: LOAD_USER_POSTS_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LOAD_USER_POSTS_FAILURE,
      error: e,
    });
  }
}

function* watchLoadUserPosts() {
  yield takeLatest(LOAD_USER_POSTS_REQUEST, loadUserPosts);
}

...생략
```

#### \front\sagas\user.js
```js
...생략

function loadFollowersAPI(userId = 0) { // null대신에 숫자 0을 넣어준다. 0은 기본값으로 간주한다.
  return axios.get(`/user/${userId}/followers`, {
    withCredentials: true,
  })
}

function* loadFollowers(action) {
  try {
    const result = yield call(loadFollowersAPI, action.data);
    yield put({
      type: LOAD_FOLLOWERS_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LOAD_FOLLOWERS_FAILURE,
      error: e,
    });
  }
}

function* watchLoadFollowers() {
  yield takeEvery(LOAD_FOLLOWERS_REQUEST, loadFollowers);
}

function loadFollowingsAPI(userId = 0) { // null대신에 숫자 0을 넣어준다.) 0은 기본값으로 간주한다.
  return axios.get(`/user/${userId}/followings`, {
    withCredentials: true,
  })
}

function* loadFollowings(action) {
  try {
    const result = yield call(loadFollowingsAPI, action.data);
    yield put({
      type: LOAD_FOLLOWINGS_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LOAD_FOLLOWINGS_FAILURE,
      error: e,
    });
  }
}

function* watchLoadFollowings() {
  yield takeEvery(LOAD_FOLLOWINGS_REQUEST, loadFollowings);
}

...생략
```

#### 
```js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models');
const passport = require('passport');
const { isLoggedIn } = require('./middlewares'); 

const router = express.Router();

...생략
...생략

router.get('/:id/followings', isLoggedIn, async (req, res, next) => {
  try {
    const user = await db.User.findOne({ 
      // 0이면 내 게시글로 간주한다.
      // 그리고, followings의 목록을 가져온다.
      where: { id: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0 },  // 기본 값은 0
    });
    const followings = await user.getFollowings({ 
      attributes: ['id', 'nickname'],
    });
    res.json(followings);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.get('/:id/followers', isLoggedIn, async (req, res, next) => {
  try {
    const user = await db.User.findOne({
      // 0이면 내 게시글로 간주한다.
      // 그리고, followers의 목록을 가져온다.
      where: { id: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0 },  // 기본 값은 0
    });
    const followers = await user.getFollowers({
      attributes: ['id', 'nickname'],
    });
    res.json(followers);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

...생략

router.get('/:id/posts', async (req, res, next) => {
  try {
    const posts = await db.Post.findAll({
      where: {
        // 0이면 내 게시글로 간주한다.
        UserId: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0, // 기본 값은 0
        RetweetId: null,
      },
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }, {
        model: db.Image,
      }, {
        model: db.User,
        through: 'Like',
        as: 'Likers',
        attributes: ['id'],
      }]
    });
    res.json(posts);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

...생략

module.exports = router; 

```
`req.params.id`가 `0`이면 `req.user && req.user.id`로 검색하는건 알겠다. <br>
하지만 왜 `(req.user && req.user.id)` 뒤에 `|| 0` 도 붙이는거지? <br>
user가 0이면 본인이 검색되는것 같은데 왜 그렇게 되는걸까? <br>
> `UserId: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0,`
>> req.params.id가 없으면 req.user && req.user.id가 검색된다. <br>
>> 만약에 req.user.id마저도 없으면 UserId: undefined가 된다. <br>
>> 시퀄라이즈에서는 where 절에 undefined가 들어가면 에러가 발생하기 때문에 <br>
>> 에러를 막기 위해 0을 넣었다. 0이 들어가는 경우는 아무것도 검색되지 않는다. <br><br><br>


> 자바스크립트 특성상 <br>
>> null일 경우는 기본 값이 적용이 안된다. <br>
>> undefined일 경우에만 기본 값이 적용이 된다. <br><br>

그러므로 코드 소스를 수정해야한다.

```js
function loadUserPostsAPI(id) { // 원래대로 되돌린다.
  return axios.get(`/user/${id || 0}/posts`); // 자바스크립트 특성상 이렇게 수정해준다.
}


function loadFollowersAPI(userId0) {
  return axios.get(`/user/${userId || 0}/followers`, { // 자바스크립트 특성상 이렇게 수정해준다.
    withCredentials: true,
  })
}
function loadFollowingsAPI(userId0) {
  return axios.get(`/user/${userId || 0}/followings`, { // 자바스크립트 특성상 이렇게 수정해준다.
    withCredentials: true,
  })
}
```

그러면 호출을 보면 <br>
```
GET /api/user/0/followings 200 298.716 ms - 297 
GET /api/user/0/posts 200 292.508 ms - 600
GET /api/user/0/posts 200 293.082 ms - 600
```
위와 같이 0으로 잘 나온다. <br>

`LOAD_USERS_REQUEST`가 완료되어야만 me가 생긴다. <br>
그러므로, 실제로 완료 되기 전에 다른 액션 3개를 호출시켜준다. <br>
그러면 다른 액션이 null이 되어있기때문에, null인 경우를 내 정보를 취급해줘서 데이터를 불러오고 해결해주었다. <br>

## 회원가입 리다이렉션과 포스트 제거
[위로가기](#서버-사이드-렌더링)

getInitialProps의 특성을 살려서, <br>
로그인을 했는데 URL에다가 /signup(회원가입) 접근하지 못하도록 처리해줄 것이다. <br>

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

  ...생략
  ...생략

  useEffect(() => {
    if(me) {
      alert('로그인했으니 메인페이지로 이동합니다.');
      router.push('/')
    }
  }, [me && me.id]); 

  // SSR을 해주면 항상 사용자 정보를 미리 데이터를 알아서 확실하게 처리할 수 있다.
  if (me) { // SSR로 인해 me라는게 확실이 있거나 없거나 알 수 있다.
    return null;
  }
  
  return (
    <>
      ...생략
    </>
  );
};

export default Signup;
```

서버 사이드 렌더링을 사용하면 개발할 때도 편하다. 상태를 미리 알 수 있기때문이다. <br><br>


프론트에서 게시글을 누르는 것은 서버 쪽으로 가지 않는다. <br>
대신 새로고침 눌렀 때 서버 사이드 렌더링이 동작을 한다. <br><br>

여기서부터는 게시글삭제를 해보겠다. <br>

#### \front\components\PostCard.js
```js
...생략

const PostCard = ({post}) => {
  ...생략

  const onRemovePost = useCallback(userId => () => {
    dispatch({
      type: REMOVE_POST_REQUEST,
      data: userId
    });
  }, []);

  return (
    <div>
      <Card
        // ...생략
        actions={[
          // ...생략
          <Icon type="message" key="message" onClick={onToggleComment} />,
          <Popover // 추가해준다
            key="ellipsis" // 추가해준다
            content={( // 추가해준다
              <Button.Group> // 추가해준다
                {me && post.UserId === me.id // 내 게시글인지 확인 해주기 위해서이다.
                  ? (
                    <>
                      <Button>수정</Button>
                      <Button type="danger" onClick={onRemovePost(post.id)}>삭제</Button>
                    </>
                  )
                  : <Button>신고</Button>}
              </Button.Group>
            )}
          >
            <Icon type="ellipsis" />,
          </Popover>
        ]}
        // ...생략
      >
        // ...생략
      </Card>
      ...생략
    </div>
  )
};

...생략

export default PostCard;


```

#### \front\sagas\post.js
```js
...생략
import { ADD_POST_TO_ME, REMOVE_POST_OF_ME } from '../reducers/user' // REMOVE_POST_OF_ME 추가

...생략


function removePostAPI(postId) {
  return axios.delete(`/post/${postId}` , {
    withCredentials: true,
  });
}

function* removePost(action) {
  try {
    const result = yield call(removePostAPI, action.data);
    yield put({
      type: REMOVE_POST_SUCCESS,
      data: result.data,
    });
    // 게시글 삭제하면 게시글 수 줄어들기 위해서 REMOVE_POST_OF_ME를 사용하였다.
    yield put({ 
      // user(reducer)에 있다.
      type: REMOVE_POST_OF_ME,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: REMOVE_POST_FAILURE,
      error: e,
    });
  }
}

function* watchRemovePost() {
  yield takeLatest(REMOVE_POST_REQUEST, removePost);
}

export default function* postSaga() {
  yield all([
    ...생략
    fork(watchRemovePost), // 추가
  ]);
}
```

#### \back\routes\post.js
```js
const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

...생략

router.delete('/:id', isLoggedIn, async (req, res, next) => {
  try {
    const post = await db.Post.findOne({ where: { id: req.params.id } });
    if (!post) {
      return res.status(404).send('포스트가 존재하지 않습니다.');
    }
    await db.Post.destory({ where: {id: req.params.id }}); // delete는 destory로 사용해서 삭제를 한다.
    res.send(req.params.id);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

...생략

module.exports = router;
```

여기서 reducers의 신경 써 줘야할 부분이 있다. <br>

#### \front\reducers\post.js
```js
...생략

export default (state = initialState, action) => {
  switch (action.type) {
    ...생략
    case REMOVE_POST_REQUEST: {
      return {
        ...state,
      };
    }
    case REMOVE_POST_SUCCESS: {
      return {
        ...state,
        // filter로 데이터를 걸러준다.
        mainPosts: state.mainPosts.filter(v => v.id !== action.data), 
      };
    }
    case REMOVE_POST_FAILURE: {
      return {
        ...state,
      };
    }
    default: {
      return {
        ...state,
      };
    }
  }
};

```

#### \front\reducers\user.js
```js
...생략

export const ADD_POST_TO_ME = 'ADD_POST_TO_ME';
export const REMOVE_POST_OF_ME = 'REMOVE_POST_OF_ME'; // 추가해주기

export default (state = initialState, action) => {
  switch (action.type) {
    ...생략
    case ADD_POST_TO_ME: {
      return {
        ...state,
        me : {
          ...state.me,
          Posts: [{ id: action.data}, ...state.me.Posts],
        },
      };
    }
    case REMOVE_POST_OF_ME: { // 위에 보면 추가할 때랑 지울 때랑 패턴이 있다.
      return {
        ...state,
        me: {
          ...state.me,
          Posts: state.me.Posts.filter(v => v.id !== action.dat),
        },
      };
    }
    ...생략
    default: {
      return {
        ...state,
      }
    }
  }
};
```
에러.. <br>
게시글 등록, 삭제하면 `ADD_POST_SUCCESS 와 ADD_POST_TO_ME` 2번씩 실행된다. <br>
#### \front\pages\_app.js
```js
...생략

const configureStore = (initalState, options) => {
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
  store.sagaTask = sagaMiddleware.run(rootSaga);
  // sagaMiddleware.run(rootSaga); // 위에 거랑 중복되어서 삭제를 해준다.
  return store;
}

...생략
```


## 페이지네이션
[위로가기](#서버-사이드-렌더링)

데이터를 조금 씩 조금 씩 불러오는 <strong>페이지네이션</strong>을 해보겠다. <br>
더보기 버튼을 불러오면 3개씩 불러오도록 해보겠다. <br>

#### 
```js
...생략;

const Profile = () => {
  ...생략
  
  const loadMoreFollowings = useCallback(() => {
    dispatch({
      type: LOAD_FOLLOWINGS_REQUEST,
    });
  }, [])
  
  const loadMoreFollowers = useCallback(() => {
    dispatch({
      type: LOAD_FOLLOWERS_REQUEST,
    });
  }, [])


  return (
    <div>
      <NickNameEditForm />
      <List
        style={{ marginBottom: '20px' }}
        ...생략
        loadMore={<Button style={{ width: '100%' }} onClick={loadMoreFollowings} >더 보기</Button>} // 추가
        ...생략
      />
      <List
        style={{ marginBottom: '20px' }}
        ...생략
        loadMore={<Button style={{ width: '100%' }} onClick={loadMoreFollowers} >더 보기</Button>} // 추가
       ...생략
      />
      ...생략
    </div>
  );
};

...생략

export default Profile;
```

페이지네이션을 구현해하는데, 데이터를 불러올 때부터 갯수를 지정해서 불러와야한다. <br>

조건 2가지가 있다 <br>
> 1. 게시글이 리스트가 10개 있다고 가정하자. <br>
> 2. 3개씩 게시글을 불러올것이다. <br>
일단, 여기서 나오는 단어가 limit, offest이 있다. <br>

### limit 설명
limit은 한 번에 불러오는 단위로서 limit은 3이 된다. ( 게시글 데이터를 3개 불러오기위해서 3이다. ) <br>
다음 것의 게시글 데이터도 불러오는 것도 limit은 3이 된다. <br><br>

### offset 설명
다음의 데이터를 불러오면 기존의 있던 3개를 건너뛰고 다음 것을 게시글 데이터을 불러오는게 offset이다. <br>

1번째 게시글 불러올 때 : limit 3 offest 0 <br>
2번째 게시글 불러올 때 : limit 3 offest 3 <br>
3번째 게시글 불러올 때 : limit 3 offest 6 <br>
마지막 게시글 불러올 때 : limit 3 offest 9 <br><br>

간단하게 용어를 설명하자면, <br>
offset은 건너 뛰기 ( 스킵이라고도 불린다.) <br>
limit은 한 번에 가져오는 갯수 <br><br>

saga에서 조금 수정을 해줘야한다. <br>

### 쿼리스트링
설명 : 주소 체계를 안 바꾸고, 서버로부터 offset, limit을 바꾸고싶으면 을 사용한다. <br>
쿼리스트링은 다른곳에서도 많이 사용한다. <br>

#### \front\sagas\user.js
```js
...생략

function loadFollowersAPI(userId, offset = 0, limit = 3) { // 기본 값 0으로 한다.
  // 주소 체계를 안 바꾸고, 서버로부터 offset, limit을 바꾸고싶으면 쿼리스트링을 사용한다.
  // 보충설명 : 기존 주소를 바꾸지 않고, 서버 쪽에 부과적인 데이터를 보낸다.
  // key, value로 구성. `offset=${offset}` 를 보면 전자가 key, 후자가 value이다.
  return axios.get(`/user/${userId || 0}/followers?offset=${offset}&limit=${limit}`, {
    withCredentials: true,
  })
}

function* loadFollowers(action) {
  try {
    const result = yield call(loadFollowersAPI, action.data);
    yield put({
      type: LOAD_FOLLOWERS_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LOAD_FOLLOWERS_FAILURE,
      error: e,
    });
  }
}

function* watchLoadFollowers() {
  yield takeEvery(LOAD_FOLLOWERS_REQUEST, loadFollowers);
}

function loadFollowingsAPI(userId, offset = 0, limit = 3) { // 기본 값 0으로 한다.
  // 주소 체계를 안 바꾸고, 서버로부터 offset, limit을 바꾸고싶으면 쿼리스트링을 사용한다.
  // 보충설명 : 기존 주소를 바꾸지 않고, 서버 쪽에 부과적인 데이터를 보낸다.
  // key, value로 구성. `offset=${offset}` 를 보면 전자가 key, 후자가 value이다.
  return axios.get(`/user/${userId || 0}/followings?offset=${offset}&limit=${limit}`, { 
    withCredentials: true,
  })
}

function* loadFollowings(action) {
  try {
    const result = yield call(loadFollowingsAPI, action.data);
    yield put({
      type: LOAD_FOLLOWINGS_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LOAD_FOLLOWINGS_FAILURE,
      error: e,
    });
  }
}

function* watchLoadFollowings() {
  yield takeEvery(LOAD_FOLLOWINGS_REQUEST, loadFollowings);
}

...생략

```

그 다음은 서버쪽에서 소스수정을 해야한다. <br>

#### \back\routes\user.js
```js
...생략

router.get('/:id/followings', isLoggedIn, async (req, res, next) => {
  try {
    const user = await db.User.findOne({ 
      where: { id: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0 }, 
    });
    const followings = await user.getFollowings({ 
      attributes: ['id', 'nickname'],
      limit: parseInt(req.query.limit, 10), // 추가
      offset: parseInt(req.query.offset, 10), // 추가
    });
    res.json(followings);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.get('/:id/followers', isLoggedIn, async (req, res, next) => {
  try {
    const user = await db.User.findOne({
      where: { id: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0 }, 
    });
    const followers = await user.getFollowers({
      attributes: ['id', 'nickname'],
      limit: parseInt(req.query.limit, 10), // 추가
      offset: parseInt(req.query.offset, 10), // 추가
    });
    res.json(followers);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

...생략
```

로그를 확인을 한다면 이하와 같이 출력이 된다. <br>
```
GET /api/user/0/followers?offset=0&limit=3 200 493.653 ms - 445
GET /api/user/0/followings?offset=0&limit=3 200 494.701 ms - 445
```
그리고, 화면을 보면 각각의 팔로잉, 팔로워 목록을 보면 데이터가 3개 나오는 것을 확인할 수가 있다. <br><br>

더보기를 눌렀을 때에도 화면 처리를해주기 위해서 profile.js를 수정한다. <br>
#### \front\pages\profile.js
```js
...생략 

const Profile = () => {
  ...생략 
  
  const loadMoreFollowings = useCallback(() => {
    dispatch({
      type: LOAD_FOLLOWINGS_REQUEST,
      // 기존의 데이터를 3개를 가져왔으니까, 다음 데이터 3개를 가져와야한다.
      // ofsset은 방금에서 말했듯이, ofsset이 스킵이라서 전에 있던 데이터를 생략하고 
      // 다음데이터 사용하기 위해 offse을 사용하였다.
      offset: followingList.length // 추가
    });
  }, [followingList.length]); // 추가
  
  const loadMoreFollowers = useCallback(() => {
    dispatch({
      type: LOAD_FOLLOWERS_REQUEST,
      // 기존의 데이터를 3개를 가져왔으니까, 다음 데이터 3개를 가져와야한다.
      // ofsset은 방금에서 말했듯이, ofsset이 스킵이라서 전에 있던 데이터를 생략하고 
      // 다음데이터 사용하기 위해 offse을 사용하였다.
      offset: followerList.length // 추가
    });
  }, [followerList.length]); // 추가

...생략 
```

화면에서 offset을 추가했으므로, saga에서도 offset에 대한 설정을 추가를 하겠다.
#### \front\sagas\user.js
```js
...생략

function loadFollowersAPI(userId, offset = 0, limit = 3) {
  return axios.get(`/user/${userId || 0}/followers?offset=${offset}&limit=${limit}`, {
    withCredentials: true,
  })
}

function* loadFollowers(action) {
  try {
    const result = yield call(loadFollowersAPI, action.data, action.offset);  // action.offset을 추가시켜준다.
    yield put({
      type: LOAD_FOLLOWERS_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LOAD_FOLLOWERS_FAILURE,
      error: e,
    });
  }
}

function* watchLoadFollowers() {
  yield takeEvery(LOAD_FOLLOWERS_REQUEST, loadFollowers);
}

function loadFollowingsAPI(userId, offset = 0, limit = 3) {
  return axios.get(`/user/${userId || 0}/followings?offset=${offset}&limit=${limit}`, { 
    withCredentials: true,
  })
}

function* loadFollowings(action) {
  try {
    const result = yield call(loadFollowingsAPI, action.data, action.offset); // action.offset을 추가시켜준다.
    yield put({
      type: LOAD_FOLLOWINGS_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LOAD_FOLLOWINGS_FAILURE,
      error: e,
    });
  }
}

function* watchLoadFollowings() {
  yield takeEvery(LOAD_FOLLOWINGS_REQUEST, loadFollowings);
}

...생략
```

아직 완성되지 않았기 때문에, 다음에 계속이어서 할 것이다. <br>
다음 데이터를 제대로 가져오지만, 기존의 데이터를 대체하는 현상이 나온다. <br>
그러므로 reducer에서도 수정을 해줘야한다.<br>

#### \front\reducers\user.js
```js
...생략

export default (state = initialState, action) => {
  switch (action.type) {
    ...생략
    case LOAD_FOLLOWERS_REQUEST: {
      return {
        ...state,
      };
    }
    case LOAD_FOLLOWERS_SUCCESS: {
      return {
        ...state,
        // followerList: action.data, 
        // 기존의 데이터를 대체하므로 concat으로 합쳐준다.
        followerList: state.followerList.concat(action.data),
      };
    }
    case LOAD_FOLLOWERS_FAILURE: {
      return {
        ...state,
      };
    }
    case LOAD_FOLLOWINGS_REQUEST: {
      return {
        ...state,
      };
    }
    case LOAD_FOLLOWINGS_SUCCESS: {
      return {
        ...state,
        // followingList: action.data, 
        // 기존의 데이터를 대체하므로 concat으로 합쳐준다.
        followingList: state.followingList.concat(action.data),
      };
    }
    case LOAD_FOLLOWINGS_FAILURE: {
      return {
        ...state,
      };
    }
    ...생략
  }
};
```

## 더보기 버튼
[위로가기](#서버-사이드-렌더링)

여기서 데이터가 다 보여주면, `더 보기` 버튼을 없애주고 싶다.
만약 3개씩 불러올 때, 데이터가 1개, 2개가 들어오면 
다음에 불러오는 데이터가 더 이상 없다는 의미이다.

#### \front\reducers\user.js
```js

export const initialState = {
  ...생략,
  editNicknameErrorResason: '',
  hasMoreFollower: false, // 추가를 해준다.
  hasMoreFollowing: false, // 추가를 해준다.
};

...생략

export default (state = initialState, action) => {
  switch (action.type) {
    ...생략
    case LOAD_FOLLOWERS_REQUEST: {
      return {
        ...state,
        hasMoreFollower: action.offset ? state.hasMoreFollower : true, // 처음 데이터를 가져올 때는 더보기 버튼을 true(보여주기)로 한다.
        // action.offset은 언제 넣어줬지 ? 
        // 데이터를 더 불러올 때 넣어줬다. 처음에는 action.offset이 없었는데, 데이터를 더 불러올 때 action.offset이 생긴다.
        // 그런 경우에는 hasMoreFollower를 유지한다.
        // 만약에, action.offset이 없을 경우에는 action.offset을 보여주도록 한다.

        // action.offset이 0이거나 없으면, ture가 된다. 즉, 처음데이터를 가져올 떄에는 더보기 버튼을 true를 한다.

        // hasMoreFollower에  state.hasMoreFollower를 넣으면 아무런 영향이 없다.

        // 처음에는 데이터를 불러오니까 데이터가 없다. 그리고 더보기 버튼이 있어야한다.
        // 그리고 더보기 버튼을 눌렀을 때 더보기 버튼이 있는지 없는지 판단하는것은 LOAD_FOLLOWERS_SUCCESS가 판단한다.
      };
    }
    case LOAD_FOLLOWERS_SUCCESS: {
      return {
        ...state,
        followerList: state.followerList.concat(action.data),
        hasMoreFollower: action.data.length === 3, 
        // 데이터를 가져왔느데, 데이터가 갯수가 1,2개 이면 더보기 버튼을 없애준다.
        // 하지만 데이터가 3개면 더보기 버튼을 보여준다.
      };
    }
    case LOAD_FOLLOWERS_FAILURE: {
      return {
        ...state,
      };
    }
    case LOAD_FOLLOWINGS_REQUEST: {
      return {
        ...state,
        hasMoreFollowing: action.offset ? state.hasMoreFollowing : true, // 처음 데이터를 가져올 때는 더보기 버튼을 true(보여주기)로 한다.
        // action.offset은 언제 넣어줬지 ? 
        // 데이터를 더 불러올 때 넣어줬다. 처음에는 action.offset이 없었는데, 데이터를 더 불러올 때 action.offset이 생긴다.
        // 그런 경우에는 hasMoreFollower를 유지한다.
        // 만약에, action.offset이 없을 경우에는 action.offset을 보여주도록 한다.

        // action.offset이 0이거나 없으면, ture가 된다. 즉, 처음데이터를 가져올 떄에는 더보기 버튼을 true를 한다.

        // hasMoreFollower에  state.hasMoreFollower를 넣으면 아무런 영향이 없다.

         // 처음에는 데이터를 불러오니까 데이터가 없다. 그리고 더보기 버튼이 있어야한다.
        // 그리고 더보기 버튼을 눌렀을 때 더보기 버튼이 있는지 없는지 판단하는것은 LOAD_FOLLOWERS_SUCCESS가 판단한다.
      };
    }
    case LOAD_FOLLOWINGS_SUCCESS: {
      return {
        ...state,
        followingList: state.followingList.concat(action.data),
        hasMoreFollowing: action.data.length === 3,
        // 데이터를 가져왔느데, 데이터가 갯수가 1,2개 이면 더보기 버튼을 없애준다.
        // 하지만 데이터가 3개면 더보기 버튼을 보여준다.
      };
    }
    case LOAD_FOLLOWINGS_FAILURE: {
      return {
        ...state,
      };
    }
    ...생략
  }
};
```


#### \front\pages\profile.js
```js
...생략

const Profile = () => {
  const dispatch = useDispatch();
  // hasMoreFollower, hasMoreFollowing추가
  const { followingList, followerList, hasMoreFollower, hasMoreFollowing } = useSelector(state => state.user); 
  const { mainPosts } = useSelector(state => state.post);

  ...생략
  
  const loadMoreFollowings = useCallback(() => {
    dispatch({
      type: LOAD_FOLLOWINGS_REQUEST,
      offset: followingList.length
    });
  }, [followingList.length]);
  
  const loadMoreFollowers = useCallback(() => {
    dispatch({
      type: LOAD_FOLLOWERS_REQUEST,
      offset: followerList.length
    });
  }, [followerList.length]);


  return (
    <div>
      <NickNameEditForm />
      <List
        ...생략
        header={<div>팔로잉 목록</div>}
        // hasMoreFollowing 추가
        loadMore={hasMoreFollowing && <Button style={{ width: '100%' }} onClick={loadMoreFollowings} >더 보기</Button>} // hasMoreFollowing 추가
        bordered
        dataSource={followingList}
        ...생략
      />
      <List
        ...생략
        header={<div>팔로워 목록</div>}
        // hasMoreFollower 추가
        loadMore={hasMoreFollower && <Button style={{ width: '100%' }} onClick={loadMoreFollowers} >더 보기</Button>} // hasMoreFollower 추가
        bordered
        dataSource={followerList}
        ...생략
      />
      ...생략
    </div>
  );
};

...생략

```

처음에 더보기 버튼을 true로 하고, <br>
데이터가 3개를 불러올 경우에는 true, <br>
그 이외에 1, 2개이면 false로 한다. <br><br>


처음부터 팔로워 목록이 3개 일 경우에다가 그 다음 데이터가 없다면, <br>
일단 지금의 소스코드 상에는 더보기 버튼이 있다. 그리고 더보기 버튼을 누르면 사라지게 한다. <br>

만약, 처음부터 데이터 3개라서 더보기 버튼을 없애려고 하려면 <br>
따로 소스 코드를에 데이터가 3개 일 경우 버튼을 없애는 것을 구현하면 된다. <br> 

### 보충설명
```js
case LOAD_FOLLOWINGS_REQUEST: {
  console.log(action.offset); // undefined
  return {
    ...state,
    hasMoreFollowing: action.offset ? state.hasMoreFollowing: true,
  }
}

```

> 위 코드에서 action.offset 이 0이거나 undefined 일텐데 어떻게 true가 될수있는지 이해가 안 된다. <br>
> 버튼눌렀을때말고 최초 페이지(새로고침)에 들어가서 <br>
> `Profile.getInitialProps` 를 통해 `LOAD_FOLLOWINGS_REQUEST`가 dispatch되면 <br> 
> loadFollowingsAPI에 <strong>offset=0 이라고 기본값을 지정</strong>해줬으니까 <br>
> <strong>맨처음 페이지로드 시 offset의 값은 0이 되지않나??</strong> <br>
> 그럼 hasMoreFollowing: action.offset ? state.hasMoreFollowing: true, <br>
> 이 코드가 실행될때 action.offset은 0이 될텐데 그럼 state.hasMoreFollowing: true 의 값이 못 들어가지않은가??? <br>

>> `조건부연산자(삼항연산자)는 조건 ? 참 : 거짓`이기 때문에 <br>
>> action.offset이 0이나 undefined면 -> <strong>거짓</strong> 부분으로 간다. <br>
>> 그래서 `hasMoreFollowing = true;`나 다름이 없다. <br>

-> 페이지네이션, 더보기 버튼 같이 구현을 해야한다. <br>

## 인피니트 스크롤링
[위로가기](#서버-사이드-렌더링)

인피니트 스크롤링는 더 보기 보다 더 복잡한 편이다. <br>
중요한 건, 스크롤을 감지해야한다. <br>

#### \front\pages\index.js
```js
...생략

const Home = () => {
  ...생략

  const onScroll = () => {
    console.log(window.scrollY, document.documentElement.clientHeight, document.documentElement.scrollHeight);
    // 위에 3개의 이벤트가 필수적이다.
  };

  useEffect( () => {
    // 컴포넌트가 첫 렌더링이 될 때 addlistener을 해줘야 한다.
    window.addEventListener('scroll', onScroll);
    // 컴포너튼도 사라질 때 removeListener 해줘야한다.
    return () => {
      window.removeEventListener('scroll', onScroll);
    }
  }, {});

  ...생략
};

...생략
```

```
window.scrollY, document.documentElement.clientHeight, document.documentElement.scrollHeight
0 599 5916
7 599 5916
71 599 5916
123 599 5916
...
...
5317 599 5916 
```
<strong>window.scrollY</strong> : 스크롤 내린 거리 <br>
<strong>document.documentElement.clientHeight</strong> : 화면 높이 <br>
<strong>document.documentElement.scrollHeight</strong> : 전체 화면 길이 <br>
맨 마지막을 보면 스크롤은 5317 599를 같이 더한게 5916이 된다. <br>
위와 같이 스크롤을 감지한다. <br><br>

우리는 끝에서 높이가 300이 남았을 때 데이터를 가져오도록 한다. <br>

#### \front\pages\index.js
```js
import React, { useEffect } from 'react';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { useSelector, useDispatch } from 'react-redux';
import { LOAD_MAIN_POSTS_REQUEST } from '../reducers/post';

const Home = () => {
  const { me } = useSelector(state => state.user);
  const { mainPosts } = useSelector(state => state.post);
  const dispatch = useDispatch();

  const onScroll = () => {
    console.log(window.scrollY, document.documentElement.clientHeight, document.documentElement.scrollHeight);
    // 끝까지 간거에서 -300을 해주었다.
    if (window.scrollY + document.documentElement.clientHeight === document.documentElement.scrollHeight - 300 ) { 
      dispatch({
        type: LOAD_MAIN_POSTS_REQUEST,
        lastId: mainPosts[mainPost.length - 1].id,
      });
    }
  };

  useEffect( () => {
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    }
  }, {});

  ...생략
};

...생략
```

지난 시간에는 offset, limit을 사용하였는데, 여기에는 offset대신에 다른 것을 사용한다. <br>
팔로잉, 팔로워은 보고있는 동안 안 바뀐다. <br>
하지만, 게시글은 보고있는 동안 다른사람이 게시글에 글을 올리면, 데이터가 게속 바뀌게 되어진다. <br>
그렇게 된다면, offset이 무너진다. <br>
그리고 요즘보면 offset보다 lastId 형식과 비슷하게 많이 사용한다. 왜냐하면 성능이 떨어지기 때문이다. <br><br>

읽는도중에 새로운 글이 추가되어지는 경우에는 <br>
마지막 게시글의 id를 가져와서 그 id보다 작은 것들을 limit을 한다. <br>
(그리고, limit는 바뀌는 경우가 없다. ) <br>
보충설명 : 게시글의 id는 바뀔경우가 절대로 없다는 것을 이용해서 한다. 또한, timestamp로 사용해도 된다. <br>

#### \front\pages\index.js
```js
import React, { useEffect } from 'react';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { useSelector, useDispatch } from 'react-redux';
import { LOAD_MAIN_POSTS_REQUEST } from '../reducers/post';

const Home = () => {
  const { me } = useSelector(state => state.user);
  const { mainPosts } = useSelector(state => state.post);
  const dispatch = useDispatch();

  const onScroll = () => {
    console.log(window.scrollY, document.documentElement.clientHeight, document.documentElement.scrollHeight);
    // onScroll에서 
    if (window.scrollY + document.documentElement.clientHeight === document.documentElement.scrollHeight - 300 ) { 
      dispatch({
        type: LOAD_MAIN_POSTS_REQUEST,
        lastId: mainPosts[mainPost.length - 1].id,
      });
    }
  };

  useEffect( () => {
    // 여기에 onScroll이 있다. useEffect를 사용하고 있다는 것이다.
    window.addEventListener('scroll', onScroll);
    return () => {
      // 여기에 onScroll이 있다. useEffect를 사용하고 있다는 것이다.
      window.removeEventListener('scroll', onScroll);
    }
  }, [mainPosts.length]); // 그래서 state를 사용하고 있다

  ...생략
};

...생략
```

#### \front\sagas\post.js
```js
...생략

function loadMainPostsAPI(lastId = 0, limit = 10) {
  return axios.get(`/posts?lastId=${lastId}&limit=${limit}`);
}

function* loadMainPosts(action) { // lastId를 가져와야한다.
  try {
    const result = yield call(loadMainPostsAPI, action.lastId);
    yield put({
      type: LOAD_MAIN_POSTS_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LOAD_MAIN_POSTS_FAILURE,
      error: e,
    });
  }
}

function* watchLoadMainPosts() {
  yield takeLatest(LOAD_MAIN_POSTS_REQUEST, loadMainPosts);
}


function loadHashtagPostsAPI(tag, lastId = 0) {
  return axios.get(`/hashtag/${encodeURIComponent(tag)}?lastId=${lastId}`);
}

function* loadHashtagPosts(action) {
  try {
    const result = yield call(loadHashtagPostsAPI, action.data, action.lastId);
    yield put({
      type: LOAD_HASHTAG_POSTS_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LOAD_HASHTAG_POSTS_FAILURE,
      error: e,
    });
  }
}

function* watchLoadHashtagPosts() {
  yield takeLatest(LOAD_HASHTAG_POSTS_REQUEST, loadHashtagPosts);
}


function loadUserPostsAPI(id, lastId = 0) {
  return axios.get(`/user/${id || 0}/posts?lastId=${lastId}`);
}

function* loadUserPosts(action) {
  try {
    const result = yield call(loadUserPostsAPI, action.data, action.lastId);
    yield put({
      type: LOAD_USER_POSTS_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LOAD_USER_POSTS_FAILURE,
      error: e,
    });
  }
}

function* watchLoadUserPosts() {
  yield takeLatest(LOAD_USER_POSTS_REQUEST, loadUserPosts);
}

...생략

```

#### \back\routes\posts.js
```js
const express = require('express');
const db = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => { 
  try {
    let where = {}; // lastId가 0일 때, 0이 아닐 때를 나누어야 한다. (조건이 2개)
    if (parseInt(req.query.lastId, 10)) {
      where = {
        id: { // id가 ~~보다 작다를 표현해줘야 한다.
          // db.Sequelize.Op.lt는 시퀄라이즈에서 사용하기때문에 sequelize operator를 찾아보면된다.
          // op안에 operator이다. 그리고 lt는 작다라는 의미이다.
          // lte: 작거나 같다, gt: 크다, gte: 크거나 같다
          [db.Sequelize.Op.lt]: parseInt(req.query.lastId, 10),
        },
      };
    } 
    // 처음부터 가져오는 경우(lastId가 0일 때) 조건이 없기 때문에 else를 안해주었다.
    const posts = await db.Post.findAll({
      where,
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }, {
        model: db.Image,
      }, {
        model: db.User,
        through: 'Like',
        as: 'Likers',
        attributes: ['id'],
      }, {
        model: db.Post, // 이 부분 추가 안해줘서 추가 해준다.
        as: 'Retweet', // 이 부분 추가 안해줘서 추가 해준다.
        include: [{ // 이 부분 추가 안해줘서 추가 해준다.
          model: db.User, // 이 부분 추가 안해줘서 추가 해준다.
          attributes: ['id', 'nickname'], // 이 부분 추가 안해줘서 추가 해준다.
        }, { // 이 부분 추가 안해줘서 추가 해준다.
          model: db.Image, // 이 부분 추가 안해줘서 추가 해준다.
        }], // 이 부분 추가 안해줘서 추가 해준다.
      }],
      order: [['createdAt', 'DESC']], 
      limit: parseInt(req.query.limit, 10), // limit을 추가해준다.
    });
    res.json(posts);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router;
```
db.Sequelize.Op.lt는 시퀄라이즈에서 사용하기때문에 sequelize operator를 찾아보면된다. <br>
op안에 operator가 있다. <br>
lt: 작다, lte: 작거나 같다, gt: 크다, gte: 크거나 같다 <br>

#### \back\routes\hashtag.js
```js
const express = require('express');
const db = require('../models');

const router = express.Router();

router.get('/:tag', async(req, res, next) => {
  try {
    let where = {};
    if (parseInt(req.query.lastId, 10)) {
      where = {
        id: {
          [db.Sequelize.Op.lt]: parseInt(req.query.lastId, 10),
        },
      };
    }
    const posts = await db.Post.findAll({
      where,
      include: [{
        model: db.Hashtag,
        where: { name: encodeURIComponent(req.params.tag) },
      }, {
        model: db.User,
        attributes: ['id', 'nickname'],
      }, {
        model: db.Image,
      }, {
        model: db.User,
        through: 'Like',
        as: 'Likers',
        attributes: ['id'],
      }, {
        model: db.Post,
        as: 'Retweet',
        include: [{
          model: db.User,
          attributes: ['id', 'nickname'],
        }, {
          model: db.Image,
        }],
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(req.query.limit, 10), // limit 추가
    });
    res.json(posts);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router;
```

#### \back\routes\user.js

```js
...생략

router.get('/:id/posts', async (req, res, next) => {
  try {
    const whereLastId = {}; // where이 겹치니까 whereLastId로 해주었다.
    if (parseInt(req.query.lastId, 10)) {
      whereLastId = { // where이 겹치니까 whereLastId로 해주었다.
        id: {
          [db.Sequelize.Op.lt]: parseInt(req.query.lastId, 10),
        },
      };
    }
    const posts = await db.Post.findAll({
      whereLastId, // where이 겹치니까 whereLastId로 해주었다.
      where: {
        UserId: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0,
        RetweetId: null,
      },
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }, {
        model: db.Image,
      }, {
        model: db.User,
        through: 'Like',
        as: 'Likers',
        attributes: ['id'],
      }, {
        model: db.Post,
        as: 'Retweet',
        include: [{
          model: db.User,
          attributes: ['id', 'nickname'],
        }, {
          model: db.Image,
        }],
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(req.query.limit, 10), // limit 추가
    });
    res.json(posts);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

...생략
```

여기까지 하고 스크롤링해서 맨 마지막가면 에러가 나온다. <br>
다음시간에 에러해결 하겠다. <br>

## 쓰로틀링(throttling)
[위로가기](#서버-사이드-렌더링)

#### \front\reducers\post.js
```js
...생략

export default (state = initialState, action) => {
  switch (action.type) {
    ...생략
    case LOAD_MAIN_POSTS_REQUEST:
    case LOAD_HASHTAG_POSTS_REQUEST:
    case LOAD_USER_POSTS_REQUEST: {
      return {
        ...state,
        // 없애는 경우도 필요하다. 왜냐하면 다른페이지 갔다가 다시 오기 위해서는 없애줘야한다.
        // 그래서 새로운 페이지에서 다시오면 기존 게시글들을 초기화해주고, 
        // action.lastId !== 0라면 state.mainPosts : 기존 글 유지한다.
        mainPosts: action.lastId === 0 ? [] : state.mainPosts,
      };
    }
    case LOAD_MAIN_POSTS_SUCCESS:
    case LOAD_HASHTAG_POSTS_SUCCESS:
    case LOAD_USER_POSTS_SUCCESS: {
      return {
        ...state,
        // 이전 게시글들과 같이 합쳐준다.
        mainPosts: state.mainPosts.concat(action.data),
      };
    }
    case LOAD_MAIN_POSTS_FAILURE:
    case LOAD_HASHTAG_POSTS_FAILURE:
    case LOAD_USER_POSTS_FAILURE: {
      return {
        ...state,
      };
    }
    ...생략
  }
};

```

에러...<br>
하지만, 또 에러가 있어서 에러해결을 해주겠다. <br>

#### \front\pages\index.js
```js
...생략

const Home = () => {
  ...생략

  const onScroll = () => {
    // = => > 로 변경
    if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) { 
      dispatch({
        type: LOAD_MAIN_POSTS_REQUEST,
        lastId: mainPosts[mainPosts.length - 1].id, // 철자 수정하였음
      });
    }
  };

  useEffect( () => {
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    }
  }, [mainPosts.length]);

  ...생략
};

...생략
```

해결이 되었고,
리덕스 사가를 보면 스코롤이 움직일 때마다 LOAD_MAIN_REQUEST, LOAD_MAIN_SUCCESS가 호출이 자꾸된다. 
이제부터는 데이터를 다 불러오면 호출안되록 하겠다.

#### \front\reducers\post.js
```js
...생략

export default (state = initialState, action) => {
  switch (action.type) {
    ...생략
    case LOAD_MAIN_POSTS_REQUEST:
    case LOAD_HASHTAG_POSTS_REQUEST:
    case LOAD_USER_POSTS_REQUEST: {
      return {
        ...state,
        mainPosts: action.lastId === 0 ? [] : state.mainPosts,

        // 처음 불러오는 것은 더보기 기능 활성화, 더 불러오고 있으면 스크롤 유지
        hasMorePost: action.lastId ? state.hasMorePost : true, // 더보기 할때랑 비슷하다.
      };
    }
    case LOAD_MAIN_POSTS_SUCCESS:
    case LOAD_HASHTAG_POSTS_SUCCESS:
    case LOAD_USER_POSTS_SUCCESS: {
      return {
        ...state,
        mainPosts: state.mainPosts.concat(action.data),

        // 스크롤을 활성할지 안 할지 결정하는 부분이다.
        hasMorePost: action.data.length === 10, // // 더보기 할때랑 비슷하다.
      };
    }
    case LOAD_MAIN_POSTS_FAILURE:
    case LOAD_HASHTAG_POSTS_FAILURE:
    case LOAD_USER_POSTS_FAILURE: {
      return {
        ...state,
      };
    }
    ...생략
  }
};

```

#### \front\pages\index.js
```js
...생략

const Home = () => {
  const { me } = useSelector(state => state.user);
  const { mainPosts, hasMorePost } = useSelector(state => state.post); // hasMorePost를 추가해준다.
  const dispatch = useDispatch();

  const onScroll = () => {
    if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
      if ( hasMorePost ) { // 수정
        dispatch({
          type: LOAD_MAIN_POSTS_REQUEST,
          lastId: mainPosts[mainPosts.length - 1].id,
        });
      }
    }
  };

  useEffect( () => {
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    }
  }, [mainPosts.length]);

  ...생략
};

...생략
```

이렇게 해주면, 데이터를 다 불러오면 요청을 다시 안한게 된다. <br>
하지만, 혹시나 예상치 않은 호출할 수도 있기때문에, <br>
사가에서 예상치 않은 호출들을 잡아주겠다. <br>
`takeLatest`이외에 `throttle`가 있다. <br><br>

### throttle
<strong>throttle</strong>의 역할은 <br>
> `yield throttle(1000, LOAD_MAIN_POSTS_REQUEST, loadMainPosts);`를 보면 <br>
> 첫번째 인수의 의해 1초 동안은 `LOAD_MAIN_POSTS_REQUEST` 같은 호출을 안해주도록 막아주는 것이다. <br>
>> 즉 `LOAD_MAIN_POSTS_REQUEST`가 연달아서(계속) 호출하는 것을 안해주도록 하는 것이다. <br>

#### \front\sagas\post.js
```js
function* watchLoadMainPosts() {
  yield takeLatest(LOAD_MAIN_POSTS_REQUEST, loadMainPosts); // throttle과 비교해보기
  // 연달아서 호출되는 것을 막아주는 것이다.
  yield throttle(1000, LOAD_MAIN_POSTS_REQUEST, loadMainPosts); // takeLatest과 비교해보기
}

```
혹시나 몰라서도 화면쪽 index.js에서도 useCallback을 사용해서 캐싱을 해주겠다. <br>
#### \front\pages\index.js
```js
...생략

const Home = () => {
  const { me } = useSelector(state => state.user);
  const { mainPosts, hasMorePost } = useSelector(state => state.post);
  const dispatch = useDispatch();

  const onScroll = useCallback(() => { // useCallback 적용시키기
    if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
      if ( hasMorePost ) {
        dispatch({
          type: LOAD_MAIN_POSTS_REQUEST,
          lastId: mainPosts[mainPosts.length - 1].id,
        });
      }
    }
  }, [hasMorePost, mainPosts.length]); // 배열안에다가 state을 넣어줘서 추가해주기

  useEffect( () => {
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    }
  }, [mainPosts.length]);

  ...생략
};

...생략
```

그래도, 가끔보면 `LOAD_MAIN_POSTS_REQUEST`가 2번씩 호출이 된다. <br>
위 문제는 나중에 최적화 시간에서 해결을 하겠다. <br><br><br>


Hashtag에도 인피니트 스크롤을 적용하겠다. <br>
#### \front\pages\hashtag.js
```js
...생략

const Hashtag = ({ tag }) => { // 2) 순서: 전달받은 tag를 여기에 다가 넣어두고
  const dispatch = useDispatch();
  const { mainPosts, hasMorePost} = useSelector(state => state.post);

  const onScroll = useCallback(() => {
    if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
      if ( hasMorePost ) {
        dispatch({
          type: LOAD_HASHTAG_POSTS_REQUEST,
          lastId: mainPosts[mainPosts.length - 1].id,
          data: tag, // 3) 순서:여기 데이터안에 해시태그를 넣어준다. 
          // 전체적으로 잘 보면 data: tag만 추가해주었다.
        });
      }
    }
  }, [hasMorePost, mainPosts.length]);

  useEffect( () => {
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    }
  }, [mainPosts.length]);

  return (
    ...생략
  );
};

...생략

Hashtag.getInitialProps = async (context) => {
  const tag = context.query.tag;
  context.store.dispatch({
    type: LOAD_HASHTAG_POSTS_REQUEST,
    data: tag,
  })
  return { tag }; // 1) 순서: 여기 tag의 정보를 전달해준다.
};

export default Hashtag;
```

해시태그랑 유저리스트목록보는거랑 방식이 비슷하기 때문에 나중에 알아서 하기! <br>
데이터 추가해주는 부분도 비슷하기 떄문이다. <br>

#### \front\sagas\post.js
```js
...생략

function loadHashtagPostsAPI(tag, lastId) {
  return axios.get(`/hashtag/${encodeURIComponent(tag)}?lastId=${lastId}&limit=10`);
}

function* loadHashtagPosts(action) {
  try {
    const result = yield call(loadHashtagPostsAPI, action.data, action.lastId);
    yield put({
      type: LOAD_HASHTAG_POSTS_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LOAD_HASHTAG_POSTS_FAILURE,
      error: e,
    });
  }
}

function* watchLoadHashtagPosts() {
  yield takeLatest(LOAD_HASHTAG_POSTS_REQUEST, loadHashtagPosts);
}

...생략

```

#### \front\reducers\post.js
```js
...생략
    case LOAD_MAIN_POSTS_REQUEST:
    case LOAD_HASHTAG_POSTS_REQUEST:
    case LOAD_USER_POSTS_REQUEST: {
      return {
        ...state,
        mainPosts: action.lastId === 0 ? [] : state.mainPosts,
        hasMorePost: action.lastId ? state.hasMorePost : true,
      };
    }
    case LOAD_MAIN_POSTS_SUCCESS:
    case LOAD_HASHTAG_POSTS_SUCCESS:
    case LOAD_USER_POSTS_SUCCESS: {
      return {
        ...state,
        mainPosts: state.mainPosts.concat(action.data),
        hasMorePost: action.data.length === 10,
      };
    }
    case LOAD_MAIN_POSTS_FAILURE:
    case LOAD_HASHTAG_POSTS_FAILURE:
    case LOAD_USER_POSTS_FAILURE: {
      return {
        ...state,
      };
    }
...생략
```


#### \back\routes\hashtag.js
```js
const express = require('express');
const db = require('../models');

const router = express.Router();

router.get('/:tag', async(req, res, next) => {
  try {
    let where = {};
    if (parseInt(req.query.lastId, 10)) {
      where = {
        id: {
          [db.Sequelize.Op.lt]: parseInt(req.query.lastId, 10),
        },
      };
    }
    const posts = await db.Post.findAll({
      where,
      include: [{
        model: db.Hashtag,
        where: { name: decodeURIComponent(req.params.tag) },
      }, {
        model: db.User,
        attributes: ['id', 'nickname'],
      }, {
        model: db.Image,
      }, {
        model: db.User,
        through: 'Like',
        as: 'Likers',
        attributes: ['id'],
      }, {
        model: db.Post,
        as: 'Retweet',
        include: [{
          model: db.User,
          attributes: ['id', 'nickname'],
        }, {
          model: db.Image,
        }],
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(req.query.limit, 10),
    });
    res.json(posts);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router;
```

해시태그쪽에 오류가 인피니트 스크롤하면 똑같은 데이터를 계속 불러와서 <br>
수정을 하겠다. <br>

#### \front\pages\hashtag.js
```js
...생략

  const onScroll = useCallback(() => {
    if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
      if (hasMorePost) {
        dispatch({
          type: LOAD_HASHTAG_POSTS_REQUEST,
          lastId: mainPosts[mainPosts.length - 1] && mainPosts[mainPosts.length - 1].id,
          data: tag,
        });
      }
    }
  }, [hasMorePost, mainPosts.length, tag]);

...생략
```

유저 아바타를 클릭하고 데이터를 받아온 다음 인피니티 스크롤도 지정해주었다. <br>
하지만, 해시태그와 같이 다른방식이다. <br>

#### \front\pages\user.js
```js
...생략

  const onScroll = useCallback(() => {
    if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
      if (hasMorePost) {
        dispatch({
          type: LOAD_USER_POSTS_REQUEST,
          lastId: mainPosts[mainPosts.length - 1] && mainPosts[mainPosts.length - 1].id,
          data: id,
        });
      }
    }
  }, [hasMorePost, mainPosts.length, id]);

...생략
```

#### \back\routes\user.js
```js
...생략

router.get('/:id/posts', async (req, res, next) => {
  try {
    let where = {}; // 여기에 where를 넣고
    if (parseInt(req.query.lastId, 10)) { // 인피니티 스크롤 할 경우
      where = {
        UserId: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0,
        id: {
          [db.Sequelize.Op.lt]: parseInt(req.query.lastId, 10),
        },
      };
    } else { // 인피니티 스크롤 아닌 경우
      where = {
        UserId: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0,
        RetweetId: null,
      }
    }
    const posts = await db.Post.findAll({
      where, // 2가지 경우를 작성해서 여기 where에 넣어둔다.
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }, {
        model: db.Image,
      }, {
        model: db.User,
        through: 'Like',
        as: 'Likers',
        attributes: ['id'],
      }, {
        model: db.Post,
        as: 'Retweet',
        include: [{
          model: db.User,
          attributes: ['id', 'nickname'],
        }, {
          model: db.Image,
        }],
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(req.query.limit, 10),
    });
    res.json(posts);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

...생략
```

## immer로 불변성 쉽게 쓰기
[위로가기](#서버-사이드-렌더링)

불변성을 지키기위해서는 가독성이 너무 떨어진다.
불변성을 유지하면서, 가독성을 개선해주는 라이브러리가 있다.
그것이 <strong>immer</strong>이다.
<pre><code>npm i immer</code></pre>

#### immer 초기 설정
```js
import produce from 'immer'; // immer를 추가해준다.

...생략

export default (state = initialState, action) => {
  return produce(state, (draft) => { // produce를 추가해준다.
      // 여기에서 state를 안 건드리고, draft를 건드리고 있다. 
    // immer에서 draft를 보고 어디에 바뀐지 체크하고, 바뀐 state를 불변성을 적용한다.
    switch (action.type) {
      // 여기에다가 코드를 작성하면 된다.

    }
  });
};

```

<br>
데이터 쪽에서 추가하는 부분이랑 제거하는 부분이 있는데 <br>

> 추가 : push, unshift를 사용 <br>
> 제거 : findIndex랑 splice 같이 사용 <br><br>


그 이외에는 <br>

> concat은 foreach로 사용하면 된다. <br>


#### \front\reducers\post.js (immer 적용 후) - 에러가 있어서 밑에 소스코드 참조할 것
```js
import produce from 'immer'; 

...생략

export default (state = initialState, action) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case UPLOAD_IMAGES_REQUEST: {
        /* immer 적용 전 */
        // return {
        //   ...state,
        // };

        /* immer 적용 후 */
        break;
      }
      case UPLOAD_IMAGES_SUCCESS: {
        /* immer 적용 전 */
        // return {
        //   ...state,
        //   imagePaths: [...state.imagePaths, ...action.data],
        // };

        /* immer 적용 후 */
        action.data.forEach((p) => {
          draft.imagePaths.push(p);
        });
        break;
      }
      case UPLOAD_IMAGES_FAILURE: {
        /* immer 적용 전 */
        // return {
        //   ...state,
        // };

        /* immer 적용 후 */
        break;
      }
      case REMOVE_IMAGE: {
        /* immer 적용 전 */
        // return {
        //   ...state,
        //   imagePaths: state.imagePaths.filter((v, i) => i !== action.index),
        // }

        /* immer 적용 후 */
        const index = draft.imagePaths.findIndex((v, i) => i === action.index);
        draft.imagePaths.splice(index, 1);
        break;
      }
      case ADD_POST_REQUEST: {
        /* immer 적용 전 */
        // return {
        //   ...state,
        //   isAddingPost: true,
        //   addPostErrorReason: '',
        //   postAdded: false,
        // };

        /* immer 적용 후 */
        draft.isAddingPost = true;
        draft.addPostErrorReason = '';
        draft.postAdded = false;
        break;
        
      }
      case ADD_POST_SUCCESS: {
        /* immer 적용 전 */
        // return {
        //   ...state,
        //   isAddingPost: false,
        //   mainPosts: [action.data, ...state.mainPosts],
        //   postAdded: true,
        //   imagePaths: [],
        // };

        /* immer 적용 후 */
        draft.isAddingPost = false;
        draft.mainPosts.unshift(action.data);
        draft.postAdded = true;
        draft.imagePaths = [];
        break;
      }
      case ADD_POST_FAILURE: {
        /* immer 적용 전 */
        // return {
        //   ...state,
        //   isAddingPost: false,
        //   addPostErrorReason: action.error,
        // };

        /* immer 적용 후 */
        draft.isAddingPost = false;
        draft.addPostErrorReason = action.error;
        break;
      }
      case ADD_COMMENT_REQUEST: {
        /* immer 적용 전 */                  
        // return {
        //   ...state,
        //   isAddingComment: true,
        //   addCommentErrorReason: '',
        //   commentAdded: false,
        // };

        /* immer 적용 후 */  
        draft.isAddingComment = true;
        draft.addCommentErrorReason = '';
        draft.commentAdded = false;
        break;                  
      }
      case ADD_COMMENT_SUCCESS: {
        /* immer 적용 전 */  
        // const postIndex = state.mainPosts.findIndex(v => v.id === action.data.postId);
        // const post = state.mainPosts[postIndex];
        // const Comments = [...post.Comments, action.data.comment];
        // const mainPosts = [...state.mainPosts];
        // mainPosts[postIndex] = { ...post, Comments };
        // return {
        //   ...state,
        //   isAddingComment: false,
        //   mainPosts,
        //   commentAdded: true,
        // };

        /* immer 적용 후 */ 
        const postIndex = draft.mainPosts.findIndex(v => v.id === action.data.postId);
        draft.mainPosts[postIndex].Comments.push(action.data.comment);
        draft.isAddingComment = false;
        draft.commentAdded = true;
        break;
      }
      case ADD_COMMENT_FAILURE: {
        /* immer 적용 전 */
        // return {
        //   ...state,
        //   isAddingComment: false,
        //   addCommentErrorReason: action.error,
        // };

        /* immer 적용 후 */
        draft.isAddingComment = false;
        draft.addCommentErrorReason = action.error;
        break;
      }
      case LOAD_COMMENTS_SUCCESS: {
        /* immer 적용 전 */        
        // const postIndex = state.mainPosts.findIndex(
        //   v => v.id === action.data.postId
        // );
        // const post = state.mainPosts[postIndex];
        // const Comments = action.data.comments;
        // const mainPosts = [...state.mainPosts];
        // mainPosts[postIndex] = { ...post, Comments };
        // return {
        //   ...state,
        //   mainPosts
        // };

        /* immer 적용 후 */
        const postIndex = draft.mainPosts.findIndex( v => v.id === action.data.postId);
        draft.mainPosts[postIndex].Comments = action.data.comments;
        break;
      }
      case LOAD_MAIN_POSTS_REQUEST:
      case LOAD_HASHTAG_POSTS_REQUEST:
      case LOAD_USER_POSTS_REQUEST: {
        /* immer 적용 전 */
        // return {
        //   ...state,
        //   mainPosts: action.lastId === 0 ? [] : state.mainPosts,
        //   hasMorePost: action.lastId ? state.hasMorePost : true,
        // };

        /* immer 적용 후 */
        draft.mainPosts = action.lastId === 0 ? [] : draft.mainPosts;
        draft.hasMorePost = action.lastId ? draft.hasMorePost : true;
        break;
      }
      case LOAD_MAIN_POSTS_SUCCESS:
      case LOAD_HASHTAG_POSTS_SUCCESS:
      case LOAD_USER_POSTS_SUCCESS: {
        /* immer 적용 전 */
        // return {
        //   ...state,
        //   mainPosts: state.mainPosts.concat(action.data),
        //   hasMorePost: action.data.length === 10,
        // };

        /* immer 적용 후 */
        draft.mainPosts = draft.mainPosts.concat(action.data);
        draft.hasMorePost = action.data.length === 10;
        break;
      }
      case LOAD_MAIN_POSTS_FAILURE:
      case LOAD_HASHTAG_POSTS_FAILURE:
      case LOAD_USER_POSTS_FAILURE: {
         /* immer 적용 전 */
        // return {
        //   ...state,
        // };

        /* immer 적용 후 */
        break;
      }
      case LIKE_POST_REQUEST: {
         /* immer 적용 전 */
        // return {
        //   ...state,
        // };

        /* immer 적용 후 */
        break;
      }
      case LIKE_POST_SUCCESS: {
        /* immer 적용 전 */
        // const postIndex = state.mainPosts.findIndex(
        //   v => v.id === action.data.postId
        // );
        // const post = state.mainPosts[postIndex];
        // const Likers = [{ id: action.data.userId}, ...post.Likers]; 
        // const mainPosts = [...state.mainPosts];
        // mainPosts[postIndex] = { ...post, Likers };
        // return {
        //   ...state,
        //   mainPosts,
        // };

        /* immer 적용 후 */
        const postIndex = draft.mainPosts.findIndex( v => v.id === action.data.postId);
        draft.mainPosts[postIndex].Likers.unshift({ id: action.data.userId });
        break;
      }
      case LIKE_POST_FAILURE: {
         /* immer 적용 전 */
        // return {
        //   ...state,
        // };

        /* immer 적용 후 */
        break;
      }
      case UNLIKE_POST_REQUEST: {
         /* immer 적용 전 */
        // return {
        //   ...state,
        // };

        /* immer 적용 후 */
        break;
      }
      case UNLIKE_POST_SUCCESS: {
        /* immer 적용 전 */
        // const postIndex = state.mainPosts.findIndex(v => v.id === action.data.postId);
        // const post = state.mainPosts[postIndex];
        // const Likers = post.Likers.filter(v => v.id !== action.data.userId);
        // const mainPosts = [...state.mainPosts];
        // mainPosts[postIndex] = { ...post, Likers };
        // return {
        //   ...state,
        //   mainPosts,
        // };

        /* immer 적용 후 */
        const postIndex = draft.mainPosts.findIndex( v => v.id === action.data.postId);
        const likeIndex = draft.mainPosts[postIndex].Likers.findIndex(v => v.id === action.data.userId);
        draft.mainPosts[postIndex].Likers.splice(likeIndex, 1);
        break;
      }
      case UNLIKE_POST_FAILURE: {
         /* immer 적용 전 */
        // return {
        //   ...state,
        // };

        /* immer 적용 후 */
        break;
      }
      case RETWEET_REQUEST: {
         /* immer 적용 전 */
        // return {
        //   ...state,
        // };

        /* immer 적용 후 */
        break;
      }
      case RETWEET_SUCCESS: {
        /* immer 적용 전 */
        // return {
        //   ...state,
        //   mainPosts: [action.data, ...state.mainPosts],
        // };

        /* immer 적용 후 */
        draft.mainPosts.unshift(action.data);
        break;
      }
      case RETWEET_FAILURE: {
         /* immer 적용 전 */
        // return {
        //   ...state,
        // };

        /* immer 적용 후 */
        break;
      }
      case REMOVE_POST_REQUEST: {
         /* immer 적용 전 */
        // return {
        //   ...state,
        // };

        /* immer 적용 후 */
        break;
      }
      case REMOVE_POST_SUCCESS: {
        /* immer 적용 전 */
        // return {
        //   ...state,
        //   mainPosts: state.mainPosts.filter(v => v.id !== action.data),
        // };

        /* immer 적용 후 */
        draft.mainPosts = draft.mainPosts.filter(v => v.id !== action.data);
        break;
      }
      case REMOVE_POST_FAILURE: {
         /* immer 적용 전 */
        // return {
        //   ...state,
        // };

        /* immer 적용 후 */
        break;
      }
      default: {
         /* immer 적용 전 */
        // return {
        //   ...state,
        // };

        /* immer 적용 후 */
        break;
      }
    }
  });
};

```

#### \front\reducers\post.js (적용 후)
```js
...생략

export default (state = initialState, action) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case LOG_IN_REQUEST: {
        // return {
        //   ...state,
        //   isLoggingIn: true,
        // };

        draft.isLoggingIn = true;
        draft.logInErrorReason = '';
        break;
      }
      case LOG_IN_SUCCESS: {
        // return {
        //   ...state,
        //   isLoggingIn: false,
        //   isLoading : false,
        //   me: action.data,
        // };

        draft.isLoggingIn = false;
        draft.logInErrorReason = '';
        draft.me = action.data;
        break;
      }
      case LOG_IN_FAILURE: {
        // return {
        //   ...state,
        //   isLoggingIn: false,
        //   logInErrorReason : action.error,
        //   me: null,
        // };

        draft.isLoggingIn = false;
        draft.logInErrorReason = action.reason;
        draft.me = null;
        break;
      }
  
      case LOG_OUT_REQUEST: {
        // return {
        //   ...state,
        //   isLoggingOut: true,
        // };

        draft.isLoggingOut = true;
        break;
      }
      case LOG_OUT_SUCCESS: {
        // return {
        //   ...state,
        //   isLoggingOut: false,
        //   me: null
        // };

        draft.isLoggingOut = false;
        draft.me = null;
        break;
      }
      case LOG_OUT_FAILURE: {
        // return {
        //   ...state,
        //   isLoggingOut: false,
        // };

        draft.isLoggingOut = false;
        draft.me = null;
        break;
      }
  
      case SIGN_UP_REQUEST: { 
        // return { 
        //   ...state, 
        //   isSigningUp: true,
        //   isSignedUp: false,
        //   signUpErrorReason: '',
        //   isSignUpSuccesFailure: false,
        // }; 

        draft.isSignedUp = false;
        draft.isSigningUp = true;
        draft.signUpErrorReason = '';
        draft.isSignUpSuccesFailure = false;
        break;
      }
      case SIGN_UP_SUCCESS: { 
        // return { 
        //   ...state, 
        //   isSigningUp: false,
        //   isSignedUp: true, 
        //   isSignUpSuccesFailure: false,
        // }; 

        draft.isSigningUp = false;
        draft.isSignedUp = true;
        draft.isSignUpSuccesFailure = false;
        break;
      }
      case SIGN_UP_FAILURE: { 
        // return { 
        //   ...state, 
        //   isSigningUp : false,
        //   signUpErrorReason : action.error, 
        //   isSignUpSuccesFailure: true,
        // }; 

        draft.isSigningUp = false;
        draft.signUpErrorReason = action.error;
        draft.isSignUpSuccesFailure = true;
        break;

      }
      
      case LOAD_USER_REQUEST: { 
        // return { 
        //   ...state, 
        // };
        
        break;
      }
      case LOAD_USER_SUCCESS: { 
        // if (action.me) {
        //   return { 
        //     ...state, 
        //     me : action.data, 
        //   }; 
        // }
        // return {
        //   ...state,
        //   userInfo: action.data
        // }

        if (action.me) {
          draft.me = action.data;
          break;
        }
        draft.useInfo = action.data;
        break;
      }
      case LOAD_USER_FAILURE: { 
        // return { 
        //   ...state, 
        // };
        
        break;
      } 
       case FOLLOW_USER_REQUEST: {
        // return {
        //   ...state,
        // };

        break;
      }
      case FOLLOW_USER_SUCCESS: {
        /* immer 적용 전 */
        // return {
        //   ...state,
        //   me: {
        //     ...state.me,
        //     Followings: [{ id: action.data }, ...state.me.Followings],
        //   },
        // };

        /* immer 적용 후 */
        draft.me.Followings.unshift({ id: action.data });
        break;
      }
      case FOLLOW_USER_FAILURE: {
        // return {
        //   ...state,
        // };

        break;
      }
      case UNFOLLOW_USER_REQUEST: {
        // return {
        //   ...state,
        // };

        break;
      }
      case UNFOLLOW_USER_SUCCESS: {
        // return {
        //   ...state,
        //   me: {
        //     ...state.me,
        //     Followings: state.me.Followings.filter(v => v.id !== action.data),
        //   },
        //   followingList: state.followingList.filter(v => v.id !== action.data),
        // };

        const index = draft.me.Followings.findIndex(v => v.id === action.data);
        draft.me.Followings.splice(index, 1);
        const index2 = draft.followingList.findIndex(v => v.id === action.data);
        draft.followingList.splice(index2, 1);
        break;
      }
      case UNFOLLOW_USER_FAILURE: {
        // return {
        //   ...state,
        // };

        break;
      }
      case ADD_POST_TO_ME: {
        // return {
        //   ...state,
        //   me : {
        //     ...state.me,
        //     Posts: [{ id: action.data}, ...state.me.Posts],
        //   },
        // };

        draft.me.Posts.unshift({ id: action.data });
        break;
      }
      case REMOVE_POST_OF_ME: {
        // return {
        //   ...state,
        //   me: {
        //     ...state.me,
        //     Posts: state.me.Posts.filter(v => v.id !== action.data),
        //   },
        // };

        const index = draft.me.Posts.findIndex(v => v.id === action.data);
        draft.me.Posts.splice(index, 1);
        break;
      }
      case LOAD_FOLLOWERS_REQUEST: {
        // return {
        //   ...state,
        //   hasMoreFollower: action.offset ? state.hasMoreFollower : true,
        // };

        draft.followerList = !action.offset ? [] : draft.followerList;
        draft.hasMoreFollower = action.offset ? draft.hasMoreFollower : true;
        break;
      }
      case LOAD_FOLLOWERS_SUCCESS: {
        // return {
        //   ...state,
        //   followerList: state.followerList.concat(action.data),
        //   hasMoreFollower: action.data.length === 3, 
        // };

        action.data.forEach((d) => {
          draft.followerList.push(d);
        });
        draft.hasMoreFollower = action.data.length === 3;
        break;
      }
      case LOAD_FOLLOWERS_FAILURE: {
        // return {
        //   ...state,
        // };

        break;
      }
      case LOAD_FOLLOWINGS_REQUEST: {
        // return {
        //   ...state,
        //   hasMoreFollowing: action.offset ? state.hasMoreFollowing : true,
        // };

        draft.followingList = !action.offset ? [] : draft.followingList;
        draft.hasMoreFollowing = action.offset ? draft.hasMoreFollowing : true;
        break;
      }
      case LOAD_FOLLOWINGS_SUCCESS: {
        // return {
        //   ...state,
        //   followingList: state.followingList.concat(action.data),
        //   hasMoreFollowing: action.data.length === 3,
        // };

        action.data.forEach((d) => {
          draft.followingList.push(d);
        });
        draft.hasMoreFollowing = action.data.length === 3;
        break;
      }
      case LOAD_FOLLOWINGS_FAILURE: {
        // return {
        //   ...state,
        // };

        break;
      }
      case REMOVE_FOLLOWER_REQUEST: {
        // return {
        //   ...state,
        // };

        break;
      }
      case REMOVE_FOLLOWER_SUCCESS: {
        // return {
        //   ...state,
        //   me: {
        //     ...state.me,
        //     Followers: state.me.Followers.filter(v => v.id !== action.data),
        //   },
        //   followerList: state.followerList.filter(v => v.id !== action.data),
        // };

        const index = draft.me.Followers.findIndex(v => v.id === action.data);
        draft.me.Followers.splice(index, 1);
        const index2 = draft.followerList.findIndex(v => v.id === action.data);
        draft.followerList.splice(index2, 1);
        break;
      }
      case REMOVE_FOLLOWER_FAILURE: {
        // return {
        //   ...state,
        // };

        break;
      }
      case EDIT_NICKNAME_REQUEST: {
        // return {
        //   ...state,
        //   isEditingNickname: true,
        //   editNicknameErrorResason: '',
        // };

        draft.isEditingNickname = true;
        draft.editNicknameErrorReason = '';
        break;
      }
      case EDIT_NICKNAME_SUCCESS: {
        // return {
        //   ...state,
        //   isEditingNickname: false,
        //   me: {
        //     ...state.me,
        //     nickname: action.data,
        //   },
        // };

        draft.isEditingNickname = false;
        draft.me.nickname = action.data;
        break;
      }
      case EDIT_NICKNAME_FAILURE: {
        // return {
        //   ...state,
        //   isEditingNickname: false,
        //   editNicknameErrorResason: action.error,
        // };

        draft.isEditingNickname = false;
        draft.editNicknameErrorReason = action.error;
        break;
      }
      default: {
        break;
      }
    }
  })
};

...생략
```

에러가 있어서 수정이 있겠다. <br>

#### \front\reducers\post.js
```js
...수정

export default (state = initialState, action) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case UPLOAD_IMAGES_REQUEST: {
        break;
      }
      case UPLOAD_IMAGES_SUCCESS: {
        action.data.forEach((p) => {
          draft.imagePaths.push(p);
        });
        break;
      }
      case UPLOAD_IMAGES_FAILURE: {
        break;
      }
      case REMOVE_IMAGE: {
        const index = draft.imagePaths.findIndex((v, i) => i === action.index);
        draft.imagePaths.splice(index, 1);
        break;
      }
      case ADD_POST_REQUEST: {
        draft.isAddingPost = true;
        draft.addingPostErrorReason = '';
        draft.postAdded = false;
        break;
      }
      case ADD_POST_SUCCESS: {
        draft.isAddingPost = false;
        draft.mainPosts.unshift(action.data);
        draft.postAdded = true;
        draft.imagePaths = [];
        break;
      }
      case ADD_POST_FAILURE: {
        draft.isAddingPost = false;
        draft.addPostErrorReason = action.error;
        break;
      }
      case ADD_COMMENT_REQUEST: {
        draft.isAddingComment = true;
        draft.addCommentErrorReason = '';
        draft.commentAdded = false;
        break;
      }
      case ADD_COMMENT_SUCCESS: {
        const postIndex = draft.mainPosts.findIndex(v => v.id === action.data.postId);
        draft.mainPosts[postIndex].Comments.push(action.data.comment);
        draft.isAddingComment = false;
        draft.commentAdded = true;
        break;
      }
      case ADD_COMMENT_FAILURE: {
        draft.isAddingComment = false;
        draft.addingPostErrorReason = action.error;
        break;
      }
      case LOAD_COMMENTS_SUCCESS: {
        const postIndex = draft.mainPosts.findIndex(v => v.id === action.data.postId);
        draft.mainPosts[postIndex].Comments = action.data.comments;
        break;
      }
      case LOAD_MAIN_POSTS_REQUEST:
      case LOAD_HASHTAG_POSTS_REQUEST:
      case LOAD_USER_POSTS_REQUEST: {
        draft.mainPosts = !action.lastId ? [] : draft.mainPosts;
        draft.hasMorePost = action.lastId ? draft.hasMorePost : true;
        break;
      }
      case LOAD_MAIN_POSTS_SUCCESS:
      case LOAD_HASHTAG_POSTS_SUCCESS:
      case LOAD_USER_POSTS_SUCCESS: {
        action.data.forEach((d) => {
          draft.mainPosts.push(d);
        });
        draft.hasMorePost = action.data.length === 10;
        break;
      }
      case LOAD_MAIN_POSTS_FAILURE:
      case LOAD_HASHTAG_POSTS_FAILURE:
      case LOAD_USER_POSTS_FAILURE: {
        break;
      }
      case LIKE_POST_REQUEST: {
        break;
      }
      case LIKE_POST_SUCCESS: {
        const postIndex = draft.mainPosts.findIndex(v => v.id === action.data.postId);
        draft.mainPosts[postIndex].Likers.unshift({ id: action.data.userId });
        break;
      }
      case LIKE_POST_FAILURE: {
        break;
      }
      case UNLIKE_POST_REQUEST: {
        break;
      }
      case UNLIKE_POST_SUCCESS: {
        const postIndex = draft.mainPosts.findIndex(v => v.id === action.data.postId);
        const likeIndex = draft.mainPosts[postIndex].Likers.findIndex(v => v.id === action.data.userId);
        draft.mainPosts[postIndex].Likers.splice(likeIndex, 1);
        break;
      }
      case UNLIKE_POST_FAILURE: {
        break;
      }
      case RETWEET_REQUEST: {
        break;
      }
      case RETWEET_SUCCESS: {
        draft.mainPosts.unshift(action.data);
        break;
      }
      case RETWEET_FAILURE: {
        break;
      }
      case REMOVE_POST_REQUEST: {
        break;
      }
      case REMOVE_POST_SUCCESS: {
        const index = draft.mainPosts.findIndex(v => v.id === action.data);
        draft.mainPosts.splice(index, 1);
        break;
      }
      case REMOVE_POST_FAILURE: {
        break;
      }
      default: {
        break;
      }
    }
  });
};

```

## 프론트 단에서 리덕스 액션 호출 막기
[위로가기](#서버-사이드-렌더링)

한참 지난 시간에서, <strong>쓰로틀링(throttling)</strong>을 적용 하였는데, `REQUEST 요청`가 왜 많이 생기는냐? <br>
리액트에서 REQUEST 실행되는 것은 막을 수가 없다. <br>

#### #### \front\pages\index.js
```js
const onScroll = useCallback(() => {
  if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
    if ( hasMorePost ) {
      dispatch({
        // 리덕스 상에서는 REQUEST를 호출되는 거 막아줄 수 있는 코드가 없다.
        type: LOAD_MAIN_POSTS_REQUEST, 
        // 지금까지 리덕스 사가에서 REQUEST가 여러 번 호출되는 것을 막았다. (쓰로틀링(throttling) 사용)
        lastId: mainPosts[mainPosts.length - 1].id,
      });
    }
  }
}, [hasMorePost, mainPosts.length]);
```

> 즉, 사가랑 리듀서 액션은 별개로 동작하기 때문에 별도 처리가 필요하다. <br><br>

 
결국에 우리의 문제는 2초에 요청을 1번씩 가도록 하였는데, 실제로 요청이 2번 가는 문제가 있다. <br>
그래서 프론트 단에서 수정을 해야한다. <br>
즉, 사가뿐만 아니라 프론트에서도 <strong>쓰로틀링(throttling)</strong>을 적용할 것이다. <br>

#### \front\pages\index.js
```js
import React, { useEffect, useCallback, useRef } from 'react'; // useRef 생성
...생략

const Home = () => {
  ...생략
  // 지난 시간 쓰로틀링(throttling)에서 lastId로 마지막 게시글을 서버로 보냈다.
  // lastId를 서버에서 뿐만 아니라 프론트에서도 기록해두면 같은 lastId로 요청을 보내는 것을 막을 수가 있다.
  // 지금부터 lastId로 요청을 막는 코드 소스를 구현할 것이다.

  const countRef = useRef([]); // 빈 배열 생성해준다.

  const onScroll = useCallback(() => {
    if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
      if ( hasMorePost ) {
        const lastId = mainPosts[mainPosts.length - 1].id; // lastId를 변수로 만들어준다.
        if ( !countRef.current.includes(lastId)) { // 한 번 보낸 lastId는 다시 보내지 않게 한다. (안전 장치 마련)
          dispatch({
            type: LOAD_MAIN_POSTS_REQUEST,
            lastId,
          });
          countRef.current.push(lastId); // countRef.current에다가 기록을 해둔다.
        }
       
      }
    }
  }, [hasMorePost, mainPosts.length]);

...생략
```

> 위와 같은 방식으로 한다면, <br>
>> 한 번 요청을 보낸 lastId들이 countRef에 담겨있기 때문에 <br>
>> 다음에 다시 요청을 보낼 때 서버에 안가도록 한다. <br>

```js
function* watchLoadMainPosts() {
  yield throttle(1000, LOAD_MAIN_POSTS_REQUEST, loadMainPosts);
}
```
> 사가에서 throttle을 하는 것은 <strong>사가에 대한 액션</strong>만 `throttle`한다. <br>
> 리덕스 자체 액션이 실행 되는것은 막을 수 없다. <br>
>> 리덕스 자체 액션이 실행 되지 않을려면 <strong>리덕스 액션을 실행하는 프론트에서 못하도록 걸러줘서 만들어줘야한다</strong>. <br>


## 개별 포스트 불러오기
[위로가기](#서버-사이드-렌더링)

개별 포스트를 불러오는 것을 만들어보겠다. ( 게시글을 하나만 불러오는 것이다. ) <br>

#### \front\pages\post.js
```js
import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { LOAD_POST_REQUEST } from '../reducers/post';

const Post = ({  }) => {
  const { post } = useSelector(state => state.post);

  return (
    <>
      <div>Post</div>
    </>
  )
};

Post.getInitialProps = async ( context ) => {
  context.store.dispatch({
    type: LOAD_POST_REQUEST,
    data: context.query.id,
  })
}

Post.propTypes = {
  id: PropTypes.number.isRequired,
}

```

#### \front\sagas\post.js
```js
...생략
...생략

function loadPostAPI(postId) {
  return axios.get(`/post/${postId}`, {
    withCredentials: true,
  });
}

function* loadPost(action) {
  try {
    const result = yield call(loadPostAPI, action.data);
    yield put({
      type: LOAD_POST_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LOAD_POST_FAILURE,
      error: e,
    });
  }
}

function* watchLoadPost() {
  yield takeLatest(LOAD_POST_REQUEST, loadPost);
}

export default function* postSaga() {
  yield all([
    ...생략
    fork(watchLoadPost),
  ]);
}
```

#### \back\routes\post.js
```js
...생략

router.get('/:id', async (req, res, next) => {
  try {
    const post = await db.Post.findOne({
      where: { id: req.params.id },
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }, {
        model: db.Image,
      }, {
        model: db.User,
        through: 'Like',
        as: 'Likers',
        attributes: ['id'],
      }, {
        model: db.Post,
        as: 'Retweet',
        include: [{
          model: db.User,
          attributes: ['id', 'nickname'],
        }, {
          model: db.Image,
        }],
        order: [['createdAt', 'DESC']],
      }]
    });
    res.json(post);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

...생략
```

#### \front\reducers\post.js
```js
import produce from 'immer';

export const initialState = {
  ...생략
  commentAdded: false,
  singlePost: null, // 개별 포스트 state를 추가해준다.
};

...생략

export default (state = initialState, action) => {
  return produce(state, (draft) => {
    switch (action.type) {
      ...생략

      case LOAD_POST_SUCCESS: {
        draft.singlePost = action.data;
        break;
      }
      default: {
        break;
      }
    }
  });
};

```

#### \front\pages\post.js
```js
import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { LOAD_POST_REQUEST } from '../reducers/post';

const Post = ({ id }) => {
  const { singlePost } = useSelector(state => state.post);

  return (
    <>
      <div itemScope="content">{singlePost.content}</div>
      <div itemScope="author">{singlePost.User.nickname}</div>
      <div>
        {singlePost.Images[0] && <img src={`http://localhost:3065/${singlePost.Images[0].src}`} />}
      </div>
    </>
  )
};

Post.getInitialProps = async ( context ) => {
  context.store.dispatch({
    type: LOAD_POST_REQUEST,
    data: context.query.id,
  })
}

Post.propTypes = {
  id: PropTypes.number.isRequired,
}

export default Post;

```


#### \front\server.js
```js
....생략

const app = next({ dev });
const handle = app.getRequestHandler();
dotenv.config();

app.prepare().then(() => {
  const server = express();

  ....생략

  server.get('/post/:id', (req, rex) => { // 동적 페이지를 추가해준다.
    return app.render(req, res, '/post', { id: req.params.id });
  })

}

  ...생략
});
```

이거를 한 이유는, 주소에 대해서 검색엔진이 게시글을 가져갔을 때 제대로 가져갔는지 확인하기 위해서이다. <br><br>

실제로 검색엔진이 어떤게 내용물, 이미지를 알 수가없다. 검색엔진이 노출이 잘 되기위해서 <br>
2가지 방법이 있다. <br>

> 1. Meta-tag <br>
> 2. schema.org : Html 속성을 넣어주는 것이다.-> 따로 공부해야 한다.<br>
>> 여기서는 간단하게 Meta-tag를 시행하겠다. <br>

Meta-tag를 시행은 다음 시간에 하겠다. <br>


## reactHelmet으로 head 태그 조작하기
[위로가기](#서버-사이드-렌더링)

### react-helmet
react-helmet이라는 것을 사용하는데 <br>
react-helmet이 head태그에 들어가는 meta, type, script 등을 관리를 해준다. <br>
head태그에 들어가는 가는 것이기때문에, helmet이라고 이름을 지은 거 같다. <br>

<pre><code>npm i react-helmet</code></pre>

```js
...생략
import Helmet from 'react-helmet'; // 추가
import { LOAD_POST_REQUEST } from '../reducers/post';

const Post = ({ id }) => {
  const { singlePost } = useSelector(state => state.post);

  return (
    <>
      <Helmet
        title={`${singlePost.User.nickname}님의 글`} // 제목
        description={singlePost.content} // 설명
        meta={[{
          name: 'description', content: singlePost.content,
        }, {
          property: 'og:title', content: `${singlePost.User.nickname}님의 게시글`,
        }, {
          property: 'og:description', content: singlePost.content,
        }, {
          property: 'og:image', content: singlePost.Images[0] && `http://localhost:3065/${singlePost.Images[0].src}`,
        }, {
          property: 'og:url', content: `http://localhost:3060/post/${id}`,
        }]}
      />


      <div itemScope="content">{singlePost.content}</div> 
      <div itemScope="author">{singlePost.User.nickname}</div>
      <div>
        {singlePost.Images[0] && <img src={`http://localhost:3065/${singlePost.Images[0].src}`} />}
      </div>
    </>
  )
};

...생략

```
<strong>og의 의미는 Open Graph</strong>의 줄임말이다. <br>
검색엔진이 head태그에 위와 같은 데이터를 입력하면 검색봇이 찾을 수가 있다. <br>

> <Helmet><title>처럼 태그를 내부에 넣는 방식도 있는데, 현재 문제가 있다. <br>
> 그리고 <strong>Helment</strong>도 SSR을 적용해야한다. <br><br>


먼저 `_document.js`파일을 생성해준다. <br>
> `_document.js`는 HTML의 역할을 한다. <br>
> 생성한 이유는 Helmet을 SSR을 하기위해서이다. <br>

하지만. `_document.js`는 Hooks문법을 지원을 안해서 Class 문법으로 하겠다.
#### \front\pages\_document.js 
```js
import React from 'react';
import Document, { Main, NextScript } from 'next/document';
import Helmet from 'react-helmet';

class MyDocument extends Document { // Class문법으로 한다.
  // next에서는 Doucment을 상속해야한다.

  // Hooks를 사용하지 않으면 getInitialProps은 static으로 해야한다.
  static getInitialProps(context) { 
    return { helmet: Helmet.renderStatic() } // 이렇게 해줘야 서버 사이드 렌더링이 된다.
  }

  // 기본적인 이런 모양이 된다.
  render() {

    // 위에 return 해준 거는 밑에 props.helmet으로 들어간다. 
    const { htmlAttributes, bodyAttributes, ...helment } = this.props.helment;

    return (
      // 밑에 쪽이 WebSite의 틀이다.
      <html>
        <head>

        </head>
        <bode>
          {/* Main이 _app.js가 된다. */}
          <Main />
          <NextScript />
        </bode>
      </html>
    )
  }
}

```

#### \front\pages\_document.js
```js
import React from 'react';
import Document, { Main, NextScript } from 'next/document';
import Helmet from 'react-helmet';

class MyDocument extends Document {
  static getInitialProps(context) { 
    return { helmet: Helmet.renderStatic() }
  }

  render() {

    const { htmlAttributes, bodyAttributes, ...helmet } = this.props.helmet;
    // this.props.helment에서 htmlAttributes, bodyAttributes, ...helment을 사용할 수가 있다.
    // htmlAttributes는 Html의 속성들을 Helmet에서 제공한다.
    // bodyAttributes는 body의 속성들을 Helmet에서 제공한다.
    // ...helment는 나머지(meta-tag, script, style, link태그)이다.

    const htmlAttrs = htmlAttributes.toComponent(); // htmlAttributes을 이와같이 바꿔줘야한다.
    const bodyAttrs = bodyAttributes.toComponent(); // bodyAttributes을 이와같이 바꿔줘야한다.

    return (
      <html {...htmlAttrs}> {/* html속성들을 이와 같이 넣어줘야한다. */}
        <head>
          {/* 나머지는 위와 같이 helment들을 넣어주시면 된다. */}
          {Object.values(helmet).map(el => el.toComponent())}
          {/* meta-tag, script, style, link태그들을 반복문 해서 각각 react-componet로 만들어서 head안에 붙이는 거다  */}
        </head>
        <bode {...bodyAttrs}> {/* body 속성들을 이와 같이 넣어줘야한다. */}
          <Main />
          <NextScript />
        </bode>
      </html>
    )
  }
}

```

아지 미완성이다. 다음시간에도 계속 이어질 것이다. <br>

