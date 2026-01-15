import { useState } from "react";
import { AboutWindow } from "./windows/AboutWindow";
import { GamesWindow } from "./windows/GamesWindow";
import { ContactWindow } from "./windows/ContactWindow";
import { NewsWindow } from "./windows/NewsWindow";
import { OnionMascot } from "./components/OnionMascot/OnionMascot";
import { audio } from "../audio/AudioManager";

type WindowType = "about" | "games" | "contact" | "news";

function App() {
  const [openWindows, setOpenWindows] = useState<WindowType[]>([]);
  const [focusedWindow, setFocusedWindow] = useState<WindowType | null>(null);

  function openWindow(type: WindowType) {
    audio.open.play();

    setOpenWindows(prev =>
      prev.includes(type) ? prev : [...prev, type]
    );

    setFocusedWindow(type);
  }

  function closeWindow(type: WindowType) {
    audio.close.play();

    setOpenWindows(prev =>
      prev.filter(w => w !== type)
    );

    setFocusedWindow(prev =>
      prev === type ? null : prev
    );
  }

  function focusWindow(type: WindowType) {
    setFocusedWindow(type);
  }

  return (
    <>
      <OnionMascot />

      <div style={{ padding: 16 }}>
        <button onClick={() => openWindow("about")}>About</button>
        <button onClick={() => openWindow("games")}>Games</button>
        <button onClick={() => openWindow("contact")}>Contact</button>
        <button onClick={() => openWindow("news")}>News</button>
      </div>

      {openWindows.includes("about") && (
        <AboutWindow
          onClose={() => closeWindow("about")}
          onFocus={() => focusWindow("about")}
          focused={focusedWindow === "about"}
        />
      )}

      {openWindows.includes("games") && (
        <GamesWindow
          onClose={() => closeWindow("games")}
          onFocus={() => focusWindow("games")}
          focused={focusedWindow === "games"}
        />
      )}

      {openWindows.includes("contact") && (
        <ContactWindow
          onClose={() => closeWindow("contact")}
          onFocus={() => focusWindow("contact")}
          focused={focusedWindow === "contact"}
        />
      )}

      {openWindows.includes("news") && (
        <NewsWindow
          onClose={() => closeWindow("news")}
          onFocus={() => focusWindow("news")}
          focused={focusedWindow === "news"}
        />
      )}
    </>
  );
}

export default App;