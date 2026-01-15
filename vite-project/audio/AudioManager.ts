import { Howl } from "howler";

class AudioManager {
  private static instance: AudioManager;

  click = new Howl({ src: ["/audio/click.wav"], volume: 0.5 });
  open = new Howl({ src: ["/audio/open.mp3"], volume: 0.6 });
  close = new Howl({ src: ["/audio/close.mp3"], volume: 0.5 });

  static get() {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }
}

export const audio = AudioManager.get();