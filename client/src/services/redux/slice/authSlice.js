import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const token = Cookies.get("token");

const initialState = {
  currentUser: [],
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    setCurrentUser(state, action) {
      state.currentUser = action.payload;
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    signOut: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
    },
    updateUser: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
    },
  },
});

export const { 
  setCurrentUser, 
  signOut, 
  setIsAuthenticated,
  updateUser
} = authSlice.actions;

export default authSlice.reducer;
