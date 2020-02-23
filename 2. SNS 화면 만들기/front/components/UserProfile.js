import React from 'react';

const dummy = {
  nickname: 'LEEKY',
  Post: [],
  Followings: [],
  Followers: [],
  isLoggedIn : false,
}

const UserProfile = () => {
  return (
    <Card
      actions={[
        <div key="twit">짹짹<br />{dummy.Post.legnth}</div>,
        <div key="following">팔로잉<br />{dummy.Followings.legnth}</div>,
        <div key="follower">팔로워<br />{dummy.Followers.legnth}</div>,
      ]}>
      <Card.Meta 
        avatar={<Avatar>{dummy.nickname[0]}</Avatar>} // 앞 급잘
        title={dummy.nickname}
      />
    </Card> 
  )
}

export default UserProfile;