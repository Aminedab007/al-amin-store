// src/features/ui/uiSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ToastTone = "success" | "info" | "warning" | "danger";

export type ToastState = {
  open: boolean;
  message: string;
  tone: ToastTone;
};

const initialState: ToastState = {
  open: false,
  message: "",
  tone: "info",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showToast(
      state,
      action: PayloadAction<{ message: string; tone?: ToastTone }>
    ) {
      state.open = true;
      state.message = action.payload.message;
      state.tone = action.payload.tone ?? "info";
    },
    hideToast(state) {
      state.open = false;
    },
  },
});

export const { showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
