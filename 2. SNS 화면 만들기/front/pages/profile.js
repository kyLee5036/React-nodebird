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