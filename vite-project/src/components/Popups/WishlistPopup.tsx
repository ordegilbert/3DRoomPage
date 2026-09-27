import "./Popups.css";

export function WishlistPopup() {
    return (
        <div className="popup-body">
            <p>Support us by adding our products to your wishlist!</p>
            <iframe src="https://store.steampowered.com/widget/4131930/" frameBorder="0" width="350" height="200"></iframe>
        </div>
    );
}
