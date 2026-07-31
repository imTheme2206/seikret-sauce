import { useSyncExternalStore } from "react";

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

type ToastInput = Omit<ToastMessage, "id">;

let messages: ToastMessage[] = [];
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

export const toast = (message: ToastInput) => {
  const id = crypto.randomUUID();
  messages = [...messages, { ...message, id }];
  emit();
  return id;
};

export const dismissToast = (id: string) => {
  messages = messages.filter((message) => message.id !== id);
  emit();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useToastMessages = () => {
  return useSyncExternalStore(subscribe, () => messages, () => messages);
};
