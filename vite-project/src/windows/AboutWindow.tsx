import { StickyNoteWindow } from "../components/Window/StickyNoteWindow";

export function AboutWindow({
  onClose,
  onFocus,
  focused,
}: {
  onClose: () => void;
  onFocus: () => void;
  focused: boolean;
}) {
  return (
    <StickyNoteWindow onClose={onClose} onFocus={onFocus} focused={focused}>
      <h2>About Us</h2>
      <p>We are Bawang Studio...</p>
    </StickyNoteWindow>
  );
}
