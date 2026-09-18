import "./Popups.css";

export function ContactPopup() {
  return (
    <div className="popup-body">
      <p>Have an inquiry? Reach out to us below.</p>
      
      <div className="media-embed">
        <img src="https://placehold.co/600x300/ff4d4d/white?text=Bawang+Studio" alt="Contact Us Banner" />
      </div>

      <ul>
        <li>Email: <a href="mailto:hello@bawang.studio">hello@bawang.studio</a></li>
        <li>Instagram: <a href="https://instagram.com/bawang.studio" target="_blank" rel="noreferrer">@bawang.studio</a></li>
        <li>Twitter: <a href="https://twitter.com/bawangstudio" target="_blank" rel="noreferrer">@bawangstudio</a></li>
      </ul>
    </div>
  );
}
