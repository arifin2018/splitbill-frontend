// redux/reducers/splitBillReducer.js

import {
  SET_ACTIVE_PERSON,
  ASSIGN_ITEM_TO_PERSON,
  RESET_SPLIT_BILL_STATE,
} from '../actions/splitBillActions';

// Initial state untuk split bill
// Perhatikan: items dan people akan didapatkan dari Redux state lainnya (receipt dan friends)
// assignedItems di sini akan mencatat pembagiannya
const initialState = {
  activePersonId: null,
  // Struktur ideal untuk menyimpan assigned items per orang mungkin seperti ini:
  // personAssignments: {
  //   'person_id_1': {
  //     'item_id_1': 2, // Kuantitas item_id_1 yang diambil person_id_1
  //     'item_id_2': 1,
  //   },
  //   'person_id_2': { ... }
  // }
  personAssignments: {}, // Ini akan menjadi sumber kebenaran untuk pembagian
};

const splitBillReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ACTIVE_PERSON:
      return {
        ...state,
        activePersonId: action.payload,
      };
    case ASSIGN_ITEM_TO_PERSON: {
      const { personId, itemId, quantityChange } = action.payload;

      const newPersonAssignments = { ...state.personAssignments };
      // Pastikan ada entri untuk personId
      if (!newPersonAssignments[personId]) {
        newPersonAssignments[personId] = {};
      }

      const currentAssignedQty = newPersonAssignments[personId][itemId] || 0;
      const newAssignedQty = currentAssignedQty + quantityChange;

      if (newAssignedQty <= 0) {
        delete newPersonAssignments[personId][itemId]; // Hapus jika kuantitas 0 atau kurang
      } else {
        newPersonAssignments[personId][itemId] = newAssignedQty;
      }

      // Bersihkan entri personId jika tidak ada item yang di-assign
      if (Object.keys(newPersonAssignments[personId]).length === 0) {
        delete newPersonAssignments[personId];
      }

      return {
        ...state,
        personAssignments: newPersonAssignments,
      };
    }
    case RESET_SPLIT_BILL_STATE:
      return initialState;
    default:
      return state;
  }
};

export default splitBillReducer;