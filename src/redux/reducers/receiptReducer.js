// file: src/redux/reducers/receiptReducer.js

import {
  UPLOAD_RECEIPT_REQUEST,
  UPLOAD_RECEIPT_SUCCESS,
  UPLOAD_RECEIPT_FAILURE,
  CLEAR_RECEIPT_DATA,
  SET_ORIGINAL_IMAGE_URL,
  SET_EDITED_RECEIPT_DATA, // --- Import tipe aksi baru ini ---
} from '../actions/receiptActions';

const initialState = {
  receiptData: null,
  loading: false,
  error: null,
  originalImageUrl: null,
};

const receiptReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPLOAD_RECEIPT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case UPLOAD_RECEIPT_SUCCESS:
      return {
        ...state,
        loading: false,
        receiptData: action.payload,
        error: null,
      };
    case UPLOAD_RECEIPT_FAILURE:
      return {
        ...state,
        loading: false,
        receiptData: null,
        error: action.payload,
      };
    case SET_ORIGINAL_IMAGE_URL:
      return {
        ...state,
        originalImageUrl: action.payload,
      };
    // --- Tambahkan case ini ---
    case SET_EDITED_RECEIPT_DATA:
      return {
        ...state,
        receiptData: action.payload, // Perbarui receiptData dengan payload yang dikirim
      };
    // --- Akhir penambahan ---
    case CLEAR_RECEIPT_DATA:
        return {
            ...state,
            receiptData: null,
            error: null,
            originalImageUrl: null,
        };
    default:
      return state;
  }
};

export default receiptReducer;