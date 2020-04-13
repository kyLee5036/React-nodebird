# 기능 완성해나가기

+ [해시태그 링크로 만들기](#해시태그-링크로-만들기)
+ [next와 express 연결하기](#next와-express-연결하기)
+ [getInitialProps로 서버 데이터 받기](#getInitialProps로-서버-데이터-받기)
+ [해시태그 검색, 유저 정보 라우터 만들기](#해시태그-검색,-유저-정보-라우터-만들기)




## 해시태그 링크로 만들기
[위로가기](#기능-완성해나가기)

해시태그를 클릭할 수 있게 만들어줘야한다. <br>
클릭할 수 있게 만들어줄려면, content에서 해시태그를 찾아서 링크로 만들어줘야한다. <br>

#### \front\components\PostCard.js
```js
import Link from 'next/link' // 추가

...생략

<Card.Meta 
  avatar={<Avatar>{post.User.nickname[0]}</Avatar>}
  title={post.User.nickname}
  description={<div>post.content</div>} // 문자열 안에 있는 문자를 링크로 바꿔줘야한다.
  // a 태그가 아니라 -> next의 Link태그로 바꿔줘야한다. 
  // 왜? SPA를 유지할려면 a태그가 아니라 link를 해줘야하기때문이다.
/>
...생략
```

#### \front\components\PostCard.js
```js
...생략

  return (
    <div>
      ...생략
        <Card.Meta 
          avatar={<Avatar>{post.User.nickname[0]}</Avatar>}
          title={post.User.nickname}
          description={(
            <div>
              {post.content.split(/(#[^\s]+)/g).map((v, i) => { // 문자열을 나누었다
                if (v.match(/#[^\s]+/)) { // 문자열을 나누어서 해시태그이라면 링크
                  return (
                    <Link href="/hashtag" key={i} ><a>{v}</a></Link>
                  );
                }
                return v; // 그냥 문자열로 반환
              })}
            </div>
          )}
        />
      </Card>
      ...생략 
    </div>
  )
};
...생략
export default PostCard;
```

해시태그 눌러도 같은 페이지로 가고있다. <br>
"좋아요"해시태그를 누르면 "좋아요"가 달린 해시태그 게시글이 달려야하지만, <br>
여기서 주소가 고정되어서 수정이 안된다. <br>

#### \front\pages\hashtag.js
```js
import React from 'react';

const Hashtag = () => {
  return (
    <div>Hashtag</div>
  );
}

export default Hashtag;

```

> next는 동적 주소를 처리하지 못 한다(쿼리스트링으로 하면 할 수 있긴하다.) 

"좋아요" 누르면 -> hashtag/좋아요 <br>
"구독" 누르면 -> hashtag/구독 <br>
"리액트" 누르면 -> hashtag/리액트 <br>
위와 같이 프론트도 할 수 있도록 해야한다. (참고로, express는 가능) <br>

### 동적으로 바꿔주기 위해서 express 사용한다.
하지만, 위와 같이 동적으로 바꿔주는 거 express는 가능한데 next는 불가능하다. <br>
그러기 위해서는 express사용하면 된다. <br>
그럴러면 `프론트 서버에서도 express를 똑같이 연결을 해줄 것`이다. <br>
결국에는, <strong>express도 프론트 서버에서도 같이 사용한다.</strong> <br>


## next와 express 연결하기
[위로가기](#기능-완성해나가기)

next랑 express 이어져서 공존한다. <br>
express가 서버가 돌아가면, 그 안에 next서버가 돌아간다. <br>

> express 서버가 next를 돌리는 거다. 그 경우 서버 자동 재시작이 안 되기 때문에 express를 nodemon을 통해 실행합니다.

프론트에 express서버가 돌아가기 때문에, express서버에 필요한 패키지들을 설치하겠다. <br>
<pre><code>npm i morgan express express-session cookie-parser dotenv</code></pre>

`server.js`파일을 만들어준다.

#### \front\server.js 기본설정
```js
const express = require('express');
const next = require('next');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const dotenv = require('dotenv');

const dev = process.env.NOCE_ENV !== 'production'; // 이 부분이 추가
// production이 아닐때만 개발환경이다.

const prod = process.env.NOCE_ENV === 'production'; // 이 부분이 추가

const app = next({ dev }); // 이 부분이 추가
const handle = app.getRequestHandler(); // 이 부분이 추가
// handler의 의미는 next에서 그렇게 하라고 해서(만들라고 해서) 만든거다.

dotenv.config();

app.prepare().then( () => { // prepare()는 next쪽에 코드, 이 부분이 추가
  // 여기 안에다가 express 코드를 적어준다.
  const server = express(); // 프론트에서는 app이 next라서 다른 변수명을 사용하였다.
  server.use(morgan('dev'));
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(cookieParser(process.env.COOKIE_SECRET)); // 백엔드쪽이랑 쿠기 같게 해준다.
  server.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })); // 백엔드랑 비슷하게 적어주면 된다.

  server.get('*', (req, res) => { // 라우터를 하나 만들어줘야한다.
    // *은 모든요청(get)을 여기에서 처리를 하겠다는 의미
    return handle(req, res); // handler은 요청처리기 이다. 연결해주는 것도 잊지말아야한다.
  });

  server.listen(3060, () => {
    console.log("next-express running on port 3060");
  })
}); // 이렇게 하면 둘이 연결이 된다.
```
프론트 서버 주소 : http://localhost:3060 <br>

#### \front\package.json
```json
{
  ...생략
  "main": "index.js",
  "scripts": {
    "dev": "nodemon", // next를 nodemon으로 수정해줘야한다. 
    // 왜냐하면, nodemon에서 next를 실행하기 떄문에
    "build": "next build",
    "start": "next start"
  },
  "author": "LEEKY",
  "license": "MIT",
  "dependencies": {
  ...생략
  }
```

#### \front\nodemon.js

```json
{
  "watch": [
    "server.js",
    "nodemon.json"
  ],
  "exec": "node server.js",
  "ext": "js json jsx"
}
```
nodemon.js를 만들어줄려는 이유는 주소를 동적으로 할려고, <br>
해시태그 뒤에 좋아요, 구독 붙여서 검색을 하기위해서 한다. <br>


프론트에서 next와 express를 연결한건 동적라우팅을 쓰려하는데, <br>
next에서 안되니 그저 express를 동적라우팅을 쓰기위한 수단으로 사용하는 건가?? <br>

> 그렇다. 이건 next9 버전에서 동적 라우팅 기능이 추가되어 해결되었다.. <br>


여기서 새로고침을 하면, 잠깐동안 로그인 안했을 화면이 보이는데, <br> 
보통은 전체 로딩창을 하는데, 그런 사이트들이 `SPA`이다.  <br>
화면상으로 로딩창으로 가려놓고, 데이터가 다 들어오면 로딩창을 없앤다. <br>
그 방식이 상당히 지저분하다. <br>

그러기위해서 서버쪽에서 데이터를 넣어주는 기술이 `서버사이드랜더링(Server Side Rending)`이다. <br>

<br><br>
이제 여기서부터는 dummy데이터를 삭제하겠다. <br>
dummy데이터를 삭제는 여기에서 생략하겠다. <br>


## getInitialProps로 서버 데이터 받기
[위로가기](#기능-완성해나가기)


#### \front\server.js
```js
...생략

  server.get('*', (req, res) => { 
    return handle(req, res);
  });

  // 동적인 주소를 처리하기 위해서 라우터 2개를 처리하겠다.
  server.get('/hashtag/:tag', (req, res) => { // 추가를 해준다
    // 디신에 return형태가 다르다
    // 원래는 return res.send(); 이였다.

    // hashtag를 동적으로 사용할 수 있다. 하지만 내용을 전달해야하 한다.
    // tag라는 정보를 전달한다. 어디에?
    return app.render(req, res, '/hashtag', { tag: req.params.tag });
  });

  server.get('/user/:id', (req, res) => { // 추가를 해준다
    // User를 동적으로 사용할 수 있다.
    // id라는 정보를 전달한다. 어디에?
    return app.render(req, res, '/user', { id: req.params.id });
  });

...생략 
```

hashtag, user를 사용하기 전에 _app.js에 사전작업을 해줘야한다. <br>

#### \front\pages\_app.js
```js
...생략
...생략
const NodeBird = ({Component, store, pageProps}) => { // pageProps를 추가해준다. 
  return (
    <Provider store={store} > 
      <Head>
        <title>NodeBird</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
      </Head>
      <AppLayout >
        <Component {...pageProps}/> // 여기에다가 pageProps의 값을 Component에 넘겨준다.
      </AppLayout>
    </Provider>
  );
};


NodeBird.prototype = {
  Component : PropTypes.elementType.isRequired,
  store: PropTypes.object.isRequired,
  pageProps: PropTypes.object.isRequired,
}

// 이 부분을 추가를 해준다.
NodeBird.getInitialProps = async(context) = () => { // context는 next안에 있다.
  console.log(context);
  const { ctx, Component } = context; // context안에 ctx, Componet, Router가 있다.
  let pageProps = {};
  if (Component.getInitialProps) { // getInitialProps가 있으면
    pageProps = await Component.getInitialProps(ctx); // getInitialProps를 실행한다.
  }
  return { pageProps };
}

const configureStore = (initalState, options) => {
  ...생략
}

export default WithRedux(configureStore)(NodeBird);
```
설명을 해보자면, getInitialProps가 pageProps를 리턴을 해주면, <br>
NodeBird의 인수에서 pageProps를 받는다. 그 인수를 Componet에 값을 전달해주어야한다. <br>


여기에 `console.log(context)`를 해본다면
```js
{
  AppTree: [Function: AppTree],
  Component: [Function: Home], // Component를 확인 가능
  router: ServerRouter { // 라우터를 확인가능
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    isFallback: false
  },
  ctx: { // 페이지들의 context를 확인가능
    err: undefined,
    req: IncomingMessage {
      _readableState: [ReadableState],
      readable: true,
      _events: [Object: null prototype],
      _eventsCount: 1,
      _maxListeners: undefined,
      socket: [Socket],
      connection: [Socket],
      httpVersionMajor: 1,
      httpVersionMinor: 1,
      httpVersion: '1.1',
      complete: true,
      headers: [Object],
      rawHeaders: [Array],
      trailers: {},
      rawTrailers: [],
      aborted: false,
      upgrade: false,
      url: '/',
      method: 'GET',
      statusCode: null,
      statusMessage: null,
      client: [Socket],
      _consuming: false,
      _dumped: false,
      next: [Function: next],
      baseUrl: '',
      originalUrl: '/',
      _parsedUrl: [Url],
      params: [Object],
      query: {},
      res: [ServerResponse],
      _startAt: [Array],
      _startTime: 2020-04-12T07:25:54.342Z,
      _remoteAddress: '::1',
      body: {},
      secret: 'nodebirdcookie',
      cookies: {},
      signedCookies: [Object: null prototype],
      _parsedOriginalUrl: [Url],
      sessionStore: [MemoryStore],
      sessionID: 'uknSqus3gzQA4OxYmMUj0APmve_QgU3Z',
      session: [Session],
      route: [Route]
    },
    res: ServerResponse {
      _events: [Object: null prototype],
      _eventsCount: 2,
      _maxListeners: undefined,
      outputData: [],
      outputSize: 0,
      writable: true,
      _last: false,
      chunkedEncoding: false,
      shouldKeepAlive: true,
      useChunkedEncodingByDefault: true,
      sendDate: true,
      _removedConnection: false,
      _removedContLen: false,
      _removedTE: false,
      _contentLength: null,
      _hasBody: true,
      _trailer: '',
      finished: false,
      _headerSent: false,
      socket: [Socket],
      connection: [Socket],
      _header: null,
      _onPendingData: [Function: bound updateOutgoingData],
      _sent100: false,
      _expect_continue: false,
      req: [IncomingMessage],
      locals: [Object: null prototype] {},
      _startAt: undefined,
      _startTime: undefined,
      writeHead: [Function: writeHead],
      __onFinished: [Function],
      end: [Function: end],
      statusCode: 200,
      flush: [Function: flush],
      write: [Function: write],
      on: [Function: on],
      [Symbol(kNeedDrain)]: false,
      [Symbol(isCorked)]: false,
      [Symbol(kOutHeaders)]: [Object: null prototype]
    },
    pathname: '/',
    query: {},
    asPath: '/',
    AppTree: [Function: AppTree],
    store: {
      dispatch: [Function],
      subscribe: [Function: subscribe],
      getState: [Function: getState],
      replaceReducer: [Function: replaceReducer],
      [Symbol(observable)]: [Function: observable]
    },
    isServer: true
  }
}
```


사전 작업을 완료 후 여기에 getInitalProps를 추가를 해준다. <br>

#### \front\pages\hashtag.js
```js
import React from 'react';

const Hashtag = () => {
  return (
    <div>Hashtag</div>
  );
};

// 사전 작업을 완료 후 여기에 getInitialProps 추가를 해준다.
Hashtag.getInitialProps = async (context) => { // context라는 매개변수를 받는다.
  // 서버에서 준 태그의 이름이라는 데이터를 여기에서 받는다.
  console.log(context);
  console.log('hashtag getIntitalProps', context.query.tag);
};

export default Hashtag;

```

next가 임의로 추가해준 getInitialProps는 라이프사이클의 일종인데, <br>
ComponentDidUpMount보다 더 앞에서 수행을한다. <br>
getInitialProps는 제일 먼저 실행되서, 가장 최초의 작업을 한다. <br>
서버쪽에 데이터를 받아오거나, 서버쪽에 실행 할 행동을 가장가장가장 먼저 실행된다. <br>

그래서 서버사이드렌더링할 때에도 `getInitialProps`를 사용한다. <br>
결국에는 next에서 제일 중요한 라이프사이클은 `getInitialProps`이다. <br>

Hsshtag.js, User.js를 수정하겠다.
#### \front\pages\hashtag.js
```js
import React from 'react';
import PropTypes from 'prop-types';

const Hashtag = ({ tag }) => {
  return (
    <div>Hashtag {tag}</div>
  );
};

Hashtag.propTypes = {
  tag: PropTypes.string.isRequired,
}

Hashtag.getInitialProps = async (context) => {
  console.log('hashtag getInitialProps', context.query.tag);
  return { tag : context.query.tag }  // 여기에서는 context.query.id로 해줘야한다
  // 서버랑 다르다는 것을 인식해야한다.
  
  // Componet데이터를 또 보낼 수가 있다.
  // 서버 쪽에 데이터를 받아 왔으면, 프론트에서 props로 데이터를 전달 할 수가 있다.
};

export default Hashtag;

```

#### \front\pages\user.js
```js
import React from 'react';
import PropTypes from 'prop-types';

const User = ({ id }) => {
  return (
    <div>userId {id}</div> // 여기에서 id가 전달을 받는다.
  );
};

User.propTypes = {
  id: PropTypes.number.isRequired,
}

User.getInitialProps = async (context) => {
  console.log('user getInitialProps', context.query.id);
  return { id : parseInt(context.query.id, 10) }  // 여기에서는 context.query.id로 해줘야한다
  // 서버랑 다르다는 것을 인식해야한다.
  
  // Componet데이터를 또 보낼 수가 있다.
  // 서버 쪽에 데이터를 받아 왔으면, 프론트에서 props로 데이터를 전달 할 수가 있다.
};

export default User;

```


### 순서
1. NodeBird.getInitialProps실행 (참고로, NodeBird.getInitialProps는 next에서 실행) <br>
2. 그 안에 있는 HashTag.getInitialProps(OR User.getInitialProps)가 실행 <br>
3. HashTag.getInitialProps(OR User.getInitialProps)가 리턴을 한다. <br>
4. 그 리턴 값이 pageProps에 전달 <br>
5. NodeBird의 매개변수 pageProps에 값을 받음 <br>
6. 다시 Hashtag의 Component에 값을 전달한다. <br>


<br><br>
여기에서 더 내용을 추가하겠다. <br>

#### \front\pages\hashtag.js
```js
...생략

const Hashtag = ({ tag }) => {
  console.log(tag);
  const dispatch = useDispatch();
  const { mainPosts } = useSelector(state => state.post);

  useEffect(() => {
    dispatch({
      type: LOAD_HASHTAG_POSTS_REQUEST, // 해시태그 정보
      data: tag,
    });
  }, []);
  return (
    <div>
      {mainPosts.map(c => ( // 포스트 정보들을 불러온다.
        <PostCard key={+c.createdAt} post={c} />
      ))}
    </div>
  );
};

...생략
```


#### \front\pages\user.js
```js
...생략

const User = ({ id }) => {
  const dispatch = useDispatch();
  const { mainPosts } = useSelector(state => state.post);
  const { userInfo } = useSelector(state => state.user);

  useEffect(() => {
    dispatch({
      type: LOAD_USER_REQUEST, // 남의 정보를 보여주는 것
      type: id
    })
    dispatch({
      type: LOAD_USER_POSTS_REQUEST, // 게시글을 보여주는 것
      data: id,
    });
    // (남의 정보, 게시글 보여주는 거)가 있기 떄문에 dispatch가 2개가 있다. 
  }, []);
  
  return (
    <div>
      {userInfo // 남의 정보를 알려주는 것
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
      {mainPosts.map(c => { // 게시글을 보여준다.
        <PostCard key={+c.createdAt} post={c} />
      })}
    </div>
  );
};

...생략

```
참고로, 해시태그 검색, 유저 정보 라우터를 아직 안 들어서 작동이 안 될것이다. <br>

#### \front\server.js (수정했는데, 코드 위치만 바꾸어주었다.)

<br><br>

tag를 클릭하면 tag의 정보가 나와야하는데 안 나오고있다. <br>
생각대로.... 에러가 나온 것갇다. <br>

해결을 했다!!!!값 전달은 잘 되지만, URL가 좀 이상한 것 같다. <br>
`http://localhost:3060/hashtag?tag=리액트` <br>
대략 이런식으로 나오는 것같다.

#### \front\components\PostCard.js
```js
...생략
 <Card.Meta 
    avatar={<Avatar>{post.User.nickname[0]}</Avatar>}
    title={post.User.nickname}
    description={(
      <div>
        {post.content.split(/(#[^\s]+)/g).map((v, i) => {
          if (v.match(/#[^\s]+/)) {
            return (
              <Link 
                href={{ pathname: '/hashtag', // 이런 식으로 추가 해주었다.
                        query: { tag: v.slice(1) } }} // 이런 식으로 추가 해주었다. 
                key={+v.createdAt}
              >
                <a>{v}</a>
              </Link>
            );
          }
          return v; 
        })};
      </div>
    )}
  />
</Card>

...생략
```

## 해시태그 검색, 유저 정보 라우터 만들기
[위로가기](#기능-완성해나가기)

먼저 사가부터 바꾸겠다.

#### \front\sagas\post.js
```js
...생략
...생략
// 계속 재활용이 되어지고있다.

function loadHashtagPostsAPI(tag) {
  return axios.get(`/hashtag/${tag}`);
}

function* loadHashtagPosts() {
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
  return axios.get(`/posts/${id}/posts`);
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

export default function* postSaga() {
  yield all([
    fork(watchAddPost),
    fork(watchLoadMainPosts),
    fork(watchAddComment),
    fork(watchLoadHashtagPosts), // 추가
    fork(watchLoadUserPosts), // 추가
  ]);
}
```


해새태그 라우터를 먼저 추가하겠다.

#### \back\routes\hashtag.js
```js
const express = require('express');
const db = require('../models');

const router = express.Router();

router.get('/:tag', async(req, res, next) => { // 해시태그로 검색어로 들어오는 것 설정
  try {
    const posts = await db.Post.findAll({ // 해시태그가 포함된 것을 다 찾기
      include: [{ // 원래 여기에 where절로 조건을 적어주는데, 해새태그의 조건을 찾기 떄문에 where을 적지않는다.
        model: db.Hashtag, // 해시태그의 관련된 찾기 위해서 모델은 해새티그로 해야한다.
        where: { name: decodeURIComponent(req.params.name) },
      }, {
        model: db.User,
        attributes: ['id', 'nickname'],
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

### URL에서 한글, 특수문자 처리하는 방법 (decodeURIComponent)

tag가 한글, 특수문자 주소를 통해서 서버로 갈 때에는, url컴포넌트로 바껴버린다. <br>
서버에서 제대로 처리하기 위해서는, url컴포넌트로를 제대로 처리해줘야한다. <br>
그래서`decodeURIComponent`를 사용해줘야한다. 프론트, 서버 전부 할 수 있다. <br>


#### \back\routes\user.js
```js
...생략
router.delete('/:id/follower', (req, res) => {

});
router.get('/:id/posts', async (req, res, next) => {
  try {
    const posts = await db.Post.findAll({
      where: { 
        UserId: parseInt(req.params.id, 10),
        RetweetId: null,
      },
      include: [{
        model: db.User, // 게시글 작성자
        attributes: ['id', 'nickname'],
      }]
    });
    res.json(posts);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router; 

```

방금 hashtag에서는 where절이 없었는데, user라우터의 posts는 where절이 있다. <br>
왜냐하면, user라우터의 posts는 유저의 아이디를 찾은 다음에 해당하는 포스트를 다 보여주기 때문에이다. <br>
hashtag는 hastag에 관한 게시글들을 다 보여주기때문에, 차이가 있다. <br>

#### \front\sagas\user.js
```js
...생략

function loadUserAPI(userId) { // 내 정보뿐 만아니라 남의 정보도 받아와야하기떄문에 코드수정하겠다.
  return axios.get( userId ? `/user/${userId}` : `/user/`, {
    // 즉, 유저아이디가 있으면 남의 정보 불러오기, 유저 아이디가 없으면 내 정보 불러보기
    // 사가를 2개만들어서 해도되는데, 이렇게 해도 된다.
    withCredentials: true,
  });
}

function* loadUser(action) {
  try {
    const result = yield call(loadUserAPI, action.data);
    yield put({
      type: LOAD_USER_SUCCESS,
      data: result.data,
      me: !action.data, // 수정
      // me의 역할은 유저아이디있다.
      // 유저 아이디가 있으면 다른 사람정보
      // 유저 아이디가 없으면 내 정보

      // me를 넣어준 이유는 구별해주기위해서, 즉, me데이터가 있으면 내 정보
      // me데이터가 없으면 남의 정보 
      // reducer에 보면 안다!!! 밑에있음
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

export default function* userSaga() {
  yield all([
    fork(watchLogIn),
    fork(watchLogOut), 
    fork(watchLoadUser), 
    fork(watchSignUp)
  ]);
}
```

#### \front\reducers\user.js
```js

export const initialState = {
  ...생략
  me: null, // 여기에서는 me가 내정보
  ...생략
  userInfo: [], // 여기에서는 userInfo가 남의 정보
};

...생략

export default (state = initialState, action) => {
  switch (action.type) {
    ...생략
    
    case LOAD_USER_REQUEST: { 
      return { 
        ...state, 
      }; 
    }
    case LOAD_USER_SUCCESS: { // 이렇게도 할 수 있다
      // 여기에서 구별해주기 때문에 saga의 me를 넣어주었다.
      if (action.me) { // 내 정보일 경우
        return { 
          ...state, 
          me : action.data, 
        }; 
      }
      return { // 남의 정보를 불러올 경우
        ...state,
        userInfo: action.data
      }
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
#### \back\routes\user.js
```js
...생략
...생략

router.get('/:id', async (req, res) => {  // 남의 정보를 찾는거(가져오는 거)
  try {
    const user = await db.User.findOne({ // 남의 정보를 가져온다.
      where: { id: parseInt(req.params.id, 10 )},
      // 남의 정보를 보낼 떄 게시글, 팔로워, 팔로잉 수 알아내야 한다.
      include: [{
        model: db.Post,
        as: 'Posts',
        attributes: ['id'],
      }, {
        model: db.User,
        as: 'Followings',
        attributes: ['id'],
      }, {
        model: db.User,
        as: 'Followers',
        attributes: ['id'],
      }],
      attributes: ['id', 'nickname'],
    });
    // 남의 팔로워, 파로잉이 누가했는지 알면 개인사생활 침해이기때문에, 위에 내용을 덛붙여서 수정을 하겠다.
    const jsonUser = user.toJSON();
    // 정보를 보내는 대신에 몇 개인지를 알려주는 것이다. (몇 명이 나를 팔로워 했는지 등)
    jsonUser.Posts = jsonUser.Posts ? jsonUser.Posts.length : 0; // 게시글 수를 알려준다.
    jsonUser.Followings = jsonUser.Followings ? jsonUser.Followings.length : 0; // 팔로잉 수를 알려준다
    jsonUser.Followers = jsonUser.Followers ? jsonUser.Followers.length : 0; // 팔로워 수를 알려준다.
    // 프론트에서 가지않도록 하는 것은 : 비밀번호, 개인사생활은 더더욱 조심해서 코드를 작성해야한다.

    res.json(jsonUser);
  } catch (e) {
    console.log(e);
    next(e);
  }
});

...생략
...생략
// /:id/post는 추가되어져있어서 생략하겠음
...생략
module.exports = router; 

```


#### \front\pages\user.js
```js
...생략
...생략

  return (
    <div>
      {userInfo
        ? (
          <Card
            actions={[
              <div key="twit">
                짹짹
                <br />  
                {userInfo.Posts} // 유저의 게시글 수 
                // 여기에 숫자가 들어간다.
              </div>,
              <div key="following">
                팔로잉
                <br />
                {userInfo.Followings} // 팔로잉 수
                // 여기에 숫자가 들어간다.
              </div>,
              <div key="follower">
                팔로워
                <br />
                {userInfo.Followers} // 팔로워 수
                // 여기에 숫자가 들어간다.
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
      {mainPosts.map(c => {
        <PostCard key={+c.createdAt} post={c} />
      })}
    </div>
  );
};
...생략
...생략

```

마지막으로 `\back\index.js` DB접속 연결시키는 것 잊지말기!! <br>

