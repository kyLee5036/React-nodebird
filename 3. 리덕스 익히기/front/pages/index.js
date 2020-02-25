import React from 'react';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';

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
  return (
    <div>
      {dummy.isLoggedIn && <PostForm /> }
      {dummy.mainPosts.map((c) => {
        // 게시글 나오는 화면
        return (
          <PostCard key={c} post={c} />
        )
      })}
    </div>
  );
};

export default Home;