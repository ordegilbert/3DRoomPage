import news from "../data/news.json";
import { StickyNoteWindow } from "../components/Window/StickyNoteWindow";

type WindowProps = {
  onClose: () => void;
  onFocus: () => void;
  focused: boolean;
  initialLeft?: string;
  initialTop?: string;
};

export function NewsWindow({
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
          <h2>News!</h2>
          <p>Coming soon!</p>
      {news.map((item, index) => (
        <div key={index}>
          <strong>{item.date}</strong>
          <p>{item.title}</p>
          <a href={item.link} target="_blank">
            Read
          </a>
        </div>
      ))}
    </StickyNoteWindow>
  );
}
