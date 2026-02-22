import Draggable from "react-draggable";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./window.css";

type WindowProps = {
  title: string;
  onClose: () => void;
  onFocus: () => void;
  focused: boolean;
  children: React.ReactNode;

  initialPosition?: { x: number; y: number };
};

export function Window({
  title,
  onClose,
  onFocus,
  focused,
  children,
}: WindowProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <Draggable
      handle=".window-title"
      nodeRef={nodeRef}
      defaultPosition={initialPosition ?? { x: 400, y: 200 }}
      onStart={onFocus}
    >
      <div
        ref={nodeRef}
        style={{ zIndex: focused ? 10 : 1 }}
        onMouseDownCapture={onFocus}
      >
        <AnimatePresence>
          <motion.div
            className={`window ${focused ? "window-focused" : ""}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="window-title">
              <span>{title}</span>
              <button onClick={onClose}>✕</button>
            </div>

            <div className="window-content">{children}</div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Draggable>
  );
}
