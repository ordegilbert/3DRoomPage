import { useState } from "react";
import { Howl } from "howler";

const bgm = new Howl({
  src: ["/audio/bgm.mp3"],
  loop: true,
  volume: 0.2,
});

export function OnionMascot() {
  const [playing, setPlaying] = useState(false);

  function toggleMusic() {
    if (playing) {
      bgm.fade(0.2, 0, 1000);
      setTimeout(() => bgm.stop(), 1000);
    } else {
      bgm.play();
      bgm.fade(0, 0.2, 1000);
    }
    setPlaying(!playing);
  }

  return (
    <div className="onion" onClick={toggleMusic}>
      {playing ? "🧅🎶💃" : "🧅😴"}
    </div>
  );
}
