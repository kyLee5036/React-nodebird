# SNS 화면 만들기

+[App.js로 레이아웃 분리하기](#App.js로-레이아웃-분리하기)


## App.js로 레이아웃 분리하기
[위로가기](#SNS-화면-만들기)

useCallback을 사용해서 이벤트리스너를 감싸주자! <br>
왜냐하면, props를 넘겨주는 함수, 메서드는 useCallback을 해줘야한다. <br>
자세한 설명은 무료강의에 있다. <br>

#### pages/signup.js
```js
...생략
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
...생략
```

함수 내부에서 쓰는 state를 deps 배열로 넣어야한다. <br>

react devtools보면 렌더링이 심하게 되어있다. (반짝거리는 거) <br>
여기서 Head, AppLayout이 겹쳐있어서 분리를 할 것이다. <br>

모든 페이지에 공통적으로 들어간 것이 Layout이다. <br>
Layout을 위한 파일을 만들 것이다. <br>
하지만 Next에 따로 지정해놓았다. <br>
그러므로 _app.js파일을 만들 것이다. 그러면 자동으로 _app.js가 레이아웃이 된다. <br>
이제부터 공통된 부분을 app.js에 넣어 줄 것이다. (파일이름 잘 볼 것!!) <br>

#### pages/_app.js
```js
import React from 'react';
import AppLayout from '../components/App.Layout';
import Head from 'next/head';

const NodeBird = ({Component}) => {
  return (
    <>
      <Head>
        <title>NodeBird</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
      </Head>
      <AppLayout>
        <Component /> // 이렇게 해줘야 한다.
      </AppLayout>
    </>
  );
};

export default NodeBird;
```

.app.js가 props로 Component를 받는다. <br>
Component는 index, profile, signup들을 넣어준다.  <br>

하지만 바로 실행하면 적용이 바로되지가 않는다!!! <br>
잘 되기위해서는 서버를 다시 실행해야한다!! <br>

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
위 처럼 공통된 부분 삭제한다. signup.js, profile.js는 생략한다.

### Form태그 안에서의 리 리렌덩하기

중복되는 것( 같은 컴포넌트)가 들어있으면, 리 렌더링 다 같이된다. 그렇기 위해서는 위처럼 분리한다.<br>
따른 컴포넌트를 분리해서 Form만 리 렌더링이 된다.<br>

아이디만 바꾸는데, 비밀번호, 비밀번호체크, 닉네임도 리 렌더링이 된다. 왜??<br>
아이디에 글자를 치면, Form 전체가 리 렌더링이 된다. 즉, 같은 컴포넌트에 있어서 리 렌더링이 된다.<br>
리 렌더링을 하지 않으려면, React.memo를 해줘야한다. 근데 하필, 컨트롤 할 수 있는 있는게 아니다.<br>
왜냐하면, 여기서 input은 antd의 Input이라서 안된다. 근데 하는 방법이 있다.<br>

#### pages/signup.js
```js
import React, { useState, useCallback, memo } from 'react';
import { Form, Input, Checkbox, Button } from 'antd';

const TextInput = memo(({ value, onChange}) => { // 1) 컴포넌트를 만든다.  3) props도 만든다.
  return (
    <Input value={value} required onChange={onChange} /> // 2) Input을 가져온다.
  );
});

const Signup = () => {
  ...생략
  return (
    <>
      <Form onSubmit={onSubmit} style={{ padding : 10}} >
        <div>
          <label htmlFor="user-id">아이디</label>
          <br />
          <TextInput value={id} onChange={onChangeId} /> // 4) TextInput추가
        </div>
        <div>
          <label htmlFor="user-nick">닉네임</label>
          <br />
          <TextInput value={nick} onChange={onChangeNick} />  // 4) TextInput추가
        </div>
        <div>
          <label htmlFor="user-password">비밀번호</label>
          <br />
          <TextInput name="user-password" type="password" value={password} required onChange={onChangePassword} /> // 4) TextInput추가
        </div>
        ...생략 
      </Form>
    </>
  );
};

export default Signup;
```

하지만, 지나친 최적하는 안해줘도 된다!<br>
페이스북도 이 정도록 지나치게 하지않는다. 참고로만 알아줘도 된다.<br>
나쁜건은 아니지만, 시간이 지나치다.<br>

