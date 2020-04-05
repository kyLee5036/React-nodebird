import axios from 'axios';
import { all, fork, takeLatest, put, delay, call } from 'redux-saga/effects';
import { ADD_POST_REQUEST, ADD_POST_FAILURE, ADD_POST_SUCCESS, ADD_COMMENT_SUCCESS, ADD_COMMENT_REQUEST, ADD_COMMENT_FAILURE } from '../reducers/post';


function* AddCommentAPI() {

}
function* AddComment(action) { 
  try {
    yield delay(2000);
    yield put({
      type: ADD_COMMENT_SUCCESS,
      data: {
        postId: action.data.postId, 
      }
    })
  } catch (e) {
    console.log(e);
    yield put({
      type: ADD_COMMENT_FAILURE,
      error: e
    })
  }
}
function* matchAddComment() {
  yield takeLatest(ADD_COMMENT_REQUEST, AddComment);
}


function* addPostAPI(postData) {
  return axios.post('/post', postData, {
    withCredentials: true, 
  });
}
function* addPost(action) {
  try {
    const result = yield call(addPostAPI, action.data);
    yield put({
      type: ADD_POST_SUCCESS,
      data: result.data
    });
  } catch (e) {
    console.log(e);
    yield put({
      type: ADD_POST_FAILURE,
      error: e
    })
  }
}
function* matchAddPost() {
  yield takeLatest(ADD_POST_REQUEST, addPost);
}

export default function* postSaga() {
  yield all([
    fork(matchAddPost),
    fork(matchAddComment),
  ]);
}