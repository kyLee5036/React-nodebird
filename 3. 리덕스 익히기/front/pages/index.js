import React, { useEffect } from 'react';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { useDispatch, useSelector } from 'react-redux';
import { LOG_IN } from '../reducers/user';

const dummy = {
  isLoggedIn : true,
  imagePaths: [],
  mainPosts: [{
    User: {
      id : 1,
      nickname : 'LEEKY',
    },
    content: '첫번 째 게시글',
    img: 'https://img.freepik.com/free-photo/hooded-computer-hacker-stealing-information-with-laptop_155003-1918.jpg?size=664&ext=jpg',
  }],
}

const Home = () => {
  const dispatch = useDispatch();
  const {isLoggedIn, user} = useSelector(state => state.user); 
  useEffect(() => {
    dispatch( {
      type: LOG_IN,
      data: {
        nickname: 'LEEKY',
      }
    })
  }, []);

  return (
    <div>
      {user ? <div>로그인 했습니다 : {user.nickname}</div> : <div>로그아웃 했습니다</div>}
      {dummy.isLoggedIn && <PostForm /> }
      {dummy.mainPosts.map((c) => {
        return (
          <PostCard key={c} post={c} />
        )
      })}
    </div>
  );
};

export default Home;