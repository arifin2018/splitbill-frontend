import { combineReducers } from 'redux';
import receiptReducer from './receiptReducer';
import friendReducer from './friendReducer';
import splitBillReducer from './splitBillReducer';

const appReducer = combineReducers({
  receipt: receiptReducer,
  friends: friendReducer,
  splitBill: splitBillReducer,
  // ... tambahkan reducer lain jika ada
});

const rootReducer = (state, action) => {
  if (action.type === 'app/resetStore') {
    // Ketika aksi 'app/resetStore' didispatch, kita mengatur 'state' menjadi undefined.
    // Ini akan menyebabkan setiap reducer di 'appReducer' untuk mengembalikan 'initialState' mereka,
    // secara efektif mereset seluruh Redux store.
    state = undefined; 
  }
  return appReducer(state, action);
};

export default rootReducer;