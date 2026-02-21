import "./DeskScene.css";
import web from "./Web.png";

import aboutHover from "./AboutUsHover.png";
import gamesHover from "./GamesHover.png";
import newsHover from "./NewsHover.png";
import contactHover from "./ContactUsHover.png";

type DeskSceneProps = {
  onAbout: () => void;
  onGames: () => void;
  onNews: () => void;
  onContact: () => void;
  onToggleMusic: () => void;
  musicOn: boolean;
};

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
        <img className="hover" src={contactHover} />
        <button className="hitbox contact-hitbox" onClick={onContact} />
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
