import React from 'react';
import { Form, Input, Button } from 'antd';

const dummy = {
  isLoggedIn : true,
  imagePaths: [],
  mainPosts: [{
    User: {
      id : 1,
      nickname : 'LEEKY',
    },
    content: '첫번 째 게시글',
    // img는 img예시로 넣어주었다. 저작권이 없는 거라서 괜찮음.
    img: 'https://img.freepik.com/free-photo/hooded-computer-hacker-stealing-information-with-laptop_155003-1918.jpg?size=664&ext=jpg',
  }],
}

const PostForm = () => {
  return (
    <Form style={{ margin: '10px 0 20px' }} encType="multipart/fomr-data">
      <Input.TextArea maxLength={140} placeholder="어떤 신기한 일이 있었나요?" />  
      <div>
        <input type="file" multiple hidden />
        <Button>이미지 업로드</Button>
        <Button type="primary" style={{ float : 'right'}} htmlType="submit">업로드</Button>
      </div>
      <div>
        {dummy.imagePaths.map((v, i) => {
          return (
            <div key={v} style={{ display: 'inline-black' }}>
              <img src={'http://localhost:3065/' + v} style={{ width : '200px' }} alt={v} />
              <div>
                <Button>제거</Button>
              </div>
            </div>
          )
        })}  
      </div>  
  </Form>
  )
}

export default PostForm;