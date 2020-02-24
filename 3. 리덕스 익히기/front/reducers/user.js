export const intialState = { 
  isLoggedIn : false,
  user: {},
}

const LOG_IN = 'LOG_IN' 
const LOG_OUT = 'LOG_OUT';

const loginAction = { 
  type: LOG_IN,
  data: { 
    nickname: 'LEEKY',
  }
}

const logoutAction = {
  type: LOG_OUT,
}

const reducer = (state = intialState, action) => {
  switch(action.type) { 
    case LOG_IN: {
      return {
        ...state,
        isLoggedIn: true,
        user: action.user,
      };
    }
    case LOG_OUT: {
      return {
        ...state,
        isLoggedIn: false,
        user: null,
      };
    }
    default: {
      return {
        ...state,
      };
    }
  }
}

export default reducer;