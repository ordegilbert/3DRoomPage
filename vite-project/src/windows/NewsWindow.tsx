import news from "../data/news.json";
import { StickyNoteWindow } from "../components/Window/StickyNoteWindow";

export function NewsWindow({
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
