import { useSyncExternalStore } from "react";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

type ToastInput = Omit<ToastMessage, "id">;

let messages: ToastMessage[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function toast(message: ToastInput) {
  const id = crypto.randomUUID();
  messages = [...messages, { ...message, id }];
  emit();
  return id;
}

export function dismissToast(id: string) {
  messages = messages.filter((message) => message.id !== id);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useToastMessages() {
  return useSyncExternalStore(subscribe, () => messages, () => messages);
}
