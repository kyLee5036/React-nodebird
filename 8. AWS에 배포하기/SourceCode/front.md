# AWS에 배포하기
  
  - [favicon 서빙과 prefetch](#favicon-서빙과-prefetch)
  




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