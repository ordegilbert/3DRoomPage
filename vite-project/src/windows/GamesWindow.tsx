import { StickyNoteWindow } from "../components/Window/StickyNoteWindow";

export function GamesWindow({
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
        <h2>Games</h2>
        <p>Games by Bawang Studio</p>
      </StickyNoteWindow>
    );
}
