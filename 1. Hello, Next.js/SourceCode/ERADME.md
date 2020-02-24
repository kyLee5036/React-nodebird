# Hello NextJS

+ [프로젝트 구조와 배우는 것들](#프로젝트-구조와-배우는-것들)
+ [next와 eslint 설치하기](#next와-eslint-설치하기)
+ [next 라우팅 시스템](#next-라우팅-시스템)
+ [ant design 적용하기](#ant-design-적용하기)
+ [기본 페이지들 만들기](#기본-페이지들-만들기)
+ [회원가입 폼 만들기](#회원가입-폼-만들기)
+ [회원가입 state와 custom hook](#회원가입-state와-custom-hook)


## next 라우팅 시스템
[위로 가기](#Hello-NextJS)

#### pages/user/create.js
```js
import React from 'react';

const Create = () => {
  return (
    <div>유저를 만들어봅시다.</div>
  )
}

export default Create;
```

#### pages/index.js
```js
import React from 'react';
import Link from 'next/link'; 

const Home = () => {
  return (
    <>
      <Link href="/about"><a>about</a></Link> 
      <div>Hello, Next!</div>
    </>
  );
};

export default Home;
```

#### pages/about.js
```js
import React from 'react';

const about = () => {
  return (
    <div>about.</div>
  )
}

export default about;
```

## ant design 적용하기
[위로 가기](#Hello-NextJS)


#### components/App.Layout.js
```js
import React from 'react';
import { Menu, Input } from 'antd';

const AppLayout = ({ children }) => {
  return (
    <div>
      <Menu mode="horizontal">
        <Menu.Item key="home">노드버드</Menu.Item>
        <Menu.Item key="profile">프로필</Menu.Item>
         <Menu.Item key="mail">
            <Input.Search enterButton style={{ verticalAlign : 'middle' }} />
        </Menu.Item>
      </Menu>
      {children}
    </div>
  );
};

export default AppLayout;
```

#### pages/index.js
```js
import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import AppLayout from '../components/App.Layout'

const Home = () => {
  return (
    <>
      <Head>
        <title>NodeBird</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
      </Head>
       <AppLayout> 
        <Link href="/about"><a>about</a></Link>  
        <div>Hello, Next!</div>
      </AppLayout>
    </>
  );
};

export default Home;
```


## 기본 페이지들 만들기
[위로 가기](#Hello-NextJS)

user/create.js, about.js 파일은 나중에 삭제해서 깃허브에 파일이 없다. <br>
하지만, 기록은 남아있다. <br>


#### components/App.Layout.js
```js
import React from 'react';
import { Menu, Input, Button } from 'antd';
import Link from 'next/link'

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

export default AppLayout;
```

#### pages/index.js
```js
import React from 'react';
import Link from 'next/link';
import AppLayout from '../components/App.Layout'
import Head from 'next/head';

const Home = () => {
  return (
    <>
      <Head>
        <title>NodeBird</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
      </Head>
       <AppLayout> 
        <div>Hello, Next!</div>
      </AppLayout>
    </>
  );
};

export default Home;
```

#### pages/profile.js
```js
import React from 'react';
import AppLayout from '../components/App.Layout'
import Head from 'next/head';

const Profile = () => {
  return (
    <>
      <Head>
        <title>NodeBird</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
      </Head>
      <AppLayout>
        <div>내 프로필</div>
      </AppLayout>
    </>
  );
};

export default Profile;
```

#### pages/signup.js
```js
import React from 'react';
import AppLayout from '../components/App.Layout'
import Head from 'next/head';

const Signup = () => {
  return (
    <>
      <Head>
        <title>NodeBird</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
      </Head>
      <AppLayout>
        <div>회원가입</div>
      </AppLayout>
    </>
  );
};

export default Signup;
```

## 회원가입 폼 만들기
[위로가기](#Hello-NextJS)

#### pages/signup.js
```js
import React, { useState } from 'react';
import AppLayout from '../components/App.Layout'
import Head from 'next/head';
import { Form, Input, Checkbox, Button } from 'antd';

const Signup = () => {

  const [id, setId] = useState('');
  const [nick, setNick] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [term, setTerm] = useState(false); // 약관 동의 (체크박스)

  const onSubmit = () => {};
  const onChangeId = (e) => {
    setId(e.target.value);
  };
  const onChangeNick = (e) => {
    setNick(e.target.value);
  };
  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };
  const onChangePasswordCheck = (e) => {
    setPasswordCheck(e.target.value);
  };
  const onChangeTerm = (e) => {
    setTerm(e.target.checked); // 체크박스는 checked이다. 
  };

  return (
    <>
      <Head>
        <title>NodeBird</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
      </Head>
      <AppLayout>
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
          </div>
          <div>
            <Checkbox name="user-term" value={term} onChange={onChangeTerm}>약관 동의</Checkbox>
          </div>
          <div>
            <Button type="primary" htmlType="submit">가입하기</Button>
          </div>
        </Form>
      </AppLayout>
    </>
  );
};

export default Signup;
```

## 회원가입 state와 custom hook
[위로가기](#Hello-NextJS)

#### pages/signup.js
```js
import React, { useState } from 'react';
import AppLayout from '../components/App.Layout'
import Head from 'next/head';
import { Form, Input, Checkbox, Button } from 'antd';

const Signup = () => {

  const [nick, setNick] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [term, setTerm] = useState(false); // 약관 동의 (체크박스)
  const [passwordError, setPasswordError] = useState(false); // 비밀번호 에러
  const [termError, setTermError] = useState(false); // 약간 동의 안 할 경우

  const onSubmit = (e) => {
    e.preventDefault();
    if ( password !== passwordCheck) {
      return setPasswordError(true);
    }
    if (!term) {
      setTermError(true);
    }
  };
  
  const onChangeNick = (e) => {
    setNick(e.target.value);
  };
  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };
  const onChangePasswordCheck = (e) => {
    setPasswordError(e.target.value !== password); // 비밀번호를 입력할 때 마다 바로바로 체크를 해주는 거임!!!!
    setPasswordCheck(e.target.value);
  };
  const onChangeTerm = (e) => {
    setTermError(false);
    setTerm(e.target.checked);
  };

  // 커스텀 훅이다. 기존의 후을 사용해서 새로운 훅을 만들어낸다.
  const useInput = (initValue = null) => {
    const [value, setter] = useState(initValue);
    const handler = (e) => {
      setter(e.target.value);
    }
    return [value, handler];
  };
  const [id, onChangeId] = useInput(''); // 사용예시


  return (
    <>
      <Head>
        <title>NodeBird</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
      </Head>
      <AppLayout>
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
      </AppLayout>
    </>
  );
};

export default Signup;
```
