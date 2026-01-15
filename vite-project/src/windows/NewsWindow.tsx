import news from "../data/news.json";
import { Window } from "../components/Window/Window";

export function NewsWindow({ onClose, onFocus, focused }: { onClose: () => void; onFocus: () => void; focused: boolean }) {
  return (
    <Window title="News & Updates" onClose={onClose} onFocus={onFocus} focused={focused}>
      {news.map((item, index) => (
        <div key={index}>
          <strong>{item.date}</strong>
          <p>{item.title}</p>
          <a href={item.link} target="_blank">Read</a>
        </div>
      ))}
    </Window>
  );
}