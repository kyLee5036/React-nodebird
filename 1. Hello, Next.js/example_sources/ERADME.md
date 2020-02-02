# Hello NextJS의 소스

+ [프로젝트 구조와 배우는 것들](#프로젝트-구조와-배우는-것들)
+ [next와 eslint 설치하기](#next와-eslint-설치하기)
+ [next 라우팅 시스템](#next-라우팅-시스템)
+ [ant design 적용하기](#ant-design-적용하기)



## next 라우팅 시스템
[위로 가기](#Hello-NextJS의-소스)

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
[위로 가기](#Hello-NextJS의-소스)


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