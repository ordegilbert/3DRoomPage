import { Window } from "../components/Window/Window";

export function GamesWindow({ onClose, onFocus, focused }: { onClose: () => void; onFocus: () => void; focused: boolean }) {
  return (
    <Window title="Games by Bawang Studio" onClose={onClose} onFocus={onFocus} focused={focused}>
      <p>Coming soon...</p>
    </Window>
  );
}
