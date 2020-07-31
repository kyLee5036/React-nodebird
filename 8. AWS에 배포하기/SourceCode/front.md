# AWS에 배포하기
  
  - [favicon 서빙과 prefetch](#favicon-서빙과-prefetch)
  - [next.config.js](#next.config.js)
  - [next bundle analyzer](#next-bundle-analyzer)
  




## favicon 서빙과 prefetch
[위로가기](#AWS에-배포하기)

#### \front\public\favicon.ico
**favicon.ico 추가**

#### \front\components\AppLayout.js
```js
import React, { useEffect } from 'react';
import { Menu, Input, Row, Col} from 'antd';
import Link from 'next/link'
import PropTypes from 'prop-types';
import Router from 'next/router';
import LoginForm from './LoginForm';
import UserProfile from './UserProfile';
import { useSelector, useDispatch } from 'react-redux';


const AppLayout = ({ children }) => {
  const { me } = useSelector(state => state.user);

  const onSearch = (value) => {
    Router.push({ pathname: '/hashtag', query: {tag: value} }, `/hashtag/${value}`);
  };

  return (
    <div>
      <Menu mode="horizontal">
        <Menu.Item key="home"><Link href="/"><a>노드버드</a></Link></Menu.Item>
        <Menu.Item key="profile"><Link href="/profile" prefetch><a>프로필</a></Link></Menu.Item>
          <Menu.Item key="mail">
            <Input.Search 
              enterButton 
              style={{ verticalAlign : 'middle' }}
              onSearch={onSearch}
            />
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

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AppLayout;
```

#### \front\components\UserProfile.js
```js
import React, { useCallback } from 'react';
import Link from 'next/link';
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
      <Link href="/profile" prefetch key="twit">
        <a>
          <div>짹짹<br />{me.Posts.length}</div>
        </a>
      </Link>,
      <Link href="/profile" prefetch key="following">
        <a>
          <div>팔로잉<br />{me.Followings.length}</div>
        </a>
      </Link>,
      <Link href="/profile" prefetch key="follower">
        <a>
          <div>팔로워<br />{me.Followers.length}</div>
        </a>
      </Link>,
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

## next.config.js
[위로가기](#AWS에-배포하기)

#### next.config.js
```js
module.exports = {
  distDir: '.next',
  webpack(config) {
    console.log('rules', config.module.rules[0]);
    const prod = process.env.NODE_ENV === 'production';
    return {
      ...config,
      mode: prod ? 'production' : 'development',
      devtool: prod ? 'hidden-source-map' : 'eval',
    };
  },
};

```

## next bundle analyzer
[위로가기](#AWS에-배포하기)

#### \front\next.config.js
```js
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');

module.exports = withBundleAnalyzer({
  analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
  analyzeBrowser: ['browser', 'both'].includes(process.env.BUNDLE_ANALYZE),
  bundleAnalyzerConfig: {
    server: {
      analyzerMode: 'static',
      reportFilename: '../bundles/server.html'
    },
    browser: {
      analyzerMode: 'static',
      reportFilename: '../bundles/client.html'
    }
  },
  distDir: '.next',
  webpack(config) {
    console.log('rules', config.module.rules[0]);
    const prod = process.env.NODE_ENV === 'production';
    return {
      ...config,
      mode: prod ? 'production' : 'development',
      devtool: prod ? 'hidden-source-map' : 'eval',
    };
  },
});

```

#### \front\package.json
```js
{
  "name": "react-nodebird-front",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon",
    "build": "cross-env BUNDLE_ANALYZE=both next build",
    "start": "cross-env NODE_ENV=production next start"
  },
  "author": "LEEKY",
  "license": "MIT",
  "dependencies": {
    "@zeit/next-bundle-analyzer": "^0.1.2",
    "antd": "^3.26.13",
    "axios": "^0.19.2",
    "cookie-parser": "^1.4.5",
    "cross-env": "^7.0.2",
    "dotenv": "^8.2.0",
    "express": "^4.17.1",
    "express-session": "^1.17.0",
    "immer": "^6.0.3",
    "morgan": "^1.10.0",
    "next": "^8.1.0",
    "next-redux-saga": "^4.1.2",
    "next-redux-wrapper": "^5.0.0",
    "prop-types": "^15.7.2",
    "react": "^16.13.0",
    "react-dom": "^16.13.0",
    "react-helmet": "^5.2.1",
    "react-redux": "^7.2.0",
    "react-saga": "^0.3.1",
    "redux": "^4.0.5",
    "redux-saga": "^1.1.3",
    "styled-components": "^4.4.1"
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