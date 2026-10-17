export const TABLE_OBJECT_NAMES = new Set([
    // TexturedModel names
    "PC",
    "Mouse",
    "MousePad",
    "DrawingTablet",
    "Pen",
    "Phone",
    "PortraitMonitor",
    "LandScapeMonitor",
    "ClipBoard",
    "ACRemote",
    "Chair",
    "Table",
    "Cabel",
    // Legacy names
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
    // TexturedModel names
    "Bed",
    "Carpet",
    "Posters",
    // Legacy names
    "02_Bed",
    "02_Bed.001",
    "02_Bed.002",
    "02_Carpet",
    "02_Picture",
    "02_Picture.001",
    "02_Picture.002",
    "02_Picture.003",
]);

export const LEFT_ROOM_OBJECT_NAMES = new Set([
    // TexturedModel names
    "Closet",
    "PinBoard",
    "Standing_Painting",
    "ClosedPainting ",
    "ClosedPainting",
    "CoffeTable",
    "ProbsOnCoffeTable",
    "Paints",
    // Legacy names
    "02_Cabinet",
    "02_Closet",
    "02_L_Closet Door",
    "02_L_Closet Door.001",
    "02_Canvas",
    "02_ClosedPainting",
]);

export const UPPER_ROOM_OBJECT_NAMES = new Set([
    // TexturedModel names
    "Clock",
    // Legacy names
    "02_Clock",
]);

export const CUSTOM_OBJECT_LABELS: Record<string, string> = {
    // TexturedModel names
    "Clock": "About Us",
    "Standing_Painting": "Press Kit",
    "PinBoard": "Press Kit",
    "DrawingTablet": "Press Kit",
    "Phone": "Socials",
    "LandScapeMonitor": "Wishlist",
    "PortraitMonitor": "Wishlist",
    "ClipBoard": "Fan Art",
    "Bed": "Contact Us",

    // Legacy names
    "02_Clock": "About Us",
    "02_Canvas": "Press Kit",
    "02_Drawing_Tablet": "Press Kit",
    "02_Phone": "Socials",
    "02_Monitor002": "Wishlist",
    "02_ClipBoard": "Fan Art",
    "02_Bed": "Contact Us",
};
