const dummyUser = {
  nickname: 'LEEKY',
  Post: [],
  Followings: [],
  Followers: [],
  signUpData: [],
};

export const initialState = {
  isLoggedIn: false,
  user: null,
  signUpData: {},
  loginData: {},
};

export const SIGN_UP_REQUEST = 'SIGN_UP_REQUEST';
export const SIGN_UP_SUCCESS = 'SIGN_UP_SUCCESS';
export const SIGN_UP_FAILURE = 'SIGN_UP_FAILURE';

export const LOG_IN_REQUEST = 'LOG_IN_REQUEST'; // 액션의 이름
export const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS'; // 액션의 이름
export const LOG_IN_FAILURE = 'LOG_IN_FAILURE'; // 액션의 이름

export const LOG_OUT_REQUEST = 'LOG_OUT_REQUEST';
export const LOG_OUT_SUCCESS = 'LOG_OUT_SUCCESS';
export const LOG_OUT_FAILURE = 'LOG_OUT_FAILURE';

export const signUpAction = data => ({
  type: SIGN_UP_REQUEST,
  data,
});

export const signUpSuccess = {
  type: SIGN_UP_SUCCESS,
};

export const loginAction = (data) => {
  return {
    type: SIGN_UP_REQUEST,
    data,
  }
};
export const logoutAction = {
  type: LOG_OUT_REQUEST,
};
export const signUp = data => ({
  type: SIGN_UP_REQUEST,
  data,
});

export default (state = initialState, action) => {
  switch (action.type) {
    case LOG_IN_REQUEST: {
      return {
        ...state,
        isLoggedIn: true,
        loginData: action.data,
        isLoading : true,
      };
    }

    case LOG_IN_REQUEST: {
      return {
        ...state,
        isLoading : false,
        user: dummyUser,
      };
    }

    case LOG_OUT_REQUEST: {
      return {
        ...state,
        isLoggedIn: false,
        user: null,
        isLoading : true,
      };
    }
    case SIGN_UP_REQUEST: { // sigun up추가하기
      return { 
        ...state, 
        signUpData: action.data, 
      }; 
    } 
    default: {
      return {
        ...state,
      }
    }
  }
};