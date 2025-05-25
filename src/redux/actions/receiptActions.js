import axios from 'axios';

// Action Types
export const UPLOAD_RECEIPT_REQUEST = 'UPLOAD_RECEIPT_REQUEST';
export const UPLOAD_RECEIPT_SUCCESS = 'UPLOAD_RECEIPT_SUCCESS';
export const UPLOAD_RECEIPT_FAILURE = 'UPLOAD_RECEIPT_FAILURE';
export const CLEAR_RECEIPT_DATA = 'CLEAR_RECEIPT_DATA';
export const SET_ORIGINAL_IMAGE_URL = 'SET_ORIGINAL_IMAGE_URL';

// Action Creators
export const uploadReceiptRequest = () => ({
  type: UPLOAD_RECEIPT_REQUEST,
});

export const uploadReceiptSuccess = (data) => ({
  type: UPLOAD_RECEIPT_SUCCESS,
  payload: data,
});

export const uploadReceiptFailure = (error) => ({
  type: UPLOAD_RECEIPT_FAILURE,
  payload: error,
});

export const clearReceiptData = () => ({
  type: CLEAR_RECEIPT_DATA,
});

export const setOriginalImageUrl = (url) => ({
  type: SET_ORIGINAL_IMAGE_URL,
  payload: url,
});

// Async Action Creator (using redux-thunk)
export const uploadReceipt = (imageBlob) => async (dispatch) => {
  dispatch(uploadReceiptRequest()); // Dispatch request action (for loading state)

  try {
    const formData = new FormData();
    formData.append('image', imageBlob, 'receipt.png');

    const response = await axios.post('https://splitbill.inviteweeding.my.id', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    dispatch(uploadReceiptSuccess(response.data)); // Dispatch success action with data
    return response.data; // Return data for component to use (e.g., for navigation)
  } catch (error) {
    let errorMessage = 'Gagal mengunggah resi. Silakan coba lagi.';
    if (error.response) {
      errorMessage = `Error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
    } else if (error.request) {
      errorMessage = 'Tidak ada respons dari server. Periksa koneksi internet Anda.';
    } else {
      errorMessage = `Terjadi kesalahan: ${error.message}`;
    }
    dispatch(uploadReceiptFailure(errorMessage)); // Dispatch failure action with error
    throw new Error(errorMessage); // Throw error to be caught by component
  }
};