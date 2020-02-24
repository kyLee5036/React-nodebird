// 하나로 묶어줄 것이다.
import { combineReducers } from 'redux'; // combineReducers가 redux를 하나로 묶어준다

import user from './user';
import post from './post';

const rootReducer = combineReducers({
  user,
  post,
});

export default rootReducer;