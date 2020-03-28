// 하나로 묶어줄 것이다.
import { combineReducers } from 'redux';

import user from './user';
import post from './post';

const rootReducer = combineReducers({
  user,
  post,
});

export default rootReducer;