import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';
// Hapus import thunk dari sini jika masih ada.
// import thunk from 'redux-thunk'; // Ini tidak perlu lagi

const store = configureStore({
  reducer: rootReducer,
  // Thunk sudah termasuk secara default oleh configureStore.
  // Anda hanya perlu menggunakan getDefaultMiddleware() tanpa .concat(thunk)
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
//   devTools: process.env.NODE_ENV !== 'production', // Aktifkan DevTools di mode development
});

export default store;