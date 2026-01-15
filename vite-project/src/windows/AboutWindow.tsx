import { Window } from "../components/Window/Window";

export function AboutWindow({ onClose, onFocus, focused }: { onClose: () => void; onFocus: () => void; focused: boolean }) {
  return (
    <Window title="About Bawang Studio" onClose={onClose} onFocus={onFocus} focused={focused}>
      <p>We make emotional, quiet games.</p>
    </Window>
  );
}