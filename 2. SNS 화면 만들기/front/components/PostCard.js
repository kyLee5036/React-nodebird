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