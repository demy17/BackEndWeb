import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showToast: false,
  // message: 'Createrjhf kjbjoshgnug uhghd',
  // type: 'success',
  toasts: [],
};

const toastSlice = createSlice({
  name: "toastSlice",
  initialState,
  reducers: {
    setShowToast: (state, action) => {
      state.showToast = action.payload;
    },
    setToasts: (state, action) => {
      state.toasts = action.payload;
    },
    addToast: (state, action) => {
      state.toasts.push(action.payload);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
      if(state.toasts.length === 0) {
        state.showToast = false;
      }
    }
  },
});

export const { 
  setToasts,
  setShowToast,
  addToast,
  removeToast
} = toastSlice.actions;

export default toastSlice.reducer;
