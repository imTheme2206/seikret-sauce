import { useEffect, type RefObject } from "react";

type Hotkey = {
  key: string;
  handler: () => void | Promise<void>;
  /** Require either Ctrl or Command. */
  mod?: boolean;
  allowWhileTyping?: boolean;
  /** Restrict the shortcut to this element (and its descendants). */
  target?: RefObject<HTMLElement | null>;
  enabled?: () => boolean;
};

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/** Register shortcuts with current callbacks and automatic listener cleanup. */
export const useHotkeys = (hotkeys: Hotkey[]) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      for (const hotkey of hotkeys) {
        if (event.currentTarget !== (hotkey.target ? hotkey.target.current : window)) continue;
        if (event.key.toLowerCase() !== hotkey.key.toLowerCase()) continue;
        if (hotkey.mod && !event.metaKey && !event.ctrlKey) continue;
        if (!hotkey.allowWhileTyping && isTypingTarget(event.target)) continue;
        if (hotkey.enabled && !hotkey.enabled()) continue;

        event.preventDefault();
        void hotkey.handler();
      }
    };

    const targets = new Set<HTMLElement | Window>();
    for (const hotkey of hotkeys) {
      const target = hotkey.target ? hotkey.target.current : window;
      if (target) targets.add(target);
    }
    for (const target of targets) target.addEventListener("keydown", onKeyDown as EventListener);
    return () => {
      for (const target of targets) target.removeEventListener("keydown", onKeyDown as EventListener);
    };
  }, [hotkeys]);
};
