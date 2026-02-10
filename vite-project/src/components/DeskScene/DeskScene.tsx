import "./DeskScene.css";

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
  musicOn
}: DeskSceneProps) {
  return (
    <div className="desk-scene">
      <img
        src="./Web.png"
        alt="Desk scene"
        className="desk-background"
        draggable={false}
      />

      {/* ABOUT — Mug */}
      <button className="hitbox mug" onClick={onAbout} />

      {/* NEWS — Calendar */}
      <button className="hitbox calendar" onClick={onNews} />

      {/* GAMES — Phone */}
      <button className="hitbox phone" onClick={onGames} />

      {/* CONTACT — Letter */}
      <button className="hitbox letter" onClick={onContact} />

      {/* MUSIC — Person */}
      <button
        className={`hitbox person ${musicOn ? "active" : ""}`}
        onClick={onToggleMusic}
      />
    </div>
  );
}
