import React from 'react';
import { Menu, Input, Row, Col, Card, Avatar} from 'antd';
import Link from 'next/link'
import PropTypes from 'prop-types';
import LoginForm from './LoginForm';

const dummy = {
  nickname: 'LEEKY',
  Post: [],
  Followings: [],
  Followers: [],
  isLoggedIn : false,
}

const AppLayout = ({ children }) => {
  return (
    <div>
      <Menu mode="horizontal">
        <Menu.Item key="home"><Link href="/"><a>노드버드</a></Link></Menu.Item>
        <Menu.Item key="profile"><Link href="/profile"><a>프로필</a></Link></Menu.Item>
         <Menu.Item key="mail">
            <Input.Search enterButton style={{ verticalAlign : 'middle' }} />
        </Menu.Item>
      </Menu>
      <Row>
        <Col xs={24} md={6} >
          {dummy.isLoggedIn 
          ? <Card
            actions={[
              <div key="twit">짹짹<br />{dummy.Post.legnth}</div>,
              <div key="following">팔로잉<br />{dummy.Followings.legnth}</div>,
              <div key="follower">팔로워<br />{dummy.Followers.legnth}</div>,
            ]}>
            <Card.Meta 
              avatar={<Avatar>{dummy.nickname[0]}</Avatar>} // 앞 급잘
              title={dummy.nickname}
            />
          </Card> 
          : 
          <LoginForm />
        }   
        </Col> 
        <Col xs={24} md={12} >
          {children}
        </Col>
        <Col xs={24} md={6} >세번쨰</Col>
      </Row>
    </div>
  );
};

AppLayout.prototype = {
  children: PropTypes.node,
}

export default AppLayout;