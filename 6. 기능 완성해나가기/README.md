# 기능 완성해나가기

+ [해시태그 링크로 만들기](#해시태그-링크로-만들기)
+ [next와 express 연결하기](#next와-express-연결하기)
+ [getInitialProps로 서버 데이터 받기](#getInitialProps로-서버-데이터-받기)
+ [해시태그 검색, 유저 정보 라우터 만들기](#해시태그-검색,-유저-정보-라우터-만들기)
+ [Link 컴포넌트 고급 사용법](#Link-컴포넌트-고급-사용법)
+ [댓글 작성, 댓글 로딩](#댓글-작성,-댓글-로딩)
+ [미들웨어로 중복 제거하기](#미들웨어로-중복-제거하기)



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


## Link 컴포넌트 고급 사용법
[위로가기](#기능-완성해나가기)


일단 위에 하던거 계속이어서

#### \front\reducers\post.js
```js
...생략

export default (state = initialState, action) => {
  switch (action.type) {
   ...생략
   ...생략
    // 이렇게 연달아서 사용하는 이유는 
    // 3개의 케이스가 똑같은 역할을 수행하니까, 공통된 부분을 줄이기위해서
    // 이렇게 사용한다. 
    // 겹치는 부분을 연달아서 사용할 수가 있다.
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
    default: {
      return {
        ...state,
      };
    }
  }
};

```

#### \back\routes\hashtag.js
```js
...생략

router.get('/:tag', async(req, res, next) => {
  try {
    const posts = await db.Post.findAll({
      include: [{
        model: db.Hashtag,
        where: { name: decodeURIComponent(req.params.tag) }, // 오류 수정
      }, {
        ...생략
});
...생략
```
<br><br>
여기까지 바꿔주고, 화면을 보면 아무것도 나오지가않는다... <br>
에러가 발생하였다... <br>
지금부터 에러를 찾아야한다... <br>

#### \front\sagas\post.js
```js
...생략

function* watchLoadMainPosts() {
  // yield takeLatest(LOAD_MAIN_HASGTAG_REQUEST, loadMainPosts); // 수정 전
  yield takeLatest(LOAD_MAIN_POSTS_REQUEST, loadMainPosts); // 수정 후
}

...생략
```

아바타를 누르면 유저정보의 게시글들만 나오게 한다. <br>
예로들면 유저가 test인 아바타를 클릭하면 test가 작성한 글들만 나오게 한다. <br>
댓글의 아바타도 같이 추가해주었다. <br>

#### \front\components\PostCard.js
```js
...생략
...생략

  return (
    <div>
      ...생략
        <Card.Meta 
          avatar={<Link href={`/user/${post.User.id}`}><a><Avatar>{post.User.nickname[0]}</Avatar></a></Link>} //  수정
          title={post.User.nickname}
          description={(
            ...생략
          )}
        />
        ...생략
      {commentFormOpened && (
        <>
          ...생략
          ...생략
          <List
            ...생략
            renderItem={ item => (
              <li>
                <Comment
                  author={item.User.nickname}
                  avatar={<Link href={`/user/${post.User.id}`}><a><Avatar>{item.User.nickname[0]}</Avatar></a></Link>} //  수정
                  content={item.content}
                />
              </li>
            )}
          />
        </>
      )} 
    </div>
  )
};
...생략

export default PostCard;
```
<br><br>
여기서 다시 에러가 나왔다... 하... <br>
에러내용은... 유저의 아바타를 클릭하는 순간 `TypeError: Cannot read property '0' of undefined`이다. <br>

#### \front\reducers\user.js
```js
export const initialState = {
  isLoggingOut : false,
  isLoggingIn : false,
  logInErrorReason: '',
  isSigningUp: false,
  isSignedUp : false,
  signUpErrorReason: '',
  isSignUpSuccesFailure: false,
  me: null,
  followingList : [],
  followerList: [],
  userInfo: null, // 이 부분이 []로 되어있었다.
  // 빈 배열의 length이므로 자꾸 값아 0이 나온다.
  // 빈 배열이 아니라 null로 고쳐준다.
};
```

하지만...  에러는 아니지만.. `/user/:id`의 화면이 아무것도 보이지않는다.. <br>

#### \front\pages\user.js
```js
...생략

const User = ({ id }) => {
...생략

  useEffect(() => {
    dispatch({
      type: LOAD_USER_REQUEST,
      data: id // 이 부분 수정
    })
    dispatch({
      type: LOAD_USER_POSTS_REQUEST,
      data: id,
    });
  }, []);
  
  return (
    ...생략
  );
};
...생략
export default User;

```

그 다음에는 유저가 등록한 게시글들이 안 보인다... <br>
#### \front\sagas\post.js
```js
function loadUserPostsAPI(id) {
  // return axios.get(`/post/${id}/posts`); // 이렇게 되어있어서 get으로 데이터를 받아올 때
  // 404 응답 메세지가 나온다.
  return axios.get(`/user/${id}/posts`);
}
```

그 이외에 오류 수정 <br>
#### \front\components\AppLayout.js
```js
AppLayout.prototypes = { // 철자를 잘 못 적었음..
  children: PropTypes.node,
}
```

### Link를 SPA 적용하기

여기서 SPA를 적용해주기 위해서, `Link부분`을 고쳐줘야한다. <br>
#### \front\components\PostCard.js
```js
// 이게 프론트 주소가 아니라 서버주소이다.
avatar={<Link href={`/user/${post.User.id}`}><a><Avatar>{post.User.nickname[0]}</Avatar></a></Link>}
// `/user/${post.User.id}`은 프론트에서 처리를 안하고 서버에서 처리를 한다.
// 그래서 프론트에서 처리할 수 있게 링크를 바꿔줘야한다.
// 수정 후
avatar={<Link href={{ pathname: '/user', query: { id: post.User.id } }}><a><Avatar>{post.User.nickname[0]}</Avatar></a></Link>}
```

#### \front\components\PostCard.js
```js
<Card.Meta 
  // 밑에도 바꿔준 상태이다.
  avatar={<Link href={{ pathname: '/user', query: { id: post.User.id } }}><a><Avatar>{post.User.nickname[0]}</Avatar></a></Link>}
  title={post.User.nickname}
  description={(
    <div>
      {post.content.split(/(#[^\s]+)/g).map((v, i) => {
        if (v.match(/#[^\s]+/)) {
          return (
            <Link 
              // 수정 전
              href={`/hashtag/${v.slice(1)}`}
              // 수정 후
              href={{ pathname: '/hashtag', query: { tag: v.slice(1) } }}                 
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


...생략
  <li>
    <Comment
      author={item.User.nickname}
      // 이 부분도 고쳐줘야한다.
      avatar={<Link href={{ pathname: '/user', query: { id: item.User.id } }}><a><Avatar>{item.User.nickname[0]}</Avatar></a></Link>}
      content={item.content}
    />
  </li>

```

여기까지 다 좋은데.. 주소가 이상하다.. 해시태그의 `#리액트`를 클릭하면 <br>
주소 : `/hashtag?tag=리액트`; 이런식으로 나온다. <br>
우리가 원하는 건`/hashtag/리액트` 이다. 그래서 여기에서 옵션에서 설정을 해줘야한다. <br>
그 설정은 `as`를 추가하면 된다. <br>

#### \front\components\PostCard.js
```js
...생략
...생략

<Card.Meta 
  avatar={(
    <Link href={{ pathname: '/user', query: { id: post.User.id } }} as={`/user/${post.user.id}`}>
      <a><Avatar>{post.User.nickname[0]}</Avatar></a>
    </Link>)}
  ...생략
>


return (
  <Link 
    href={{ pathname: '/hashtag', query: { tag: v.slice(1) } }} 
    // 프론트 주소는 href로 작성작성한다.
    as={`/hashtag/${v.slice(1)}`} // 여기에 as를 추가한다.
    // 서버쪽 주소는 as로 작성한다.
    key={+v.createdAt}
  >
    <a>{v}</a>
  </Link>
);


...생략
avatar={(
  <Link 
    href={{ pathname: '/user', query: { id: item.User.id } }} 
    // 여기에 as를 추가하고 내가 원하는 주소를 적으면 된다.
    as={`/user/${item.user.id}`} >
    <a><Avatar>{item.User.nickname[0]}</Avatar></a>
  </Link>
)}

...생략
```

## 댓글 작성, 댓글 로딩
[위로가기](#기능-완성해나가기)

#### \back\routes\post.js
```js
 // 게시글 가져오기
router.get('/:id/comment', async(req, res, next) => {
  try {
    const post = await db.Post.findOne({
      where: { id: req.params.id }
    });
    if (!post) {
      return res.status(404).send('포스트가 존재하지 않습니다.');
    }
    const comments = await db.Comment.findAll({
      where: {
        PostId: req.params.id,
      },
      order: [['createdAt', 'ASC']],
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }],
    });
    return res.json(comments)
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 게시글 작성하기
router.post('/:id/comment', async(req, res, next) => { // POST /api/post/10000/comment
  try {
    if ( !req.user ) { // 로그인 유무 확인
      return res.status(401).send('로그인이 필요합니다.');
    }
    const post = await db.Post.findOne({  // 게시글이 있는지 화인한다.
      where: { id: req.params.id }
     });
     if ( !post ) {
       return res.status(404).send('포스트가 존재하지 않습니다.');
     }
     // 댓글 생성
     const newComment = await db.Comment.create({ 
       PostId: post.id,
       UserId: req.user.id,
       content: req.body.content,
     });
     // 게시글이랑 관계가 있으니까 서로 이어준다.
     // 어떻게 이어주냐면? 시퀄라이즈에서 자동 (add, get, remove 등)을 생성해서 이어준다. 
     await post.addComment(newComment.id);
     
     // 다시 조회하는 이유는?
     // include를 사용하기 위해서 작성해준다. 위에는 include가 없기 때문에
     const comment = await db.Comment.findOne({
      where : {
        id: newComment.id,
      },
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }],
     });
     return res.json(comment);
  } catch (error) {
    console.error(error);
    return next(error);
  }
});
```

프론트 쪽 추가 및 수정을 하겠다.
#### \front\components\PostCard.js
```js
...생략

const PostCard = ({post}) => {
  ...생략

  const onToggleComment = useCallback(() => {
    setCommentFormOpened(prev => !prev);
    if (!commentFormOpened) { // 댓글창이 닫혀있는 경우에 눌렀을 때 켜는경우이다
      // 눌러서 켜면서 밑에 있는 LOAD_COMMENTS_REQUEST를 실행한다.
      dispatch({
        type: LOAD_COMMENTS_REQUEST,
        data: post.id,
      });
    }
  }, []);
  
  const onSubmitComment = useCallback((e) => {
    e.preventDefault();
    if (!me) {
      return alert('로그인이 필요합니다.');
    };
    dispatch({
      type: ADD_COMMENT_REQUEST,
      data: {
        postId: post.id,
        content: commentText, // 추가
      }
    })
    
  }, [me && me.id, commentText]); // 수정

  ...생략
  ...생략
};

...생략

export default PostCard;


```

#### \front\sagas\post.js
```js
...생략
// 댓글 작성
function AddCommentAPI(data) { // 여기 data에는 postId, comment가 2개가 있다.
  return axios.post(`/post/${data.postId}/comment`, { content: data.comment }, {
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

// 댓글 조회
function loadCommentsAPI(postId) { // 여기에는 action.data가 postId라서 그대로 넣어줬다.
// 게다가, data 안에 postId 하나라서 이렇게 작성
  return axios.get(`/post/${postId}/comment`);
}
function* loadComments(action) { 
  try {
    const result = yield call(loadCommentsAPI, action.data);
    yield put({
      type: LOAD_COMMENTS_SUCCESS,
      data: {
        postId: action.data.postId, 
        comment: result.data,
      }
    })
  } catch (e) {
    console.error(e);
    yield put({
      type: LOAD_COMMENTS_FAILURE,
      error: e
    })
  }
}
function* watchLoadComments() {
  yield takeLatest(LOAD_COMMENTS_REQUEST, loadComments);
}


...생략
...생략
```

댓글 작성을하면 <br>
`SequelizeValidationError: notNull Violation: Comment.content cannot be null` <br>
서버쪽에 에러가 있다. 서버 쪽에러라면 네트워크 창을 열어서 확인을 한다. <br>
데이터가 제대로 전달이 되는데?? <br>

#### \front\sagas\post.js
```js
function AddCommentAPI(data) {
  return axios.post(`/post/${data.postId}/comment`, { content: data.content }, { // 오류가 있었다.
    withCredentials: true,
  });
}
```

수정을 한 결과, redux창을 다시 해본 결과 `ADD_COMMENT_FAILURE`가 나왔다. <br>

댓글 작성을 하면, 댓글이 나와야하는데, 나오지가 않는다. <br>
reudcer에서 수정을 해줘야한다. <br>

#### 
```js
// 일단 여기만 추가를 해준다.
case LOAD_COMMENTS_SUCCESS: { // 게시글을 추가할 때랑 똑같이 해줘야한다.
  // 여기서 의문점이 있는데, 게시글 가져올 때 댓글도 다 가져오는게 낫지 않을까?
  // 게시글이랑 댓글이랑 같이 가져오면, 데이터를 너무 많이 사용한다.
  // 프론트에서 데이터를 많이 로딩을 해야기 떄문이다. 굳이 데이터를 서버로부터 많이 가져올 필요가 없다.
  // 사용자가 보고싶은 것만 서버에서로부터 데이터를 가져오면 된다.
  // 대신 이하와 같이 똑같은 작업도 같이 해야한다.
  const postIndex = state.mainPosts.findOne(v => v.id === action.data.postId);
  const post = state.mainPosts[postIndex];
  const Comments = action.data.comments; 
  const mainPosts = [...state.mainPosts];
  mainPosts[postIndex] = { ...post, Comments };
  return {
    ...state,
    mainPosts,
  }

}
```
여기에서 서버쪽에서는 post, get이 200, 201로 다 성공하였는데, 에러가 나온다.. <br>
`state.mainPosts.findOne is not a function` <br>
`findOne`이 아니라 `findIndex`이다.. <br>

그리고 성공을 하였는데, 데이터가 안보인다..왜냐하면 철자가 틀려서이다.<br>

#### \front\reducers\post.js
```js
// 철자 수정 (정확하게)
const Comments = action.data.comments; 
```

철자 오류 <br>
#### \front\sagas\post.js
```js
...생략
function* loadComments(action) { 
  try {
    const result = yield call(loadCommentsAPI, action.data);
    yield put({
      type: LOAD_COMMENTS_SUCCESS,
      data: {
        // postId: action.data.postId, // 수정 전
        postId: action.data, // 수정 후 
        // comment: result.data, // 수정 전  
        comments: result.data,  // 수정 후 
      }
    })
  } catch (e) {
    console.error(e);
    yield put({
      type: LOAD_COMMENTS_FAILURE,
      error: e
    })
  }
}
...생략
```
철자 오류... <br>

#### \front\components\PostCard.js
```js
<Card.Meta 
  avatar={(
    // <Link href={{ pathname: '/user', query: { id: post.User.id } }} as={`/user/${post.user.id}`}> // 수정 전
    <Link href={{ pathname: '/user', query: { id: post.User.id } }} as={`/user/${post.User.id}`}> // 수정 후
    // 이 부분(as를 보면)도 수정하였다. post.user.Id -> post.User.id로 수정해야한다. 철자오류...
      <a><Avatar>{post.User.nickname[0]}</Avatar></a>
    </Link>)}
```

## 미들웨어로 중복 제거하기
[위로가기](#기능-완성해나가기)

공통된 부분 -> 중복된 부분은 제거해야 된다. <br>
그러기 위해서 미들웨어를 활용해서 중복 제거를 하겠다. <br>

#### \back\routes\middlewares.js
```js
// 공통된 부분을 제거하기 위해서 생성하였다.
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) { // isAuthenticated()로 한다. 
    next(); // 여기에다가 에러를 넣으면 에러 처리를한다.
    // 에러를 안 넣으면 다음 미들웨어로 넘어간다.
  } else {
    res.status(401).send('로그인이 필요합니다.')
  }
};

// 회원가입 페이지일 경우에는 못 가도록한다.
exports.isNotLoggedIn = (req, res, next) => {  
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send('로그인 한 사용자는 접근할 수 없습니다.');
  }
};
```

<strong>isAuthenticated()</strong>는 로그인했는지 안했는지 판단해주는 공식적인 라우터이다.

#### \back\routes\post.js
```JS
...생략
const { isLoggedIn } = require('./middlewares'); // 추가

const router = express.Router();

router.post('/', isLoggedIn, async (req, res, next) => { // 여기에다가 isLoggedIn을 넣어준다.
  // 위에 보면 isLoggedIn-> (req, res, next)순서대로 실행한다. 
  // 그리고, isLoggedIn가 실행 안하면 라우터가 끊난다.
  try {
    // if ( !req.user ) {
    //   return res.status(401).send('로그인이 필요합니다.');
    // } 
    // 윗 부분은 제거를 한다. 위에서 isLoggedIn가 처리를 하기 때문이다.
    
    
    const hashtags = req.body.content.match(/#[^\s]+/g);
    ...생략
    res.json(fullPost);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

...생략


router.post('/:id/comment', isLoggedIn, async(req, res, next) => { // isLoggedIn 추가
  ...생략
});

module.exports = router;
```


#### \back\routes\user.js
```js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models');
const passport = require('passport');
const { isLoggedIn } = require('./middlewares'); // 추가

const router = express.Router();

router.get('/', isLoggedIn, (req, res) => { // isLoggedIn 추가
  const user = Object.assign({}, req.user.toJSON() );
  delete user.password;
  return res.json(req.user);
});

...생략

module.exports = router; 

```

