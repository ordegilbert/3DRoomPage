import Draggable from "react-draggable";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import stickyNote from "./StickyNote.png";
import "./StickyNoteWindow.css";

type StickyNoteWindowProps = {
  onClose: () => void;
  onFocus: () => void;
  focused: boolean;
  children: React.ReactNode;
};

export function StickyNoteWindow({
  onClose,
  onFocus,
  focused,
  children
}: StickyNoteWindowProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      onStart={onFocus}
    >
      <div
        ref={nodeRef}
        className="sticky-wrapper"
        style={{ zIndex: focused ? 10 : 1 }}
        onMouseDownCapture={onFocus}
      >
        <AnimatePresence>
          <motion.div
            className="sticky-window"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <img
              src={stickyNote}
              className="sticky-bg"
              draggable={false}
            />

            {/* Content */}
            <div className="sticky-content">
              {children}
            </div>

            {/* Close (optional invisible hitbox) */}
            <button
              className="sticky-close"
              onClick={onClose}
              aria-label="Close"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </Draggable>
  );
}
