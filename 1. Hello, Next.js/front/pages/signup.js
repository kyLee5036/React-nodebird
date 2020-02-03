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