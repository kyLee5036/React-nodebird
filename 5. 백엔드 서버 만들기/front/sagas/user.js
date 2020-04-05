import axios from 'axios';
import { all, fork, takeLatest, call, put, delay } from 'redux-saga/effects';
import { LOG_IN_REQUEST, LOG_IN_SUCCESS, LOG_IN_FAILURE, SIGN_UP_REQUEST, SIGN_UP_FAILURE, SIGN_UP_SUCCESS, LOG_OUT_SUCCESS, LOG_OUT_FAILURE, LOG_OUT_REQUEST, LOAD_USER_SUCCESS, LOAD_USER_FAILURE, LOAD_USER_REQUEST } from '../reducers/user'

function logInAPI(logInData) {
  return axios.post('/user/login', logInData, {
    withCredentials: true, 
  });
}

function* logIn(action) {
  try {
    const result = yield call(logInAPI, action.data);
    yield put({
      type: LOG_IN_SUCCESS,
      data: result.data
    })
  } catch (e) {
    console.error(e);
    yield put({
      type: LOG_IN_FAILURE,
    })
  }
}

function* watchLogIn() {
  yield takeLatest(LOG_IN_REQUEST, logIn);
}

function signUpAPI(signUpdata) {
  return axios.post('/user/', signUpdata);
}

function* signUp(action) {
  try {
    yield call(signUpAPI, action.data); 
    yield put({
      type: SIGN_UP_SUCCESS
    });
  } catch (err) {
    yield put({ 
      type : SIGN_UP_FAILURE,
      error : err.response.data,
    });
  }
}

function* watchSignUp() {
  yield takeLatest(SIGN_UP_REQUEST, signUp);
}


function logOutAPI() {
  return axios.post('/user/logout', {}, { 
    withCredentials: true, 
  }); 
  
}

function* logOut() {
  try {
    yield call(logOutAPI); 
    yield put({
      type: LOG_OUT_SUCCESS
    });
  } catch (err) {
    yield put({ 
      type : LOG_OUT_FAILURE,
      error : err,
    });
  }
}

function* watchLogOut() {
  yield takeLatest(LOG_OUT_REQUEST, logOut);
}



function loadUserAPI(loadUserdata) {
  return axios.get('/user/', {
    withCredentials: true, 
    
  });
  
}

function* loadUser() {
  try {
    const result = yield call(loadUserAPI); 
    yield put({
      type: LOAD_USER_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({ 
      type : LOAD_USER_FAILURE,
      error : err,
    });
  }
}

function* watchLoadUser() {
  yield takeLatest(LOAD_USER_REQUEST, loadUser);
}


export default function* userSaga() {
  yield all([
    fork(watchLogIn),
    fork(watchLogOut), 
    fork(watchLoadUser), 
    fork(watchSignUp)
  ]);
}