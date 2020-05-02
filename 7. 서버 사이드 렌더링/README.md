# 서버 사이드 렌더링

+ [서버 사이드 렌더링 SRR](#서버-사이드-렌더링-SRR)
+ [SSR을 위해 쿠키 넣어주기](#SSR을-위해-쿠키-넣어주기)
+ [리덕스 사가 액션 로딩하기](#리덕스-사가-액션-로딩하기)





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