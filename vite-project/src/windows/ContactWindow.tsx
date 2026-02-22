import { StickyNoteWindow } from "../components/Window/StickyNoteWindow";

type WindowProps = {
  onClose: () => void;
  onFocus: () => void;
  focused: boolean;
  initialLeft?: string;
  initialTop?: string;
};

export function ContactWindow({
  onClose,
  onFocus,
  focused,
  initialLeft,
  initialTop,
}: WindowProps) {
  return (
    <StickyNoteWindow
      onClose={onClose}
      onFocus={onFocus}
      focused={focused}
      initialLeft={initialLeft}
      initialTop={initialTop}
    >
      <h2>Contact Us</h2>
      <p>Feel free to contact us via email at contact@bawangstudio.com</p>
    </StickyNoteWindow>
  );
}
