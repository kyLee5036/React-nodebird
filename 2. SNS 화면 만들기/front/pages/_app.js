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