// redux/actions/friendActions.js

export const ADD_FRIEND = 'ADD_FRIEND';
export const UPDATE_FRIEND_NAME = 'UPDATE_FRIEND_NAME';
export const REMOVE_FRIEND = 'REMOVE_FRIEND';
export const SET_FRIENDS = 'SET_FRIENDS'; // Untuk inisialisasi atau overwrite

export const addFriend = (friend) => ({
  type: ADD_FRIEND,
  payload: friend,
});

export const updateFriendName = (id, name) => ({
  type: UPDATE_FRIEND_NAME,
  payload: { id, name },
});

export const removeFriend = (id) => ({
  type: REMOVE_FRIEND,
  payload: id,
});

export const setFriends = (friends) => ({
  type: SET_FRIENDS,
  payload: friends,
});