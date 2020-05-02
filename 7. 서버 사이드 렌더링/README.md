# 서버 사이드 렌더링

+ [서버 사이드 렌더링 SRR](#서버-사이드-렌더링-SRR)
+ [SSR을 위해 쿠키 넣어주기](#SSR을-위해-쿠키-넣어주기)
+ [리덕스 사가 액션 로딩하기](#리덕스-사가-액션-로딩하기)
+ [SSR에서 내 정보 처리하기](#SSR에서-내-정보-처리하기)





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
  // 한글, 특수문자를 하기 위해서 decodeURIComponent추가
  return axios.get(`/hashtag/${decodeURIComponent(tag)}`);
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