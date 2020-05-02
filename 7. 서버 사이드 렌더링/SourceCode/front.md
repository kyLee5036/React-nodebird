# 서버 사이드 렌더링

+ [서버 사이드 렌더링 SRR](#서버-사이드-렌더링-SRR)
+ [SSR을 위해 쿠키 넣어주기](#SSR을-위해-쿠키-넣어주기)
+ [리덕스 사가 액션 로딩하기](#리덕스-사가-액션-로딩하기)
+ [SSR에서 내 정보 처리하기](#SSR에서-내-정보-처리하기)
+ [회원가입 리다이렉션과 포스트 제거](#회원가입-리다이렉션과-포스트-제거)





## 서버 사이드 렌더링 SRR
[위로가기](#서버-사이드-렌더링)

#### \front\pages\_app.js
```js
import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import WithRedux from 'next-redux-wrapper';
import WithReduxSaga from 'next-redux-saga';
import { createStore, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux'; 
import createSagaMiddleware from 'redux-saga';

import AppLayout from '../components/AppLayout';
import reducer from '../reducers';
import rootSaga from '../sagas';

const NodeBird = ({ Component, store, pageProps }) => {
  return (
    <Provider store={store} > 
      <Head>
        <title>NodeBird</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
        <link rel="stylesheet" type="text/css" charSet="UTF-8" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" /> 
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />
      </Head>
      <AppLayout >
        <Component {...pageProps} />
      </AppLayout>
    </Provider>
  );
};

NodeBird.propTypes = {
  Component: PropTypes.elementType.isRequired,
  store: PropTypes.object.isRequired,
  pageProps: PropTypes.object.isRequired,
};

NodeBird.getInitialProps = async (context) => {
  const { ctx, Component } = context;
  let pageProps = {};
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }
  return { pageProps };
};

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
  sagaMiddleware.run(rootSaga); 
  return store;
}

export default WithRedux(configureStore)(WithReduxSaga(NodeBird));
```

#### \front\pages\index.js
```js
import React, { useEffect } from 'react';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_MAIN_POSTS_REQUEST } from '../reducers/post';

const Home = () => {
  const { me } = useSelector(state => state.user);
  const { mainPosts } = useSelector(state => state.post);
  const dispatch = useDispatch();
  

  return (
    <div>
      {me && <PostForm />}
      {mainPosts.map((c, i) => {
        return (
          <PostCard key={i} post={c} />
        );
      })}
    </div>
  );
};

Home.getInitialProps = async (context) => {
  console.log(Object.keys(context));
  context.store.dispatch({
    type: LOAD_MAIN_POSTS_REQUEST,
  });
};

export default Home;
```

## SSR을 위해 쿠키 넣어주기
[위로가기](#서버-사이드-렌더링)


#### \front\pages\index.js
```js
import React from 'react';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { useSelector } from 'react-redux';
import { LOAD_MAIN_POSTS_REQUEST } from '../reducers/post';

const Home = () => {
  const { me } = useSelector(state => state.user);
  const { mainPosts } = useSelector(state => state.post);

  return (
    <div>
      {me && <PostForm />}
      {mainPosts.map((c, i) => {
        return (
          <PostCard key={i} post={c} />
        );
      })}
    </div>
  );
};

Home.getInitialProps = async (context) => {
  context.store.dispatch({
    type: LOAD_MAIN_POSTS_REQUEST,
  });
};

export default Home;
```

#### \front\pages\_app.js
```js
import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import WithRedux from 'next-redux-wrapper';
import WithReduxSaga from 'next-redux-saga';
import { createStore, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux'; 
import { LOAD_USER_REQUEST } from '../reducers/user';
import createSagaMiddleware from 'redux-saga';
import axios from 'axios';

import AppLayout from '../components/AppLayout';
import reducer from '../reducers';
import rootSaga from '../sagas';

const NodeBird = ({ Component, store, pageProps }) => {
  return (
    <Provider store={store} > 
      <Head>
        <title>NodeBird</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
        <link rel="stylesheet" type="text/css" charSet="UTF-8" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" /> 
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />
      </Head>
      <AppLayout >
        <Component {...pageProps} />
      </AppLayout>
    </Provider>
  );
};

NodeBird.propTypes = {
  Component: PropTypes.elementType.isRequired,
  store: PropTypes.object.isRequired,
  pageProps: PropTypes.object.isRequired,
};

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
  sagaMiddleware.run(rootSaga); 
  return store;
}

export default WithRedux(configureStore)(WithReduxSaga(NodeBird));
```

## 리덕스 사가 액션 로딩하기
[위로가기](#서버-사이드-렌더링)

#### \front\pages\hashtag.js
```js
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_HASHTAG_POSTS_REQUEST } from '../reducers/post';
import PostCard from '../components/PostCard';

const Hashtag = ({ tag }) => {
  const { mainPosts } = useSelector(state => state.post);

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
  const tag = context.query.tag;
  context.store.dispatch({
    type: LOAD_HASHTAG_POSTS_REQUEST,
    data: tag,
  })
  return { tag };
};

export default Hashtag;
```

#### \front\pages\user.js
```js
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Card } from 'antd';
import { LOAD_USER_POSTS_REQUEST } from '../reducers/post';
import { LOAD_USER_REQUEST } from '../reducers/user';
import PostCard from '../components/PostCard';

const User = ({ id }) => {
  const { mainPosts } = useSelector(state => state.post);
  const { userInfo } = useSelector(state => state.user);


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
  const id = parseInt(context.query.id, 10);
  context.store.dispatch({
    type: LOAD_USER_REQUEST,
    data: id,
  });
  context.store.dispatch({
    type: LOAD_USER_POSTS_REQUEST,
    data: id,
  });
  return { id };
};

export default User;
```

#### \front\sagas\post.js
```js
import axios from 'axios';
import { all, fork, takeLatest, put, delay, call } from 'redux-saga/effects';
import { 
  ADD_POST_REQUEST, ADD_POST_FAILURE, ADD_POST_SUCCESS, 
  ADD_COMMENT_SUCCESS, ADD_COMMENT_REQUEST, ADD_COMMENT_FAILURE, 
  LOAD_MAIN_POSTS_SUCCESS, LOAD_MAIN_POSTS_FAILURE, LOAD_MAIN_POSTS_REQUEST, LOAD_HASHTAG_POSTS_REQUEST, LOAD_HASHTAG_POSTS_SUCCESS, LOAD_HASHTAG_POSTS_FAILURE, LOAD_USER_POSTS_SUCCESS, LOAD_USER_POSTS_FAILURE, LOAD_USER_POSTS_REQUEST, LOAD_COMMENTS_FAILURE, LOAD_COMMENTS_REQUEST, LOAD_COMMENTS_SUCCESS, UPLOAD_IMAGES_SUCCESS, UPLOAD_IMAGES_FAILURE, UPLOAD_IMAGES_REQUEST, LIKE_POST_SUCCESS, LIKE_POST_FAILURE, LIKE_POST_REQUEST, UNLIKE_POST_SUCCESS, UNLIKE_POST_FAILURE, UNLIKE_POST_REQUEST, RETWEET_SUCCESS, RETWEET_FAILURE, RETWEET_REQUEST 
} from '../reducers/post';
import { ADD_POST_TO_ME } from '../reducers/user'

function AddCommentAPI(data) {
  return axios.post(`/post/${data.postId}/comment`, { content: data.content }, {
    withCredentials: true,
  });
}
function* AddComment(action) { 
  try {
    const result = yield call(AddCommentAPI, action.data);
    yield put({
      type: ADD_COMMENT_SUCCESS,
      data: {
        postId: action.data.postId, 
        comment: result.data,
      }
    })
  } catch (e) {
    console.error(e);
    yield put({
      type: ADD_COMMENT_FAILURE,
      error: e
    })
  }
}
function* watchAddComment() {
  yield takeLatest(ADD_COMMENT_REQUEST, AddComment);
}

function loadCommentsAPI(postId) {
  return axios.get(`/post/${postId}/comments`);
}

function* loadComments(action) {
  try {
    const result = yield call(loadCommentsAPI, action.data);
    yield put({
      type: LOAD_COMMENTS_SUCCESS,
      data: {
        postId: action.data,
        comments: result.data
      }
    });
  } catch (e) {
    yield put({
      type: LOAD_COMMENTS_FAILURE,
      error: e
    });
  }
}

function* watchLoadComments() {
  yield takeLatest(LOAD_COMMENTS_REQUEST, loadComments);
}


function addPostAPI(postData) {
  return axios.post('/post', postData, {
    withCredentials: true,
  });
}

function* addPost(action) {
  try {
    const result = yield call(addPostAPI, action.data);
    yield put({
      type: ADD_POST_SUCCESS,
      data: result.data,
    });
    yield put({
      type: ADD_POST_TO_ME,
      data: result.data.id
    })
  } catch (e) {
    yield put({
      type: ADD_POST_FAILURE,
      error: e,
    });
  }
}

function* watchAddPost() {
  yield takeLatest(ADD_POST_REQUEST, addPost);
}


function loadMainPostsAPI() {
  return axios.get('/posts');
}

function* loadMainPosts() {
  try {
    const result = yield call(loadMainPostsAPI);
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


function loadHashtagPostsAPI(tag) {
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


function loadUserPostsAPI(id) {
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

function uploadImagesAPI(formData) {
  return axios.post(`/post/images`, formData ,{
    withCredentials: true,
  });
}

function* uploadImages(action) {
  try {
    const result = yield call(uploadImagesAPI, action.data);
    yield put({
      type: UPLOAD_IMAGES_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: UPLOAD_IMAGES_FAILURE,
      error: e,
    });
  }
}

function* watchUploadImages() {
  yield takeLatest(UPLOAD_IMAGES_REQUEST, uploadImages);
}

function likePostAPI(postId) {
  return axios.post(`/post/${postId}/like`, {} ,{
    withCredentials: true,
  });
}

function* likePost(action) {
  try {
    const result = yield call(likePostAPI, action.data);
    yield put({
      type: LIKE_POST_SUCCESS,
      data: {
        postId: action.data,
        userId: result.data.userId,
      }
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LIKE_POST_FAILURE,
      error: e,
    });
  }
}

function* watchLikePost() {
  yield takeLatest(LIKE_POST_REQUEST, likePost);
}

function unlikePostAPI(postId) {
  return axios.delete(`/post/${postId}/unlike`, {
    withCredentials: true,
  });
}

function* unlikePost(action) {
  try {
    const result = yield call(unlikePostAPI, action.data);
    yield put({
      type: UNLIKE_POST_SUCCESS,
      data: { 
        postId: action.data,
        userId: result.data.userId,
      }
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: UNLIKE_POST_FAILURE,
      error: e,
    });
  }
}

function* watchUnlikePost() {
  yield takeLatest(UNLIKE_POST_REQUEST, unlikePost);
}

function retweetAPI(postId) {
  return axios.post(`/post/${postId}/retweet`,{} , {
    withCredentials: true,
  });
}

function* retweet(action) {
  try {
    const result = yield call(retweetAPI, action.data);
    yield put({
      type: RETWEET_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: RETWEET_FAILURE,
      error: e,
    });
    alert(e.response && e.response.data );
  }
}

function* watchRetweet() {
  yield takeLatest(RETWEET_REQUEST, retweet);
}

export default function* postSaga() {
  yield all([
    fork(watchAddPost),
    fork(watchLoadMainPosts),
    fork(watchAddComment),
    fork(watchLoadComments),
    fork(watchLoadHashtagPosts),
    fork(watchLoadUserPosts),
    fork(watchUploadImages),
    fork(watchLikePost),
    fork(watchUnlikePost),
    fork(watchRetweet),
  ]);
}
```

## SSR에서 내 정보 처리하기
[위로가기](#서버-사이드-렌더링)

#### \front\pages\profile.js
```js

import React, { useCallback } from 'react';
import {Form, Input, Button, List, Card, Icon} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import NickNameEditForm from '../components/NickNameEditForm';
import { LOAD_FOLLOWERS_REQUEST, LOAD_FOLLOWINGS_REQUEST, UNFOLLOW_USER_REQUEST, REMOVE_FOLLOWER_REQUEST } from '../reducers/user';
import { LOAD_USER_POSTS_REQUEST } from '../reducers/post';
import PostCard from '../components/PostCard';

const Profile = () => {
  const dispatch = useDispatch();
  const { followingList, followerList } = useSelector(state => state.user);
  const { mainPosts } = useSelector(state => state.post);


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
    <div>
      <NickNameEditForm />
      <List
        style={{ marginBottom: '20px' }}
        grid={{ gutter: 4, xs: 2, md: 3 }}
        size="small"
        header={<div>팔로잉 목록</div>}
        loadMore={<Button style={{ width: '100%' }}>더 보기</Button>}
        bordered
        dataSource={followingList}
        renderItem={item => (
          <List.Item style={{ marginTop: '20px' }}>
            <Card actions={[<Icon key="stop" type="stop" onClick={onUnfollow(item.id)} />]}>
              <Card.Meta description={item.nickname} />
            </Card>
          </List.Item>
        )}
      />
      <List
        style={{ marginBottom: '20px' }}
        grid={{ gutter: 4, xs: 2, md: 3 }}
        size="small"
        header={<div>팔로워 목록</div>}
        loadMore={<Button style={{ width: '100%' }}>더 보기</Button>}
        bordered
        dataSource={followerList}
        renderItem={item => (
          <List.Item style={{ marginTop: '20px' }}>
            <Card actions={[<Icon key="stop" type="stop" onClick={onRemoveFollower(item.id)} />]}>
              <Card.Meta description={item.nickname} />
            </Card>
          </List.Item>
        )}
      />
      <div>
        {mainPosts.map(c => (
          <PostCard key={+c.createdAt} post={c} />
        ))}
      </div>
    </div>
  );
};

Profile.getInitialProps = async (context) => {
  const state = context.store.getState();
  context.store.dispatch({
    type: LOAD_FOLLOWERS_REQUEST,
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
};

export default Profile;
```

#### \front\sagas\post.js
```js
import axios from 'axios';
import { all, fork, takeLatest, put, delay, call } from 'redux-saga/effects';
import { 
  ADD_POST_REQUEST, ADD_POST_FAILURE, ADD_POST_SUCCESS, 
  ADD_COMMENT_SUCCESS, ADD_COMMENT_REQUEST, ADD_COMMENT_FAILURE, 
  LOAD_MAIN_POSTS_SUCCESS, LOAD_MAIN_POSTS_FAILURE, LOAD_MAIN_POSTS_REQUEST, LOAD_HASHTAG_POSTS_REQUEST, LOAD_HASHTAG_POSTS_SUCCESS, LOAD_HASHTAG_POSTS_FAILURE, LOAD_USER_POSTS_SUCCESS, LOAD_USER_POSTS_FAILURE, LOAD_USER_POSTS_REQUEST, LOAD_COMMENTS_FAILURE, LOAD_COMMENTS_REQUEST, LOAD_COMMENTS_SUCCESS, UPLOAD_IMAGES_SUCCESS, UPLOAD_IMAGES_FAILURE, UPLOAD_IMAGES_REQUEST, LIKE_POST_SUCCESS, LIKE_POST_FAILURE, LIKE_POST_REQUEST, UNLIKE_POST_SUCCESS, UNLIKE_POST_FAILURE, UNLIKE_POST_REQUEST, RETWEET_SUCCESS, RETWEET_FAILURE, RETWEET_REQUEST 
} from '../reducers/post';
import { ADD_POST_TO_ME } from '../reducers/user'

function AddCommentAPI(data) {
  return axios.post(`/post/${data.postId}/comment`, { content: data.content }, {
    withCredentials: true,
  });
}
function* AddComment(action) { 
  try {
    const result = yield call(AddCommentAPI, action.data);
    yield put({
      type: ADD_COMMENT_SUCCESS,
      data: {
        postId: action.data.postId, 
        comment: result.data,
      }
    })
  } catch (e) {
    console.error(e);
    yield put({
      type: ADD_COMMENT_FAILURE,
      error: e
    })
  }
}
function* watchAddComment() {
  yield takeLatest(ADD_COMMENT_REQUEST, AddComment);
}

function loadCommentsAPI(postId) {
  return axios.get(`/post/${postId}/comments`);
}

function* loadComments(action) {
  try {
    const result = yield call(loadCommentsAPI, action.data);
    yield put({
      type: LOAD_COMMENTS_SUCCESS,
      data: {
        postId: action.data,
        comments: result.data
      }
    });
  } catch (e) {
    yield put({
      type: LOAD_COMMENTS_FAILURE,
      error: e
    });
  }
}

function* watchLoadComments() {
  yield takeLatest(LOAD_COMMENTS_REQUEST, loadComments);
}


function addPostAPI(postData) {
  return axios.post('/post', postData, {
    withCredentials: true,
  });
}

function* addPost(action) {
  try {
    const result = yield call(addPostAPI, action.data);
    yield put({
      type: ADD_POST_SUCCESS,
      data: result.data,
    });
    yield put({
      type: ADD_POST_TO_ME,
      data: result.data.id
    })
  } catch (e) {
    yield put({
      type: ADD_POST_FAILURE,
      error: e,
    });
  }
}

function* watchAddPost() {
  yield takeLatest(ADD_POST_REQUEST, addPost);
}


function loadMainPostsAPI() {
  return axios.get('/posts');
}

function* loadMainPosts() {
  try {
    const result = yield call(loadMainPostsAPI);
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


function loadHashtagPostsAPI(tag) {
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


function loadUserPostsAPI(id) {
  return axios.get(`/user/${id || 0}/posts`);
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

function uploadImagesAPI(formData) {
  return axios.post(`/post/images`, formData ,{
    withCredentials: true,
  });
}

function* uploadImages(action) {
  try {
    const result = yield call(uploadImagesAPI, action.data);
    yield put({
      type: UPLOAD_IMAGES_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: UPLOAD_IMAGES_FAILURE,
      error: e,
    });
  }
}

function* watchUploadImages() {
  yield takeLatest(UPLOAD_IMAGES_REQUEST, uploadImages);
}

function likePostAPI(postId) {
  return axios.post(`/post/${postId}/like`, {} ,{
    withCredentials: true,
  });
}

function* likePost(action) {
  try {
    const result = yield call(likePostAPI, action.data);
    yield put({
      type: LIKE_POST_SUCCESS,
      data: {
        postId: action.data,
        userId: result.data.userId,
      }
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LIKE_POST_FAILURE,
      error: e,
    });
  }
}

function* watchLikePost() {
  yield takeLatest(LIKE_POST_REQUEST, likePost);
}

function unlikePostAPI(postId) {
  return axios.delete(`/post/${postId}/unlike`, {
    withCredentials: true,
  });
}

function* unlikePost(action) {
  try {
    const result = yield call(unlikePostAPI, action.data);
    yield put({
      type: UNLIKE_POST_SUCCESS,
      data: { 
        postId: action.data,
        userId: result.data.userId,
      }
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: UNLIKE_POST_FAILURE,
      error: e,
    });
  }
}

function* watchUnlikePost() {
  yield takeLatest(UNLIKE_POST_REQUEST, unlikePost);
}

function retweetAPI(postId) {
  return axios.post(`/post/${postId}/retweet`,{} , {
    withCredentials: true,
  });
}

function* retweet(action) {
  try {
    const result = yield call(retweetAPI, action.data);
    yield put({
      type: RETWEET_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: RETWEET_FAILURE,
      error: e,
    });
    alert(e.response && e.response.data );
  }
}

function* watchRetweet() {
  yield takeLatest(RETWEET_REQUEST, retweet);
}

export default function* postSaga() {
  yield all([
    fork(watchAddPost),
    fork(watchLoadMainPosts),
    fork(watchAddComment),
    fork(watchLoadComments),
    fork(watchLoadHashtagPosts),
    fork(watchLoadUserPosts),
    fork(watchUploadImages),
    fork(watchLikePost),
    fork(watchUnlikePost),
    fork(watchRetweet),
  ]);
}
```

#### \front\sagas\user.js
```js
import axios from 'axios';
import { all, fork, takeLatest, call, put, takeEvery } from 'redux-saga/effects';
import { LOG_IN_REQUEST, LOG_IN_SUCCESS, LOG_IN_FAILURE, SIGN_UP_REQUEST, SIGN_UP_FAILURE, SIGN_UP_SUCCESS, LOG_OUT_SUCCESS, LOG_OUT_FAILURE, LOG_OUT_REQUEST, LOAD_USER_SUCCESS, LOAD_USER_FAILURE, LOAD_USER_REQUEST, FOLLOW_USER_REQUEST, UNFOLLOW_USER_REQUEST, UNFOLLOW_USER_FAILURE, UNFOLLOW_USER_SUCCESS, FOLLOW_USER_FAILURE, FOLLOW_USER_SUCCESS, LOAD_FOLLOWERS_REQUEST, LOAD_FOLLOWERS_FAILURE, LOAD_FOLLOWINGS_FAILURE, LOAD_FOLLOWINGS_REQUEST, REMOVE_FOLLOWER_REQUEST, REMOVE_FOLLOWER_FAILURE, REMOVE_FOLLOWER_SUCCESS, LOAD_FOLLOWERS_SUCCESS, LOAD_FOLLOWINGS_SUCCESS, EDIT_NICKNAME_SUCCESS, EDIT_NICKNAME_FAILURE, EDIT_NICKNAME_REQUEST } from '../reducers/user'

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
    console.error(err)
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
    console.error(err);
    yield put({ 
      type : LOG_OUT_FAILURE,
      error : err,
    });
  }
}

function* watchLogOut() {
  yield takeLatest(LOG_OUT_REQUEST, logOut);
}



function loadUserAPI(userId) {
  return axios.get( userId ? `/user/${userId}` : `/user/`, {
    withCredentials: true,
  });
}

function* loadUser(action) {
  try {
    const result = yield call(loadUserAPI, action.data);
    yield put({
      type: LOAD_USER_SUCCESS,
      data: result.data,
      me: !action.data
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LOAD_USER_FAILURE,
      error: e,
    });
  }
}

function* watchLoadUser() {
  yield takeEvery(LOAD_USER_REQUEST, loadUser);
}


function followAPI(userId) {
  return axios.post(`/user/${userId}/follow`, {}, {
    withCredentials: true,
  });
}

function* follow(action) {
  try {
    const result = yield call(followAPI, action.data);
    yield put({
      type: FOLLOW_USER_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: FOLLOW_USER_FAILURE,
      error: e,
    });
  }
}

function* watchFollow() {
  yield takeEvery(FOLLOW_USER_REQUEST, follow);
}

function unfollowAPI(userId) {
  return axios.delete(`/user/${userId}/unfollow`, {
    withCredentials: true,
  })
}

function* unfollow(action) {
  try {
    const result = yield call(unfollowAPI, action.data);
    yield put({
      type: UNFOLLOW_USER_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: UNFOLLOW_USER_FAILURE,
      error: e,
    });
  }
}

function* watchUnfollow() {
  yield takeEvery(UNFOLLOW_USER_REQUEST, unfollow);
}

function loadFollowersAPI(userId) {
  return axios.get(`/user/${userId || 0}/followers`, {
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

function loadFollowingsAPI(userId) {
  return axios.get(`/user/${userId || 0}/followings`, {
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

function removeFollowerAPI(userId) {
  return axios.delete(`/user/${userId}/follower`, {
    withCredentials: true,
  })
}

function* removeFollower(action) {
  try {
    const result = yield call(removeFollowerAPI, action.data);
    yield put({
      type: REMOVE_FOLLOWER_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: REMOVE_FOLLOWER_FAILURE,
      error: e,
    });
  }
}

function* watchRemoveFollower() {
  yield takeEvery(REMOVE_FOLLOWER_REQUEST, removeFollower);
}

function editNicknameAPI(nickname) {
  return axios.patch(`/user/nickname`, {nickname}, {
    withCredentials: true,
  })
}

function* editNickname(action) {
  try {
    const result = yield call(editNicknameAPI, action.data);
    yield put({
      type: EDIT_NICKNAME_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: EDIT_NICKNAME_FAILURE,
      error: e,
    });
  }
}

function* watchEditNickname() {
  yield takeEvery(EDIT_NICKNAME_REQUEST, editNickname);
}

export default function* userSaga() {
  yield all([
    fork(watchLogIn),
    fork(watchLogOut), 
    fork(watchLoadUser), 
    fork(watchSignUp),
    fork(watchFollow), 
    fork(watchUnfollow),
    fork(watchLoadFollowers),
    fork(watchLoadFollowings),
    fork(watchRemoveFollower),
    fork(watchEditNickname),
  ]);
}
```

## 회원가입 리다이렉션과 포스트 제거
[위로가기](#서버-사이드-렌더링)

#### \front\pages\_app.js
```js
import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import WithRedux from 'next-redux-wrapper';
import WithReduxSaga from 'next-redux-saga';
import { createStore, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux'; 
import { LOAD_USER_REQUEST } from '../reducers/user';
import createSagaMiddleware from 'redux-saga';
import axios from 'axios';

import AppLayout from '../components/AppLayout';
import reducer from '../reducers';
import rootSaga from '../sagas';

const NodeBird = ({ Component, store, pageProps }) => {
  return (
    <Provider store={store} > 
      <Head>
        <title>NodeBird</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
        <link rel="stylesheet" type="text/css" charSet="UTF-8" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" /> 
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />
      </Head>
      <AppLayout >
        <Component {...pageProps} />
      </AppLayout>
    </Provider>
  );
};

NodeBird.propTypes = {
  Component: PropTypes.elementType.isRequired,
  store: PropTypes.object.isRequired,
  pageProps: PropTypes.object.isRequired,
};

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
  return store;
}

export default WithRedux(configureStore)(WithReduxSaga(NodeBird));
```

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
  const {isSigningUp, me, isSignUpSuccesFailure, signUpErrorReason} = useSelector(state => state.user);
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

  if (me) { 
    return null;
  }
  
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
        <div>
          {isSignUpSuccesFailure && <div>{signUpErrorReason}</div>}
        </div>
      </Form>
    </>
  );
};

export default Signup;
```

#### \front\reducers\post.js
```js
...생략


export default (state = initialState, action) => {
  switch (action.type) {
    case UPLOAD_IMAGES_REQUEST: {
      return {
        ...state,
      };
    }
    case UPLOAD_IMAGES_SUCCESS: {
      return {
        ...state,
        imagePaths: [...state.imagePaths, ...action.data],
      };
    }
    case UPLOAD_IMAGES_FAILURE: {
      return {
        ...state,
      };
    }
    case REMOVE_IMAGE: {
      return {
        ...state,
        imagePaths: state.imagePaths.filter((v, i) => i !== action.index),
      }
    }
    case ADD_POST_REQUEST: {
      return {
        ...state,
        isAddingPost: true,
        addPostErrorReason: '',
        postAdded: false,
      };
    }
    case ADD_POST_SUCCESS: {
      return {
        ...state,
        isAddingPost: false,
        mainPosts: [action.data, ...state.mainPosts],
        postAdded: true,
        imagePaths: [],
      };
    }
    case ADD_POST_FAILURE: {
      return {
        ...state,
        isAddingPost: false,
        addPostErrorReason: action.error,
      };
    }
    case ADD_COMMENT_REQUEST: {
      return {
        ...state,
        isAddingComment: true,
        addCommentErrorReason: '',
        commentAdded: false,
      };
    }
    case ADD_COMMENT_SUCCESS: {
      const postIndex = state.mainPosts.findIndex(v => v.id === action.data.postId);
      const post = state.mainPosts[postIndex];
      const Comments = [...post.Comments, action.data.comment];
      const mainPosts = [...state.mainPosts];
      mainPosts[postIndex] = { ...post, Comments };
      return {
        ...state,
        isAddingComment: false,
        mainPosts,
        commentAdded: true,
      };
    }
    case ADD_COMMENT_FAILURE: {
      return {
        ...state,
        isAddingComment: false,
        addCommentErrorReason: action.error,
      };
    }
    case LOAD_COMMENTS_SUCCESS: {
      const postIndex = state.mainPosts.findIndex(
        v => v.id === action.data.postId
      );
      const post = state.mainPosts[postIndex];
      const Comments = action.data.comments;
      const mainPosts = [...state.mainPosts];
      mainPosts[postIndex] = { ...post, Comments };
      return {
        ...state,
        mainPosts
      };
    }
    case LOAD_MAIN_POSTS_REQUEST:
    case LOAD_HASHTAG_POSTS_REQUEST:
    case LOAD_USER_POSTS_REQUEST: {
      return {
        ...state,
        mainPosts: [],
      };
    }
    case LOAD_MAIN_POSTS_SUCCESS:
    case LOAD_HASHTAG_POSTS_SUCCESS:
    case LOAD_USER_POSTS_SUCCESS: {
      return {
        ...state,
        mainPosts: action.data,
      };
    }
    case LOAD_MAIN_POSTS_FAILURE:
    case LOAD_HASHTAG_POSTS_FAILURE:
    case LOAD_USER_POSTS_FAILURE: {
      return {
        ...state,
      };
    }
    case LIKE_POST_REQUEST: {
      return {
        ...state,
      };
    }
    case LIKE_POST_SUCCESS: {
      const postIndex = state.mainPosts.findIndex(
        v => v.id === action.data.postId
      );
      const post = state.mainPosts[postIndex];
      const Likers = [{ id: action.data.userId}, ...post.Likers]; 
      const mainPosts = [...state.mainPosts];
      mainPosts[postIndex] = { ...post, Likers };
      return {
        ...state,
        mainPosts,
      };
    }
    case LIKE_POST_FAILURE: {
      return {
        ...state,
      };
    }
    case UNLIKE_POST_REQUEST: {
      return {
        ...state,
      };
    }
    case UNLIKE_POST_SUCCESS: {
      const postIndex = state.mainPosts.findIndex(v => v.id === action.data.postId);
      const post = state.mainPosts[postIndex];
      const Likers = post.Likers.filter(v => v.id !== action.data.userId);
      const mainPosts = [...state.mainPosts];
      mainPosts[postIndex] = { ...post, Likers };
      return {
        ...state,
        mainPosts,
      };
    }
    case UNLIKE_POST_FAILURE: {
      return {
        ...state,
      };
    }
    case RETWEET_REQUEST: {
      return {
        ...state,
      };
    }
    case RETWEET_SUCCESS: {
      return {
        ...state,
        mainPosts: [action.data, ...state.mainPosts],
      };
    }
    case RETWEET_FAILURE: {
      return {
        ...state,
      };
    }
    case REMOVE_POST_REQUEST: {
      return {
        ...state,
      };
    }
    case REMOVE_POST_SUCCESS: {
      return {
        ...state,
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
export const REMOVE_POST_OF_ME = 'REMOVE_POST_OF_ME'; // 이것만 추가

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
        logInErrorReason : action.error,
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
      if (action.me) {
        return { 
          ...state, 
          me : action.data, 
        }; 
      }
      return {
        ...state,
        userInfo: action.data
      }
    }
    case LOAD_USER_FAILURE: { 
      return { 
        ...state, 
      }; 
    } 
     case FOLLOW_USER_REQUEST: {
      return {
        ...state,
      };
    }
    case FOLLOW_USER_SUCCESS: {
      return {
        ...state,
        me: {
          ...state.me,
          Followings: [{ id: action.data }, ...state.me.Followings],
        },
      };
    }
    case FOLLOW_USER_FAILURE: {
      return {
        ...state,
      };
    }
    case UNFOLLOW_USER_REQUEST: {
      return {
        ...state,
      };
    }
    case UNFOLLOW_USER_SUCCESS: {
      return {
        ...state,
        me: {
          ...state.me,
          Followings: state.me.Followings.filter(v => v.id !== action.data),
        },
        followingList: state.followingList.filter(v => v.id !== action.data),
      };
    }
    case UNFOLLOW_USER_FAILURE: {
      return {
        ...state,
      };
    }
    case ADD_POST_TO_ME: {
      return {
        ...state,
        me : {
          ...state.me,
          Posts: [{ id: action.data}, ...state.me.Posts],
        },
      };
    }
    case REMOVE_POST_OF_ME: {
      return {
        ...state,
        me: {
          ...state.me,
          Posts: state.me.Posts.filter(v => v.id !== action.data),
        },
      };
    }
    case LOAD_FOLLOWERS_REQUEST: {
      return {
        ...state,
      };
    }
    case LOAD_FOLLOWERS_SUCCESS: {
      return {
        ...state,
        followerList: action.data,
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
        followingList: action.data,
      };
    }
    case LOAD_FOLLOWINGS_FAILURE: {
      return {
        ...state,
      };
    }
    case REMOVE_FOLLOWER_REQUEST: {
      return {
        ...state,
      };
    }
    case REMOVE_FOLLOWER_SUCCESS: {
      return {
        ...state,
        me: {
          ...state.me,
          Followers: state.me.Followers.filter(v => v.id !== action.data),
        },
        followerList: state.followerList.filter(v => v.id !== action.data),
      };
    }
    case REMOVE_FOLLOWER_FAILURE: {
      return {
        ...state,
      };
    }
    case EDIT_NICKNAME_REQUEST: {
      return {
        ...state,
        isEditingNickname: true,
        editNicknameErrorResason: '',
      };
    }
    case EDIT_NICKNAME_SUCCESS: {
      return {
        ...state,
        isEditingNickname: false,
        me: {
          ...state.me,
          nickname: action.data,
        },
      };
    }
    case EDIT_NICKNAME_FAILURE: {
      return {
        ...state,
        isEditingNickname: false,
        editNicknameErrorResason: action.error,
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

#### \front\sagas\post.js
```js
import axios from 'axios';
import { all, fork, takeLatest, put, delay, call } from 'redux-saga/effects';
import { 
  ADD_POST_REQUEST, ADD_POST_FAILURE, ADD_POST_SUCCESS, 
  ADD_COMMENT_SUCCESS, ADD_COMMENT_REQUEST, ADD_COMMENT_FAILURE, 
  LOAD_MAIN_POSTS_SUCCESS, LOAD_MAIN_POSTS_FAILURE, LOAD_MAIN_POSTS_REQUEST, LOAD_HASHTAG_POSTS_REQUEST, LOAD_HASHTAG_POSTS_SUCCESS, LOAD_HASHTAG_POSTS_FAILURE, LOAD_USER_POSTS_SUCCESS, LOAD_USER_POSTS_FAILURE, LOAD_USER_POSTS_REQUEST, LOAD_COMMENTS_FAILURE, LOAD_COMMENTS_REQUEST, LOAD_COMMENTS_SUCCESS, UPLOAD_IMAGES_SUCCESS, UPLOAD_IMAGES_FAILURE, UPLOAD_IMAGES_REQUEST, LIKE_POST_SUCCESS, LIKE_POST_FAILURE, LIKE_POST_REQUEST, UNLIKE_POST_SUCCESS, UNLIKE_POST_FAILURE, UNLIKE_POST_REQUEST, RETWEET_SUCCESS, RETWEET_FAILURE, RETWEET_REQUEST, REMOVE_POST_SUCCESS, REMOVE_POST_FAILURE, REMOVE_POST_REQUEST 
} from '../reducers/post';
import { ADD_POST_TO_ME, REMOVE_POST_OF_ME } from '../reducers/user'

function AddCommentAPI(data) {
  return axios.post(`/post/${data.postId}/comment`, { content: data.content }, {
    withCredentials: true,
  });
}
function* AddComment(action) { 
  try {
    const result = yield call(AddCommentAPI, action.data);
    yield put({
      type: ADD_COMMENT_SUCCESS,
      data: {
        postId: action.data.postId, 
        comment: result.data,
      }
    })
  } catch (e) {
    console.error(e);
    yield put({
      type: ADD_COMMENT_FAILURE,
      error: e
    })
  }
}
function* watchAddComment() {
  yield takeLatest(ADD_COMMENT_REQUEST, AddComment);
}

function loadCommentsAPI(postId) {
  return axios.get(`/post/${postId}/comments`);
}

function* loadComments(action) {
  try {
    const result = yield call(loadCommentsAPI, action.data);
    yield put({
      type: LOAD_COMMENTS_SUCCESS,
      data: {
        postId: action.data,
        comments: result.data
      }
    });
  } catch (e) {
    yield put({
      type: LOAD_COMMENTS_FAILURE,
      error: e
    });
  }
}

function* watchLoadComments() {
  yield takeLatest(LOAD_COMMENTS_REQUEST, loadComments);
}


function addPostAPI(postData) {
  return axios.post('/post', postData, {
    withCredentials: true,
  });
}

function* addPost(action) {
  try {
    const result = yield call(addPostAPI, action.data);
    yield put({
      type: ADD_POST_SUCCESS,
      data: result.data,
    });
    yield put({
      type: ADD_POST_TO_ME,
      data: result.data.id
    })
  } catch (e) {
    yield put({
      type: ADD_POST_FAILURE,
      error: e,
    });
  }
}

function* watchAddPost() {
  yield takeLatest(ADD_POST_REQUEST, addPost);
}


function loadMainPostsAPI() {
  return axios.get('/posts');
}

function* loadMainPosts() {
  try {
    const result = yield call(loadMainPostsAPI);
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


function loadHashtagPostsAPI(tag) {
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


function loadUserPostsAPI(id) {
  return axios.get(`/user/${id || 0}/posts`);
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

function uploadImagesAPI(formData) {
  return axios.post(`/post/images`, formData ,{
    withCredentials: true,
  });
}

function* uploadImages(action) {
  try {
    const result = yield call(uploadImagesAPI, action.data);
    yield put({
      type: UPLOAD_IMAGES_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: UPLOAD_IMAGES_FAILURE,
      error: e,
    });
  }
}

function* watchUploadImages() {
  yield takeLatest(UPLOAD_IMAGES_REQUEST, uploadImages);
}

function likePostAPI(postId) {
  return axios.post(`/post/${postId}/like`, {} ,{
    withCredentials: true,
  });
}

function* likePost(action) {
  try {
    const result = yield call(likePostAPI, action.data);
    yield put({
      type: LIKE_POST_SUCCESS,
      data: {
        postId: action.data,
        userId: result.data.userId,
      }
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: LIKE_POST_FAILURE,
      error: e,
    });
  }
}

function* watchLikePost() {
  yield takeLatest(LIKE_POST_REQUEST, likePost);
}

function unlikePostAPI(postId) {
  return axios.delete(`/post/${postId}/unlike`, {
    withCredentials: true,
  });
}

function* unlikePost(action) {
  try {
    const result = yield call(unlikePostAPI, action.data);
    yield put({
      type: UNLIKE_POST_SUCCESS,
      data: { 
        postId: action.data,
        userId: result.data.userId,
      }
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: UNLIKE_POST_FAILURE,
      error: e,
    });
  }
}

function* watchUnlikePost() {
  yield takeLatest(UNLIKE_POST_REQUEST, unlikePost);
}

function retweetAPI(postId) {
  return axios.post(`/post/${postId}/retweet`,{} , {
    withCredentials: true,
  });
}

function* retweet(action) {
  try {
    const result = yield call(retweetAPI, action.data);
    yield put({
      type: RETWEET_SUCCESS,
      data: result.data,
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: RETWEET_FAILURE,
      error: e,
    });
    alert(e.response && e.response.data );
  }
}

function* watchRetweet() {
  yield takeLatest(RETWEET_REQUEST, retweet);
}


function removePostAPI(postId) {
  return axios.delete(`/post/${postId}`, {
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
    yield put({
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
    fork(watchAddPost),
    fork(watchLoadMainPosts),
    fork(watchAddComment),
    fork(watchLoadComments),
    fork(watchLoadHashtagPosts),
    fork(watchLoadUserPosts),
    fork(watchUploadImages),
    fork(watchLikePost),
    fork(watchUnlikePost),
    fork(watchRetweet),
    fork(watchRemovePost),
  ]);
}
```

