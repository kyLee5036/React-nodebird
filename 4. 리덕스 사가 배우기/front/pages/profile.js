import React from 'react';
import {Form, Input, Button, List, Card, Icon} from 'antd';
import NickNameEditForm from '../components/NickNameEditForm';

const Profile = () => {
  return (
    <div>
      <NickNameEditForm />
      <List
        style={{ marginBottom: '20px'}}
        grid={{ gutter:4, xs:2, md: 3}} 
        size="small"
        header={<div>팔로워 목록</div>} 
        loadMore={<Button style={{width: '100%'}}>더 보기</Button>}
        bordered
        dataSource={['영이', '건이', '얏호']} 
        renderItem={ item => (
          <List.Item style={{ marginTop: '20px'}}>
            <Card actions={[<Icon type="stop" key="stop" />]}><Card.Meta description={item} /></Card>
          </List.Item>
        )}
      />

      <List
        style={{ marginBottom: '20px'}}
        grid={{ gutter:4, xs:2, md: 3}}
        size="small"
        header={<div>팔로잉 목록</div>} 
        loadMore={<Button style={{width: '100%'}}>더 보기</Button>} 
        bordered // 테두리 디자인 옵션
        dataSource={['영이', '건이', '얏호']} 
        renderItem={ item => (
          <List.Item style={{ marginTop: '20px'}}>
            <Card actions={[<Icon type="stop" key="stop" />]}><Card.Meta description={item} /></Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default Profile;