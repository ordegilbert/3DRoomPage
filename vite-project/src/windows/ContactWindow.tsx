import { Window } from "../components/Window/Window";

export function ContactWindow({ onClose, onFocus, focused }: { onClose: () => void; onFocus: () => void; focused: boolean }) {
  return (
    <Window title="Contact Bawang Studio" onClose={onClose} onFocus={onFocus} focused={focused}>
      <p>bawanggamestudio@gmail.com.</p>
    </Window>
  );
}
