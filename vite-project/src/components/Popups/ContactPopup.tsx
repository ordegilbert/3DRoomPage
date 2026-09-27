import "./Popups.css";

export function ContactPopup() {
  return (
    <div className="popup-body">
      <div className="media-embed" style={{ marginBottom: '16px' }}>
        <img src="./Loading.gif" alt="Bawang Studio" />
      </div>

      <ul>
        <li>Feel free to contact us at:</li>
        <li>Email: <a href="mailto:contact@bawangstudio.com">contact@bawangstudio.com</a></li>
      </ul>
    </div>
  );
}
