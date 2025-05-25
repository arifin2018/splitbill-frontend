// redux/reducers/friendReducer.js

import {
  ADD_FRIEND,
  UPDATE_FRIEND_NAME,
  REMOVE_FRIEND,
  SET_FRIENDS,
} from '../actions/friendActions';

const initialState = {
  friends: [], // Array untuk menyimpan objek teman { id, name }
};

const friendReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_FRIEND:
      return {
        ...state,
        friends: [...state.friends, action.payload],
      };
    case UPDATE_FRIEND_NAME:
      return {
        ...state,
        friends: state.friends.map((friend) =>
          friend.id === action.payload.id
            ? { ...friend, name: action.payload.name }
            : friend
        ),
      };
    case REMOVE_FRIEND:
      return {
        ...state,
        friends: state.friends.filter((friend) => friend.id !== action.payload),
      };
    case SET_FRIENDS:
        return {
            ...state,
            friends: action.payload
        };
    default:
      return state;
  }
};

export default friendReducer;