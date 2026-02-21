import { StickyNoteWindow } from '../components/Window/StickyNoteWindow';

export function ContactWindow({
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
      <h2>Contact Us</h2>
      <p>bawanggamestudio@gmail.com</p>
    </StickyNoteWindow>
  );
}
