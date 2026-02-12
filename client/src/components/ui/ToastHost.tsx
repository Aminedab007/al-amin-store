// src/components/ui/ToastHost.tsx
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Toast from "./Toast";
import { hideToast } from "../../features/ui/uiSlice";

export default function ToastHost() {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((s) => s.ui);

  const onClose = useCallback(() => {
    dispatch(hideToast());
  }, [dispatch]);

  return (
    <Toast
      open={toast.open}
      message={toast.message}
      tone={toast.tone}
      onClose={onClose}
      durationMs={2500}
    />
  );
}
