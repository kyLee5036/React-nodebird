# 기능 완성해나가기

+ [해시태그 링크로 만들기](#해시태그-링크로-만들기)
+ [next와 express 연결하기](#next와-express-연결하기)
+ [getInitialProps로 서버 데이터 받기](#getInitialProps로-서버-데이터-받기)



## 해시태그 링크로 만들기
[위로가기](#기능-완성해나가기)

#### \front\components\PostCard.js
```js
import React, { useState, useCallback, useEffect } from 'react';
import { Card, Icon, Button, Avatar, Form, Input, List, Comment } from 'antd';
import Link from 'next/link'
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { ADD_COMMENT_REQUEST } from '../reducers/post';

const PostCard = ({post}) => {

  const [commentFormOpened, setCommentFormOpened] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { me } = useSelector(state => state.user);
  const { commentAdded, isAddingComment } = useSelector(state => state.post);
  const dispatch = useDispatch();

  const onToggleComment = useCallback(() => {
    setCommentFormOpened(prev => !prev);
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
      }
    })
    
  }, [me && me.id]);

  useEffect(() => {
    if (commentAdded) {
      setCommentText('');
    }
  }, [commentAdded]);

  // useEffect(() => {
  //   setCommentText('');
  // }, [commentAdded === true]);

  const onChangeCommentText = useCallback((e) => {
    setCommentText(e.target.value);
  }, []);

  return (
    <div>
      <Card
        key={+post.createdAt}
        cover={post.img && <img alt="example" src={post.img} />}
        actions={[
          <Icon type="retweet" key="retweet" />,
          <Icon type="heart" key="heart" />,
          <Icon type="message" key="message" onClick={onToggleComment} />,
          <Icon type="ellipsis" key="ellipsis" />,
        ]}
        extra={<Button>팔로우</Button>}
      >
        <Card.Meta 
          avatar={<Avatar>{post.User.nickname[0]}</Avatar>}
          title={post.User.nickname}
          description={(
            <div>
              {post.content.split(/(#[^\s]+)/g).map((v, i) => {
                if (v.match(/#[^\s]+/)) {
                  return (
                    <Link href="/hashtag" key={i} ><a>{v}</a></Link>
                  );
                }
                return v;
              })};
            </div>
          )}
        />
      </Card>
      {commentFormOpened && (
        <>
          <Form onSubmit={onSubmitComment}>
            <Form.Item>
              <Input.TextArea rows={4} value={commentText} onChange={onChangeCommentText}/>
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={isAddingComment}>클릭</Button>
          </Form>
          <List
            header={`${post.Comments ? post.Comments.length : 0} 댓글`}
            itemLayout="horizontal"
            dataSource={post.Comments || []}
            renderItem={ item => (
              <li>
                <Comment
                  author={item.User.nickname}
                  avatar={<Avatar>{item.User.nickname[0]}</Avatar>}
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

PostCard.prototypes = {
  post: PropTypes.shape({
    User : PropTypes.object,
    content : PropTypes.string,
    img: PropTypes.string,
    createdAt: PropTypes.object,  
  }),
}

export default PostCard;
```

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

## next와 express 연결하기
[위로가기](#기능-완성해나가기)

#### \front\nodemon.json
```js
{
  "watch": [
    "server.js",
    "nodemon.json"
  ],
  "exec": "node server.js",
  "ext": "js json jsx"
}
```

#### \front\package.json
```json
{
  "name": "react-nodebird-front",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon",
    "build": "next build",
    "start": "next start"
  },
  "author": "LEEKY",
  "license": "MIT",
  "dependencies": {
    "antd": "^3.26.13",
    "axios": "^0.19.2",
    "cookie-parser": "^1.4.5",
    "dotenv": "^8.2.0",
    "express": "^4.17.1",
    "express-session": "^1.17.0",
    "morgan": "^1.10.0",
    "next": "^9.3.4",
    "next-redux-wrapper": "^5.0.0",
    "prop-types": "^15.7.2",
    "react": "^16.13.0",
    "react-dom": "^16.13.0",
    "react-redux": "^7.2.0",
    "react-saga": "^0.3.1",
    "redux": "^4.0.5",
    "redux-saga": "^1.1.3"
  },
  "devDependencies": {
    "babel-eslint": "^10.1.0",
    "eslint": "^5.16.0",
    "eslint-config-airbnb": "^17.1.1",
    "eslint-plugin-import": "^2.20.1",
    "eslint-plugin-jsx-a11y": "^6.2.3",
    "eslint-plugin-react": "^7.19.0",
    "eslint-plugin-react-hooks": "^2.5.0",
    "nodemon": "^2.0.2",
    "webpack": "^4.42.0"
  }
}

```

#### \front\server.js
```js
const express = require('express');
const next = require('next');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const dotenv = require('dotenv');

const dev = process.env.NOCE_ENV !== 'development'; 
const prod = process.env.NOCE_ENV === 'production'; 

const app = next({ dev }); 
const handle = app.getRequestHandler(); 
dotenv.config();

app.prepare().then( () => { 
  
  const server = express(); 
  server.use(morgan('dev'));
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(cookieParser(process.env.COOKIE_SECRET)); 
  server.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })); 

  server.get('*', (req, res) => { 
    return handle(req, res);
  });

  server.listen(3060, () => {
    console.log("next-express running on port 3060");
  })
}); 
```

#### \front\reducers\post.js
```js
export const initialState = {
  mainPosts: [],
  imagePaths: [],
  addPostErrorReason: '',
  isAddingPost: false,
  postAdded: false,
  isAddingComment: false,
  addCommentErrorReason: '',
  commentAdded: false,
};

export const ADD_POST_REQUEST = 'ADD_POST_REQUEST';
export const ADD_POST_SUCCESS = 'ADD_POST_SUCCESS';
export const ADD_POST_FAILURE = 'ADD_POST_FAILURE';

export const LOAD_MAIN_REQUEST = 'LOAD_MAIN_REQUEST';
export const LOAD_MAIN_SUCCESS = 'LOAD_MAIN_SUCCESS';
export const LOAD_MAIN_FAILURE = 'LOAD_MAIN_FAILURE';

export const LOAD_HASHTAG_POSTS_REQUEST = 'LOAD_HASHTAG_POSTS_REQUEST';
export const LOAD_HASHTAG_POSTS_SUCCESS = 'LOAD_HASHTAG_POSTS_SUCCESS';
export const LOAD_HASHTAG_POSTS_FAILURE = 'LOAD_HASHTAG_POSTS_FAILURE';

export const LOAD_USER_POSTS_REQUEST = 'LOAD_USER_POSTS_REQUEST';
export const LOAD_USER_POSTS_SUCCESS = 'LOAD_USER_POSTS_SUCCESS';
export const LOAD_USER_POSTS_FAILURE = 'LOAD_USER_POSTS_FAILURE';

export const UPLOAD_IMAGES_REQUEST = 'UPLOAD_IMAGES_REQUEST';
export const UPLOAD_IMAGES_SUCCESS = 'UPLOAD_IMAGES_SUCCESS';
export const UPLOAD_IMAGES_FAILURE = 'UPLOAD_IMAGES_FAILURE';

export const REMOVE_IMAGE = 'REMOVE_IMAGE';

export const LIKE_POST_REQUEST = 'LIKE_POST_REQUEST';
export const LIKE_POST_SUCCESS = 'LIKE_POST_SUCCESS';
export const LIKE_POST_FAILURE = 'LIKE_POST_FAILURE';

export const UNLIKE_POST_REQUEST = 'UNLIKE_POST_REQUEST';
export const UNLIKE_POST_SUCCESS = 'UNLIKE_POST_SUCCESS';
export const UNLIKE_POST_FAILURE = 'UNLIKE_POST_FAILURE';

export const ADD_COMMENT_REQUEST = 'ADD_COMMENT_REQUEST';
export const ADD_COMMENT_SUCCESS = 'ADD_COMMENT_SUCCESS';
export const ADD_COMMENT_FAILURE = 'ADD_COMMENT_FAILURE';

export const LOAD_COMMENTS_REQUEST = 'LOAD_COMMENTS_REQUEST';
export const LOAD_COMMENTS_SUCCESS = 'LOAD_COMMENTS_SUCCESS';
export const LOAD_COMMENTS_FAILURE = 'LOAD_COMMENTS_FAILURE';

export const RETWEET_REQUEST = 'RETWEET_REQUEST';
export const RETWEET_SUCCESS = 'RETWEET_SUCCESS';
export const RETWEET_FAILURE = 'RETWEET_FAILURE';

export const REMOVE_POST_REQUEST = 'REMOVE_POST_REQUEST';
export const REMOVE_POST_SUCCESS = 'REMOVE_POST_SUCCESS';
export const REMOVE_POST_FAILURE = 'REMOVE_POST_FAILURE';

export const UPDATE_POST_REQUEST = 'UPDATE_POST_REQUEST';
export const UPDATE_POST_SUCCESS = 'UPDATE_POST_SUCCESS';
export const UPDATE_POST_FAILURE = 'UPDATE_POST_FAILURE';

export const LOAD_MAIN_POSTS_REQUEST = 'LOAD_MAIN_POSTS_REQUEST';
export const LOAD_MAIN_POSTS_SUCCESS = 'LOAD_MAIN_POSTS_SUCCESS';
export const LOAD_MAIN_POSTS_FAILURE = 'LOAD_MAIN_POSTS_FAILURE';


export default (state = initialState, action) => {
  switch (action.type) {
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
    case LOAD_MAIN_POSTS_REQUEST: {
      return {
        ...state,
        mainPosts: [],
      };
    }
    case LOAD_MAIN_POSTS_SUCCESS: {
      return {
        ...state,
        mainPosts: action.data,
      };
    }
    case LOAD_MAIN_POSTS_FAILURE: {
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

export const initialState = {
  isLoggingOut : false,
  isLogginIn : false,
  LoginInErrorReason: '',
  signedUp: false,
  isSigningUp: false,
  isSignedUp : false,
  signUpErrorReason: '',
  isSignUpSuccesFailure: false,
  me: null,
  followingList : [],
  followerList: [],
  userInfo: [],
};

export const SIGN_UP_REQUEST = 'SIGN_UP_REQUEST';
export const SIGN_UP_SUCCESS = 'SIGN_UP_SUCCESS';
export const SIGN_UP_FAILURE = 'SIGN_UP_FAILURE';

export const LOG_IN_REQUEST = 'LOG_IN_REQUEST';
export const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS';
export const LOG_IN_FAILURE = 'LOG_IN_FAILURE';

export const LOAD_USER_REQUEST = 'LOAD_USER_REQUEST';
export const LOAD_USER_SUCCESS = 'LOAD_USER_SUCCESS';
export const LOAD_USER_FAILURE = 'LOAD_USER_FAILURE';

export const LOG_OUT_REQUEST = 'LOG_OUT_REQUEST';
export const LOG_OUT_SUCCESS = 'LOG_OUT_SUCCESS';
export const LOG_OUT_FAILURE = 'LOG_OUT_FAILURE';

export const FOLLOW_USER_REQUEST = 'FOLLOW_USER_REQUEST';
export const FOLLOW_USER_SUCCESS = 'FOLLOW_USER_SUCCESS';
export const FOLLOW_USER_FAILURE = 'FOLLOW_USER_FAILURE';

export const LOAD_FOLLOW_REQUEST = 'LOAD_FOLLOW_REQUEST';
export const LOAD_FOLLOW_SUCCESS = 'LOAD_FOLLOW_SUCCESS';
export const LOAD_FOLLOW_FAILURE = 'LOAD_FOLLOW_FAILURE';

export const UNFOLLOW_USER_REQUEST = 'UNFOLLOW_USER_REQUEST';
export const UNFOLLOW_USER_SUCCESS = 'UNFOLLOW_USER_SUCCESS';
export const UNFOLLOW_USER_FAILURE = 'UNFOLLOW_USER_FAILURE';

export const REMOVE_USER_REQUEST = 'REMOVE_USER_REQUEST';
export const REMOVE_USER_SUCCESS = 'REMOVE_USER_SUCCESS';
export const REMOVE_USER_FAILURE = 'REMOVE_USER_FAILURE';

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


## getInitialProps로 서버 데이터 받기
[위로가기](#기능-완성해나가기)

#### \front\components\AppLayout.js (파일 명만 바꿔주기)
App.Layout(전) -> AppLayout(후) 

#### \front\pages\_app.js
```js
import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import WithRedux from 'next-redux-wrapper';
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
  console.log(ctx);
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
  sagaMiddleware.run(rootSaga); 
  return store;
}

export default WithRedux(configureStore)(NodeBird);
```

#### \front\pages\hashtag.js
```js
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_HASHTAG_POSTS_REQUEST } from '../reducers/post';
import PostCard from '../components/PostCard';

const Hashtag = ({ tag }) => {
  const dispatch = useDispatch();
  const { mainPosts } = useSelector(state => state.post);

  useEffect(() => {
    dispatch({
      type: LOAD_HASHTAG_POSTS_REQUEST,
      data: tag,
    });
  }, []);
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
  console.log('hashtag getInitialProps', context.query.tag);
  return { tag: context.query.tag };
};

export default Hashtag;
```

#### \front\pages\user.js
```js
import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Card } from 'antd';
import { LOAD_USER_POSTS_REQUEST } from '../reducers/post';
import { LOAD_USER_REQUEST } from '../reducers/user';
import PostCard from '../components/PostCard';

const User = ({ id }) => {
  const dispatch = useDispatch();
  const { mainPosts } = useSelector(state => state.post);
  const { userInfo } = useSelector(state => state.user);

  useEffect(() => {
    dispatch({
      type: LOAD_USER_REQUEST,
      type: id
    })
    dispatch({
      type: LOAD_USER_POSTS_REQUEST,
      data: id,
    });
  }, []);
  
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
      {mainPosts.map(c => {
        <PostCard key={+c.createdAt} post={c} />
      })}
    </div>
  );
};

User.propTypes = {
  id: PropTypes.number.isRequired,
}

User.getInitialProps = async (context) => {
  console.log('user getInitialProps', context.query.id);
  return { id : parseInt(context.query.id, 10) } 
};

export default User;

```

#### \front\server.js
```js
const express = require('express');
const next = require('next');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const dotenv = require('dotenv');

const dev = process.env.NODE_ENV !== 'production';
const prod = process.env.NODE_ENV === 'production';

const app = next({ dev });
const handle = app.getRequestHandler();
dotenv.config();

app.prepare().then(() => {
  const server = express();

  server.use(morgan('dev'));
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(cookieParser(process.env.COOKIE_SECRET));
  server.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  }));

  server.get('/hashtag/:tag', (req, res) => {
    return app.render(req, res, '/hashtag', { tag: req.params.tag });
  });

  server.get('/user/:id', (req, res) => {
    return app.render(req, res, '/user', { id: req.params.id });
  });

  server.get('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3060, () => {
    console.log('next+express running on port 3060');
  });
});
```


#### \front\components\PostCard.js (수정하였음)
```js
import React, { useState, useCallback, useEffect } from 'react';
import { Card, Icon, Button, Avatar, Form, Input, List, Comment } from 'antd';
import Link from 'next/link'
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { ADD_COMMENT_REQUEST } from '../reducers/post';

const PostCard = ({post}) => {

  const [commentFormOpened, setCommentFormOpened] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { me } = useSelector(state => state.user);
  const { commentAdded, isAddingComment } = useSelector(state => state.post);
  const dispatch = useDispatch();

  const onToggleComment = useCallback(() => {
    setCommentFormOpened(prev => !prev);
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
      }
    })
    
  }, [me && me.id]);

  useEffect(() => {
    if (commentAdded) {
      setCommentText('');
    }
  }, [commentAdded]);

  // useEffect(() => {
  //   setCommentText('');
  // }, [commentAdded === true]);

  const onChangeCommentText = useCallback((e) => {
    setCommentText(e.target.value);
  }, []);

  return (
    <div>
      <Card
        key={+post.createdAt}
        cover={post.img && <img alt="example" src={post.img} />}
        actions={[
          <Icon type="retweet" key="retweet" />,
          <Icon type="heart" key="heart" />,
          <Icon type="message" key="message" onClick={onToggleComment} />,
          <Icon type="ellipsis" key="ellipsis" />,
        ]}
        extra={<Button>팔로우</Button>}
      >
        <Card.Meta 
          avatar={<Avatar>{post.User.nickname[0]}</Avatar>}
          title={post.User.nickname}
          description={(
            <div>
              {post.content.split(/(#[^\s]+)/g).map((v, i) => {
                if (v.match(/#[^\s]+/)) {
                  return (
                    <Link 
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
      </Card>
      {commentFormOpened && (
        <>
          <Form onSubmit={onSubmitComment}>
            <Form.Item>
              <Input.TextArea rows={4} value={commentText} onChange={onChangeCommentText}/>
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={isAddingComment}>클릭</Button>
          </Form>
          <List
            header={`${post.Comments ? post.Comments.length : 0} 댓글`}
            itemLayout="horizontal"
            dataSource={post.Comments || []}
            renderItem={ item => (
              <li>
                <Comment
                  author={item.User.nickname}
                  avatar={<Avatar>{item.User.nickname[0]}</Avatar>}
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

PostCard.prototypes = {
  post: PropTypes.shape({
    User : PropTypes.object,
    content : PropTypes.string,
    img: PropTypes.string,
    createdAt: PropTypes.object,  
  }),
}

export default PostCard;
```