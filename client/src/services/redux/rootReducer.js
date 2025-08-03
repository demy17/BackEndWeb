// src/reducers/index.js
import { combineReducers } from "redux";
import authReducer from "./slice/authSlice";
import toastReducer from "./slice/toastSlice";
// import musicReducer from "./slice/musicSlice";
// import reportRducer from './slice/reportSlice';
// import deleteReducer from './slice/deleteSlice';
// import reelReducer from './slice/reelSlice';
// import postReducer from "./slice/postSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  toast: toastReducer,
//   music: musicReducer,
//   report: reportRducer,
//   reel: reelReducer,
//   delete: deleteReducer,
//   post: postReducer,
});

export default rootReducer;
