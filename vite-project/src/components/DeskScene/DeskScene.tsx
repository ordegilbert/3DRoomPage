import "./DeskScene.css";
import web from "./Web.png";

import aboutHover from "./AboutUsHover.png";
import gamesHover from "./GamesHover.png";
import newsHover from "./NewsHover.png";

import { useEffect, useState } from "react";

type DeskSceneProps = {
  onAbout: () => void;
  onGames: () => void;
  onNews: () => void;
  onContact: () => void;
  onToggleMusic: () => void;
  musicOn: boolean;
};

function ContactAnimated() {
  const [frame, setFrame] = useState(0);

  const columns = 4;
  const rows = 6;
  const totalFrames = columns * rows;

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % totalFrames);
    }, 120);

    return () => clearInterval(interval);
  }, [totalFrames]);

  const col = frame % columns;
  const row = Math.floor(frame / columns);

  const xPercent = columns > 1 ? (col / (columns - 1)) * 100 : 0;
  const yPercent = rows > 1 ? (row / (rows - 1)) * 100 : 0;

  return (
    <>
      <div
        className="contact-base"
        style={{
          backgroundPosition: `${xPercent}% ${yPercent}%`,
        }}
      />
      <div
        className="contact-border"
        style={{
          backgroundPosition: `${xPercent}% ${yPercent}%`,
        }}
      />
    </>
  );
}

export function DeskScene({
  onAbout,
  onGames,
  onNews,
  onContact,
  onToggleMusic,
  musicOn,
}: DeskSceneProps) {
  return (
    <div className="desk-scene">
      <div className="scene-container">
        {/* BACKGROUND */}
        <img className="desk-bg" src={web} draggable={false} />

        {/* ABOUT */}
        <div className="object about">
          <img className="hover" src={aboutHover} />
          <button className="hitbox about-hitbox" onClick={onAbout} />
        </div>

        {/* GAMES */}
        <div className="object games">
          <img className="hover" src={gamesHover} />
          <button className="hitbox games-hitbox" onClick={onGames} />
        </div>

        {/* NEWS */}
        <div className="object news">
          <img className="hover" src={newsHover} />
          <button className="hitbox news-hitbox" onClick={onNews} />
        </div>

        {/* CONTACT */}
        <div className="object contact">
          <button className="contact-hitbox" onClick={onContact} />

          <ContactAnimated />
        </div>

        {/* MUSIC — Person */}
        <button
          className={`hitbox person ${musicOn ? "active" : ""}`}
          onClick={onToggleMusic}
        />
      </div>
    </div>
  );
}
