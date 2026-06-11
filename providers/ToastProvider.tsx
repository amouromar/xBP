import { PropsWithChildren } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";

export function ToastProvider({
  children,
}: PropsWithChildren) {
  return (
    <>
      {children}
      <Toast />
    </>
  );
}
