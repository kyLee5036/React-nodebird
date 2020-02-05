import React from 'react';
import Link from 'next/link';
import AppLayout from '../components/App.Layout';
import Head from 'next/head';

const Home = () => {
  return (
    <>
      <Head>
      <title>NodeBird</title> 
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css" />
      </Head>
      <AppLayout>
        
        <div>Home</div>
      </AppLayout>
    </>
  )
}

export default Home;