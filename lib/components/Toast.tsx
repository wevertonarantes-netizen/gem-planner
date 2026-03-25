"use client";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  visible: boolean;
};

export default function Toast({
  message,
  type = "info",
  visible,
}: ToastProps) {
  if (!visible || !message) return null;

  const styles =
    type === "success"
      ? "bg-green-600 text-white"
      : type === "error"
      ? "bg-red-600 text-white"
      : "bg-zinc-900 text-white";

  return (
    <div className="fixed right-4 top-4 z-[9999]">
      <div
        className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl ${styles}`}
      >
        {message}
      </div>
    </div>
  );
}