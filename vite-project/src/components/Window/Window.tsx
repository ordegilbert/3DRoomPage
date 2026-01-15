import Draggable from "react-draggable";
import { useRef } from "react";
import "./window.css";

type WindowProps = {
  title: string;
  onClose: () => void;
  onFocus: () => void;
  focused: boolean;
  children: React.ReactNode;
};

export function Window({
  title,
  onClose,
  onFocus,
  focused,
  children
}: WindowProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <Draggable
      handle=".window-title"
      nodeRef={nodeRef}
      onStart={onFocus}
    >
      <div
        ref={nodeRef}
        className={`window ${focused ? "window-focused" : ""}`}
        style={{ zIndex: focused ? 10 : 1 }}
      >
        <div className="window-title">
          <span>{title}</span>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="window-content">
          {children}
        </div>
      </div>
    </Draggable>
  );
}