import { StickyNoteWindow } from "../components/Window/StickyNoteWindow";

type WindowProps = {
  onClose: () => void;
  onFocus: () => void;
  focused: boolean;
  initialLeft?: string;
  initialTop?: string;
};

export function GamesWindow({
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
        <h2>Games</h2>
        <p>Silent Trip</p>
        <a href="https://store.steampowered.com/app/4131930/Silent_Trip/" target="_blank">
            Wishlist now!
          </a>
      </StickyNoteWindow>
    );
}
