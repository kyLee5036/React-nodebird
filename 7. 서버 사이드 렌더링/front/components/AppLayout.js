import React, { useEffect } from 'react';
import { Menu, Input, Row, Col} from 'antd';
import Link from 'next/link'
import PropTypes from 'prop-types';
import LoginForm from './LoginForm';
import UserProfile from './UserProfile';
import { useSelector, useDispatch } from 'react-redux';
import { LOAD_USER_REQUEST } from '../reducers/user';


const AppLayout = ({ children }) => {
  const { me } = useSelector(state => state.user);
  const dispatch = useDispatch();

  useEffect( () => {
    if (!me) {
      dispatch({
        type: LOAD_USER_REQUEST
      });
    }
  }, []);

  return (
    <div>
      <Menu mode="horizontal">
        <Menu.Item key="home"><Link href="/"><a>노드버드</a></Link></Menu.Item>
        <Menu.Item key="profile"><Link href="/profile"><a>프로필</a></Link></Menu.Item>
         <Menu.Item key="mail">
            <Input.Search enterButton style={{ verticalAlign : 'middle' }} />
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

AppLayout.prototypes = {
  children: PropTypes.node,
}

export default AppLayout;