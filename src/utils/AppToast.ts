import { toast } from "react-hot-toast";

type ToastType = "s" | "e" | "i" | "w"; // success, error, info, warning

export const AppToast = (type: ToastType, message: string) => {
  if (!message) return;

  const options = {
    duration: 3500,
    position: "top-right" as const,
  };

  switch (type) {
    case "s":
      return toast.success(message, options);
    case "e":
      return toast.error(message, options);
    case "i":
      return toast(message, { ...options, icon: "ℹ️" });
    case "w":
      return toast(message, { ...options, icon: "⚠️" });
    default:
      return toast(message, options);
  }
};
