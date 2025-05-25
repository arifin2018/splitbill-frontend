// redux/actions/splitBillActions.js

export const SET_ACTIVE_PERSON = 'SET_ACTIVE_PERSON';
export const ASSIGN_ITEM_TO_PERSON = 'ASSIGN_ITEM_TO_PERSON';
export const RESET_SPLIT_BILL_STATE = 'RESET_SPLIT_BILL_STATE';

export const setActivePerson = (personId) => ({
  type: SET_ACTIVE_PERSON,
  payload: personId,
});

export const assignItemToPerson = (personId, itemId, quantityChange) => ({
  type: ASSIGN_ITEM_TO_PERSON,
  payload: { personId, itemId, quantityChange },
});

export const resetSplitBillState = () => ({
  type: RESET_SPLIT_BILL_STATE,
});