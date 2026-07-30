import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { dismissToast, useToastMessages } from "@/hooks/use-toast";

export function Toaster() {
  const messages = useToastMessages();

  return (
    <ToastProvider swipeDirection="right">
      {messages.map((message) => {
        const Icon =
          message.variant === "destructive"
            ? AlertTriangle
            : message.variant === "success"
              ? CheckCircle2
              : Info;

        return (
          <Toast
            key={message.id}
            variant={message.variant}
            duration={5000}
            onOpenChange={(open) => {
              if (!open) dismissToast(message.id);
            }}
          >
            <Icon
              className={
                message.variant === "destructive"
                  ? "mt-0.5 size-4 shrink-0 text-destructive"
                  : "mt-0.5 size-4 shrink-0 text-primary"
              }
            />
            <div className="grid gap-1">
              <ToastTitle>{message.title}</ToastTitle>
              {message.description && (
                <ToastDescription>{message.description}</ToastDescription>
              )}
            </div>
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
