export const TABLE_OBJECT_NAMES = new Set([
    "02_PC",
    "02_Mouse",
    "02_Mouse_Pad",
    "02_Drawing_Tablet",
    "02_Pen",
    "02_Phone",
    "02_Monitor001",
    "02_Monitor002",
    "02_ClipBoard",
    "02_UnderDeskholder",
    "02_ACRemote.001",
    "02_Chair",
]);

export const BED_OBJECT_NAMES = new Set([
    "02_Bed",
    "02_Bed.001",
    "02_Bed.002",
    "02_Carpet",
]);

export const LEFT_ROOM_OBJECT_NAMES = new Set([
    "02_Cabinet",
    "02_Closet",
    "02_L_Closet Door",
    "02_L_Closet Door.001",
    "02_Canvas",
    "02_ClosedPainting",
]);

export const UPPER_ROOM_OBJECT_NAMES = new Set([
    "02_Clock",
]);

export const CUSTOM_OBJECT_LABELS: Record<string, string> = {
    "02_Clock": "About Us",
    "02_Canvas": "Press Kit",
    "02_Drawing_Tablet": "Press Kit",
    "02_Phone": "Socials",
    // "02_Monitor001": "Wishlist",
    "02_Monitor002": "Wishlist",
    "02_ClipBoard": "Fan Art",
    "02_Bed": "Contact Us",
    // Add other objects here to make them clickable and give them custom floating names
};
