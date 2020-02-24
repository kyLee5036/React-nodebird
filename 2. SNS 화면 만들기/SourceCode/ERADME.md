# SNS 화면 만들기

+ [App.js로 레이아웃 분리하기](#App.js로-레이아웃-분리하기)
+ [prop-types](#prop-types)
+ [antd 그리드 시스템](#antd-그리드-시스템)
+ [커스텀 훅 사용하기](#커스텀-훅-사용하기)
+ [메인 화면 만들기](#메인-화면-만들기)
+ [프로필 화면 만들기](#프로필-화면-만들기)
+ [컴포넌트 분리 하기](#컴포넌트-분리-하기)


## App.js로 레이아웃 분리하기
[위로가기](#SNS-화면-만들기)

#### pages/_app.js
```js
import React from 'react';
import Head from 'next/head';
import AppLayout from '../components/App.Layout';

const NodeBird = ({Component}) => {
  return (
    <>
      <Head>
        <title>NodeBird</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
      </Head>
      <AppLayout>
        <Component />
      </AppLayout>
    </>
  );
};

export default NodeBird;
```

#### pages/index.js
```js
import React from 'react';

const Home = () => {
  return (
    <>
      <div>Hello, Next!</div>
    </>
  );
};

export default Home;
```

#### pages/profile.js
```js
import React from 'react';

const Profile = () => {
  return (
    <>
      <div>내 프로필</div>
    </>
  );
};

export default Profile;
```

#### pages/signup.js
```js
import React, { useState, useCallback } from 'react';
import { Form, Input, Checkbox, Button } from 'antd';

const Signup = () => {

  const [passwordCheck, setPasswordCheck] = useState('');
  const [term, setTerm] = useState(false); // 약관 동의 (체크박스)
  const [passwordError, setPasswordError] = useState(false); // 비밀번호 에러
  const [termError, setTermError] = useState(false); // 약간 동의 안 할 경우

  // 커스텀 훅이다. 기존의 후을 사용해서 새로운 훅을 만들어낸다.
  const useInput = (initValue = null) => {
    const [value, setter] = useState(initValue);
    const handler = useCallback((e) => {
      setter(e.target.value);
    }, []);
    return [value, handler];
  };
  const [id, onChangeId] = useInput(''); // 사용예시
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
  }, [password, passwordCheck, term]);
  
  const onChangePasswordCheck = useCallback((e) => {
    setPasswordError(e.target.value !== password); 
    setPasswordCheck(e.target.value);
  }, [password]); // 함수 내부에서 쓰는 state를 deps 배열로 넣어야한다.
  const onChangeTerm = useCallback((e) => {
    setTermError(false);
    setTerm(e.target.checked);
  }, []); // 함수 내부에서 쓰는 state를 deps 배열로 넣어야한다.

  
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
          <Checkbox name="user-term" value={term} onChange={onChangeTerm}>약관 동의</Checkbox>
          { termError && <div style={{color : 'red'}}>약관에 동의하셔야 합니다.</div> }
        </div>
        <div style={{ marginTop : 10}}>
          <Button type="primary" htmlType="submit">가입하기</Button>
        </div>
      </Form>
    </>
  );
};

export default Signup;
```

## prop types 
[위로가기](#SNS-화면-만들기)


#### pages/_app.js
```js
import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import AppLayout from '../components/App.Layout';

const NodeBird = ({Component}) => {
  return (
    <>
      <Head>
        <title>NodeBird</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
      </Head>
      <AppLayout>
        <Component />
      </AppLayout>
    </>
  );
};

NodeBird.prototype = {
  Component : PropTypes.elementType // node는 js에 들어갈 수 있는 모든 것 (컴포넌트, 숫자, boolean, 함수 등등)
  // elementType으로 수정해야한다.
}

export default NodeBird;
```

#### component/App.Layout.js
```js
import React from 'react';
import { Menu, Input, Button } from 'antd';
import Link from 'next/link'
import PropTypes from 'prop-types';

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
      <Link href="/signup"><a><Button>회원가입</Button></a></Link>
      {children}
    </div>
  );
};

AppLayout.prototype = {
  children: PropTypes.node,
}

export default AppLayout;
```

## antd 그리드 시스템
[위로가기](#SNS-화면-만들기)

#### components/App.Layout.js
```js
import React from 'react';
import { Menu, Input, Button, Row, Col, Card, Avatar} from 'antd';
import Link from 'next/link'
import PropTypes from 'prop-types';

const dummy = {
  nickname: 'LEEKY',
  Post: [],
  Followings: [],
  Followers: [],
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
          <Card
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
          <Link href="/signup"><a><Button>회원가입</Button></a></Link>
         
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
```

#### pages/_app.js
```js
import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import AppLayout from '../components/App.Layout';

const NodeBird = ({Component}) => {
  return (
    <>
      <Head>
        <title>NodeBird</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
      </Head>
      <AppLayout>
        <Component />
      </AppLayout>
    </>
  );
};

NodeBird.prototype = {
  Component : PropTypes.elementType,
}

export default NodeBird;
```

## 커스텀 훅 사용하기
[위로가기](#SNS-화면-만들기)

#### components/App.Layout.js
```js
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
```

#### components/LoginForm.js
```js
import React, { useState, useCallback } from 'react'
import { Form, Input, Button} from 'antd';
import Link from 'next/link';
import {useInput} from '../pages/signup'

const LoginForm = () => {
  
  const [id, onChangeId] = useInput('');
  const [password, onChangePassword] = useInput('');

  const onsubmitForm = useCallback((e) => {
    e.preventDefault();
    console.log({id, password});
  }, [id, password]); // 자식 컴포넌트 넘겨주는 것은 무조건 useCallback을 해준다.

  return (
    <Form onSubmit={onsubmitForm}>
      <div>
        <label htmlFor="user-id">아이디</label>
        <br />
        <Input name="user-id" value={id} onChange={onChangeId} required />
      </div>
      <div>
        <label htmlFor="user-password">비밀번호</label>
        <br />
        <Input name="user-password" value={password} onChange={onChangePassword} type="password" required />
      </div>
      <div>
        <Button type="primary" htmlType="submit" loading={false}>로그인</Button>
        <Link href="/signup"><a><Button>회원가입</Button></a></Link>
      </div>
    </Form>
  )
}

export default LoginForm;
```

#### pages/signup.js
```js
import React, { useState, useCallback } from 'react';
import { Form, Input, Checkbox, Button } from 'antd';
import PropTypes from 'prop-types';

// 모듈을 만들어서 재 사용을 하겠다. export를 사용해주기!!!
export const useInput = (initValue = null) => {
  const [value, setter] = useState(initValue);
  const handler = useCallback((e) => {
    setter(e.target.value);
  }, []);
  return [value, handler];
};

const Signup = () => {
...생략
};

export default Signup;
```

## 메인 화면 만들기
[위로가기](#SNS-화면-만들기)

#### pages\index.js
```js
import React from 'react';
import { Form, Input, Button, Card, Icon, Avatar } from 'antd';

const dummy = {
  isLoggedIn : true,
  imagePaths: [],
  mainPosts: [{
    User: {
      id : 1,
      nickname : 'LEEKY',
    },
    content: '첫번 째 게시글',
    // img는 img예시로 넣어주었다. 저작권이 없는 거라서 괜찮음.
    img: 'https://img.freepik.com/free-photo/hooded-computer-hacker-stealing-information-with-laptop_155003-1918.jpg?size=664&ext=jpg',
  }],
}

const Home = () => {
  return (
    <div>
      {dummy.isLoggedIn  
      && <Form style={{ marginBottom: 20 }} encType="multipart/fomr-data">
          <Input.TextArea maxLength={140} placeholder="어떤 신기한 일이 있었나요?" />  
          <div>
            <input type="file" multiple hidden />
            <Button>이미지 업로드</Button>
            <Button type="primary" style={{ float : 'right'}} htmlType="submit">업로드</Button>
          </div>
          <div>
            {dummy.imagePaths.map((v, i) => {
              return (
                <div key={v} style={{ display: 'inline-black' }}>
                  <img src={'http://localhost:3065/' + v} style={{ width : '200px' }} alt={v} />
                  <div>
                    <Button>제거</Button>
                  </div>
                </div>
              )
            })}  
          </div>  
      </Form>}
      {dummy.mainPosts.map((c) => {
        // 게시글 나오는 화면
        return (
          <Card
            key={+c.createAt}
            cover={c.img && <img alt="example" src={c.img} />}
            actions={[
              <Icon type="retweet" key="retweet" />,
              <Icon type="heart" key="heart" />,
              <Icon type="message" key="message" />,
              <Icon type="ellipsis" key="ellipsis" />,
            ]}
            extra={<Button>팔로우</Button>}
          >
           {/* 카드 세부 정보  */}
            <Card.Meta 
              avatar={<Avatar>{c.User.nickname[0]}</Avatar>}
              title={c.User.nickname}
              description={c.content}
            />
          </Card>
        )
      })}
    </div>
  );
};

export default Home;
```

#### front\components\LoginForm.js
```js
...생략
  return (
    <Form onSubmit={onsubmitForm} style={{ padding : '10px' }}> // 여기만 추가함
      ...생략
    </Form>
  )
}

export default LoginForm;
```

#### components\App.Layout.js
```js
...생략
const AppLayout = ({ children }) => {
  return (
    <div>
      ...생략
      <Row gutter={10} > // gutter만 추가함
        ...생략
      </Row>
    </div>
  );
};

AppLayout.prototype = {
  children: PropTypes.node,
}

export default AppLayout;
```

## 프로필 화면 만들기]
[위로가기](#SNS-화면-만들기)


#### \pages\profile.js
```js
import React from 'react';
import {Form, Input, Button, List, Card, Icon} from 'antd';

const Profile = () => {
  return (
    <div>
      <Form style={{ marginBottom: '20px', border: '1px solid #d9d9d9', padding: '20px' }}>
        <Input addonBefore="닉네임" />
        <Button type="primary">수정</Button>
      </Form>

      {/* 팔로워 목록 */}
      <List
        style={{ marginBottom: '20px'}}
        grid={{ gutter:4, xs:2, md: 3}} // 아이템들에 간격을 해준다 (디자인)
        size="small" // 사이즈는 작게 (디자인)
        header={<div>팔로워 목록</div>} 
        loadMore={<Button style={{width: '100%'}}>더 보기</Button>} // 더보기 버튼
        bordered // 테두리 디자인 옵션
        dataSource={['영이', '건이', '얏호']} // 실제 안에 들어 갈 데이터들
        renderItem={ item => (
          <List.Item style={{ marginTop: '20px'}}>
            {/* 배열 안에 jsx를 사용할 떄에는 key를 꼭!! 넣어여한다. 밑에 키 안에 stop이 있다. */}
            <Card actions={[<Icon type="stop" key="stop" />]}><Card.Meta description={item} /></Card>
          </List.Item>
        )}
      />

      {/* 팔로잉 목록 */}
      <List
        style={{ marginBottom: '20px'}}
        grid={{ gutter:4, xs:2, md: 3}} // 아이템들에 간격을 해준다 (디자인)
        size="small" // 사이즈는 작게 (디자인)
        header={<div>팔로잉 목록</div>} 
        loadMore={<Button style={{width: '100%'}}>더 보기</Button>} // 더보기 버튼
        bordered // 테두리 디자인 옵션
        dataSource={['영이', '건이', '얏호']} // 실제 안에 들어 갈 데이터들
        renderItem={ item => (
          <List.Item style={{ marginTop: '20px'}}>
            {/* Card.Meta가 dataSource에 데이터를 사용하는 것 */}
            <Card actions={[<Icon type="stop" key="stop" />]}><Card.Meta description={item} /></Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default Profile;
```


## 컴포넌트 분리 하기
[위로가기](#SNS-화면-만들기)


#### \front\pages\index.js
```js
import React from 'react';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';

const dummy = {
  isLoggedIn : true,
  imagePaths: [],
  mainPosts: [{
    User: {
      id : 1,
      nickname : 'LEEKY',
    },
    content: '첫번 째 게시글',
    // img는 img예시로 넣어주었다. 저작권이 없는 거라서 괜찮음.
    img: 'https://img.freepik.com/free-photo/hooded-computer-hacker-stealing-information-with-laptop_155003-1918.jpg?size=664&ext=jpg',
  }],
}

const Home = () => {
  return (
    <div>
      {dummy.isLoggedIn && <PostForm /> }
      {dummy.mainPosts.map((c) => {
        // 게시글 나오는 화면
        return (
          <PostCard key={c} post={c} />
        )
      })}
    </div>
  );
};

export default Home;
```


#### \front\pages\profile.js
```js
import React from 'react';
import {Form, Input, Button, List, Card, Icon} from 'antd';
import NickNameEditForm from '../components/NickNameEditForm';

const Profile = () => {
  return (
    <div>
      <NickNameEditForm />

      {/* 팔로워 목록 */}
      <List
        style={{ marginBottom: '20px'}}
        grid={{ gutter:4, xs:2, md: 3}} // 아이템들에 간격을 해준다 (디자인)
        size="small" // 사이즈는 작게 (디자인)
        header={<div>팔로워 목록</div>} 
        loadMore={<Button style={{width: '100%'}}>더 보기</Button>} // 더보기 버튼
        bordered // 테두리 디자인 옵션
        dataSource={['영이', '건이', '얏호']} // 실제 안에 들어 갈 데이터들
        renderItem={ item => (
          <List.Item style={{ marginTop: '20px'}}>
            {/* 배열 안에 jsx를 사용할 떄에는 key를 꼭!! 넣어여한다. 밑에 키 안에 stop이 있다. */}
            <Card actions={[<Icon type="stop" key="stop" />]}><Card.Meta description={item} /></Card>
          </List.Item>
        )}
      />

      {/* 팔로잉 목록 */}
      <List
        style={{ marginBottom: '20px'}}
        grid={{ gutter:4, xs:2, md: 3}} // 아이템들에 간격을 해준다 (디자인)
        size="small" // 사이즈는 작게 (디자인)
        header={<div>팔로잉 목록</div>} 
        loadMore={<Button style={{width: '100%'}}>더 보기</Button>} // 더보기 버튼
        bordered // 테두리 디자인 옵션
        dataSource={['영이', '건이', '얏호']} // 실제 안에 들어 갈 데이터들
        renderItem={ item => (
          <List.Item style={{ marginTop: '20px'}}>
            {/* Card.Meta가 dataSource에 데이터를 사용하는 것 */}
            <Card actions={[<Icon type="stop" key="stop" />]}><Card.Meta description={item} /></Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default Profile;
```


#### \front\components\App.Layout.js
```js
import React from 'react';
import { Menu, Input, Row, Col} from 'antd';
import Link from 'next/link'
import PropTypes from 'prop-types';
import LoginForm from './LoginForm';
import UserProfile from './UserProfile';

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
      <Row gutter={10} >
        <Col xs={24} md={6} >
          {dummy.isLoggedIn 
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

AppLayout.prototype = {
  children: PropTypes.node,
}

export default AppLayout;
```


#### \front\components\LoginForm.js
```js
....생략
const LoginForm = () => {
  ....생략
      <div style={{marginTop: '10px'}}> //  이거 하나만 추가하면 된다...
        <Button type="primary" htmlType="submit" loading={false}>로그인</Button>
        <Link href="/signup"><a><Button>회원가입</Button></a></Link>
      </div>
    </Form>
  )
}

export default LoginForm;
```


#### \front\components\NickNameEditForm.js
```js
import React from 'react';
import { Form, Input, Button } from 'antd';

const NickNameEditForm = () => {
  return (
    <Form style={{ marginBottom: '20px', border: '1px solid #d9d9d9', padding: '20px' }}>
      <Input addonBefore="닉네임" />
      <Button type="primary">수정</Button>
    </Form>
  )
}

export default NickNameEditForm;
```


#### \front\components\PostCard.js
```js
import React from 'react';
import { Card, Icon, Button, Avatar } from 'antd';
import PropTypes from 'prop-types';

const PostCard = ({post}) => {
  return (
    <Card
      key={+post.createAt}
      cover={post.img && <img alt="example" src={post.img} />}
      actions={[
        <Icon type="retweet" key="retweet" />,
        <Icon type="heart" key="heart" />,
        <Icon type="message" key="message" />,
        <Icon type="ellipsis" key="ellipsis" />,
      ]}
      extra={<Button>팔로우</Button>}
    >
      {/* 카드 세부 정보  */}
      <Card.Meta 
        avatar={<Avatar>{post.User.nickname[0]}</Avatar>}
        title={post.User.nickname}
        description={post.content}
      />
    </Card>
  )
}

PostCard.prototypes = {
  post: PropTypes.shape({ // shape가 객체이다.
    User : PropTypes.object,
    content : PropTypes.string,
    img: PropTypes.string,
    createAt: PropTypes.object,  
  }),
}

export default PostCard;
```


#### \front\components\PostForm.js
```js
import React from 'react';
import { Form, Input, Button } from 'antd';

const dummy = {
  isLoggedIn : true,
  imagePaths: [],
  mainPosts: [{
    User: {
      id : 1,
      nickname : 'LEEKY',
    },
    content: '첫번 째 게시글',
    // img는 img예시로 넣어주었다. 저작권이 없는 거라서 괜찮음.
    img: 'https://img.freepik.com/free-photo/hooded-computer-hacker-stealing-information-with-laptop_155003-1918.jpg?size=664&ext=jpg',
  }],
}

const PostForm = () => {
  return (
    <Form style={{ margin: '10px 0 20px' }} encType="multipart/fomr-data">
      <Input.TextArea maxLength={140} placeholder="어떤 신기한 일이 있었나요?" />  
      <div>
        <input type="file" multiple hidden />
        <Button>이미지 업로드</Button>
        <Button type="primary" style={{ float : 'right'}} htmlType="submit">업로드</Button>
      </div>
      <div>
        {dummy.imagePaths.map((v, i) => {
          return (
            <div key={v} style={{ display: 'inline-black' }}>
              <img src={'http://localhost:3065/' + v} style={{ width : '200px' }} alt={v} />
              <div>
                <Button>제거</Button>
              </div>
            </div>
          )
        })}  
      </div>  
  </Form>
  )
}

export default PostForm;
```


#### \front\components\UserProfile.js
```js
import React from 'react';

const dummy = {
  nickname: 'LEEKY',
  Post: [],
  Followings: [],
  Followers: [],
  isLoggedIn : false,
}

const UserProfile = () => {
  return (
    <Card
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
  )
}

export default UserProfile;
```



