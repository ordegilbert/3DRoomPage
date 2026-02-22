import { StickyNoteWindow } from "../components/Window/StickyNoteWindow";

type WindowProps = {
  onClose: () => void;
  onFocus: () => void;
  focused: boolean;
  initialLeft?: string;
  initialTop?: string;
};

export function AboutWindow({
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
      <h2>About Us</h2>
      <p>We are Bawang Studio</p>
      <p>Indie Game Developer from Indonesia, formed by 5 students from BINUS University</p>
      <p>We're aiming to create a positive impact from our games!</p>
    </StickyNoteWindow>
  );
}
