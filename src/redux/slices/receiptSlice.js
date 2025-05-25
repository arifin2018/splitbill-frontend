// Contoh: src/redux/slices/receiptSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  receiptData: null,
  loading: false,
  error: null,
  originalImageUrl: null,
};

const receiptSlice = createSlice({
  name: 'receipt',
  initialState,
  reducers: {
    // ... reducer yang sudah ada
    setReceiptData: (state, action) => {
      state.receiptData = action.payload;
      state.loading = false;
      state.error = null;
    },
    // Action baru untuk mengupdate data resi
    updateReceiptData: (state, action) => {
      const { path, value } = action.payload;
      // Gunakan logika untuk mengupdate state berdasarkan path (misal: "store_information.store_name")
      // Ini adalah contoh sederhana; untuk update yang lebih kompleks, Anda bisa menggunakan library seperti 'immer'
      // atau membuat logika deep merge sendiri.
      
      let current = state.receiptData;
      const parts = path.split('.');
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {}; // Pastikan objek bersarang ada
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    },
    // Ini juga bisa menerima seluruh objek receiptData yang sudah diedit
    setEditedReceiptData: (state, action) => {
      state.receiptData = action.payload; // Ganti seluruh objek receiptData dengan yang baru
    },
    // ... reducer lainnya (misal resetStore jika Anda punya)
  },
});

// Ekspor action creator baru
export const { setReceiptData, updateReceiptData, setEditedReceiptData } = receiptSlice.actions;
export default receiptSlice.reducer;