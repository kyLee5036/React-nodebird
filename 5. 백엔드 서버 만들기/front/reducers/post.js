export const initialState = {
  mainPosts: [{
    id : 1,
    User: {
      id: 1,
      nickname: '제로초',
    },
    content: '첫 번째 게시글',
    img: 'https://img.freepik.com/free-photo/hooded-computer-hacker-stealing-information-with-laptop_155003-1918.jpg?size=664&ext=jpg',
    Comments: [],
  }], 
  imagePaths: [], 
  addPostError: false, 
  isAddingPost: false, 
  postAdded: false, 
  isAddingComment: false,
  addCommentErrorReason : '',
  commentAdded: false,
};

const dummyPost = {
  id : 2,
  User: {
    id: 1,
    nickname: 'dummyNickName',
  },
  content: 'dummyTestContent',
  Comments: [],
}

const dummyComment = {
  id : 1,
  User: {
    id: 1,
    nickname: 'LEEKY',
  },
  createAt: new Date(),
  content: '더미 댓글입니다.',
};

// 포스트 업로드
export const ADD_POST_REQUEST = 'ADD_POST_REQUEST';
export const ADD_POST_SUCCESS = 'ADD_POST_SUCCESS';
export const ADD_POST_FAILURE = 'ADD_POST_FAILURE';
// 메인 포스트 로딩
export const LOAD_MAIN_REQUEST = 'LOAD_MAIN_REQUEST';
export const LOAD_MAIN_SUCCESS = 'LOAD_MAIN_SUCCESS';
export const LOAD_MAIN_FAILURE = 'LOAD_MAIN_FAILURE';
// 해쉬태그 검색했을 결과
export const LOAD_HASHTAG_POSTS_REQUEST = 'LOAD_HASHTAG_POSTS_REQUEST';
export const LOAD_HASHTAG_POSTS_SUCCESS = 'LOAD_HASHTAG_POSTS_SUCCESS';
export const LOAD_HASHTAG_POSTS_FAILURE = 'LOAD_HASHTAG_POSTS_FAILURE';
// 사용자가 어떤 게시글 작성했는지
export const LOAD_USER_POSTS_REQUEST = 'LOAD_USER_POSTS_REQUEST';
export const LOAD_USER_POSTS_SUCCESS = 'LOAD_USER_POSTS_SUCCESS';
export const LOAD_USER_POSTS_FAILURE = 'LOAD_USER_POSTS_FAILURE';
// 이미지 업로드 액션
export const UPLOAD_IMAGES_REQUEST = 'UPLOAD_IMAGES_REQUEST';
export const UPLOAD_IMAGES_SUCCESS = 'UPLOAD_IMAGES_SUCCESS';
export const UPLOAD_IMAGES_FAILURE = 'UPLOAD_IMAGES_FAILURE';
// 이미지 업로드 취소 (유일하게 비동기가 아니다.)
export const REMOVE_IMAGE = 'REMOVE_IMAGE';
// 포스트 좋아요 
export const LIKE_POST_REQUEST = 'LIKE_POST_REQUEST';
export const LIKE_POST_SUCCESS = 'LIKE_POST_SUCCESS';
export const LIKE_POST_FAILURE = 'LIKE_POST_FAILURE';
// 포스트 좋아요(취소)
export const UNLIKE_POST_REQUEST = 'UNLIKE_POST_REQUEST';
export const UNLIKE_POST_SUCCESS = 'UNLIKE_POST_SUCCESS';
export const UNLIKE_POST_FAILURE = 'UNLIKE_POST_FAILURE';
// 댓글 남기는 거
export const ADD_COMMENT_REQUEST = 'ADD_COMMENT_REQUEST';
export const ADD_COMMENT_SUCCESS = 'ADD_COMMENT_SUCCESS';
export const ADD_COMMENT_FAILURE = 'ADD_COMMENT_FAILURE';
// 댓글 불러오기
export const LOAD_COMMENTS_REQUEST = 'LOAD_COMMENTS_REQUEST';
export const LOAD_COMMENTS_SUCCESS = 'LOAD_COMMENTS_SUCCESS';
export const LOAD_COMMENTS_FAILURE = 'LOAD_COMMENTS_FAILURE';
// 리트윗 
export const RETWEET_REQUEST = 'RETWEET_REQUEST';
export const RETWEET_SUCCESS = 'RETWEET_SUCCESS';
export const RETWEET_FAILURE = 'RETWEET_FAILURE';
// 게시글 삭제 (개인적으로)
export const REMOVE_POST_REQUEST = 'REMOVE_POST_REQUEST';
export const REMOVE_POST_SUCCESS = 'REMOVE_POST_SUCCESS';
export const REMOVE_POST_FAILURE = 'REMOVE_POST_FAILURE';
// 게시글 수정 (개인적으로)
export const UPDATE_POST_REQUEST = 'UPDATE_POST_REQUEST';
export const UPDATE_POST_SUCCESS = 'UPDATE_POST_SUCCESS';
export const UPDATE_POST_FAILURE = 'UPDATE_POST_FAILURE';


const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_POST_REQUEST: {
      return {
        ...state,
        isAddingPost: true,
        addPostError: '',
        postAdded: false, 
      };
    };
    case ADD_POST_SUCCESS: {
      return {
        ...state,
        isAddingPost: false,
        mainPosts: [dummyPost, ...state.mainPosts],
        postAdded: true, 
      };
    };
    case ADD_POST_FAILURE: {
      return {
        ...state,
        isAddingPost: false,
        addPostError: action.error,
      };
    };

    case ADD_COMMENT_REQUEST: {
      return {
        ...state,
        isAddingComment: true,
        addCommentError: '',
        commentAdded: false, 
      };
    };
    case ADD_COMMENT_SUCCESS: {
      const postIndex = state.mainPosts.findIndex(v => v.id === action.data.postId);
      const post = state.mainPosts[postIndex];
      const Comments = [...post.Comments, dummyComment];
      const mainPosts = [...state.mainPosts];
      mainPosts[postIndex] = { ...post, Comments };
      return {
        ...state,
        isAddingComment: false,
        mainPosts,
        commentAdded: true, 
      };
    };
    case ADD_COMMENT_FAILURE: {
      return {
        ...state,
        isAddingPost: false,
        addCommentErrorReason: action.error,
      };
    };

    default: {
      return {
        ...state,
      };
    }
  }
};

export default reducer;