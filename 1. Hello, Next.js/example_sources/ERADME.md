# Hello NextJS의 소스

+ [프로젝트 구조와 배우는 것들](#프로젝트-구조와-배우는-것들)
+ [next와 eslint 설치하기](#next와-eslint-설치하기)
+ [next 라우팅 시스템](#next-라우팅-시스템)



## next 라우팅 시스템
[제일 위로](#Hello-NextJS의-소스)

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