import { Color } from 'pixel_combats/basic';

/* 
Hex-строка в формате RGB (альфа канал пуст)
ex: ColorsLib.HexToRGB("#43ff64");
*/
export function HexToRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? new Color(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 0) : null;
};

/* 
Hex-строка в формате RGBA 
ex: ColorsLib.HexToRGBA("#43ff64d9");
*/
export function HexToRGBA(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? new Color(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), parseInt(result[4], 16)) : null;
};

/*
ex: ColorsLib.RGB(255, 0, 255); // Вернет фиолетовый/сиреневый цвет
*/
export function RGB(r, g, b) {
    return new Color(r / 255, g / 255, b / 255, 0);
};

/*
ex: ColorsLib.RGBA(255, 0, 255, 0.25); // Вернет пастельный фиолетовый/сиреневый цвет
*/
export function RGBA(r, g, b, a) {
    return new Color(r / 255, g / 255, b / 255, a / 100);
};

/*

*/
function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

/*
Из цвета сделает Hex-строку.
Полезно, если нужно синхронизировать цвет зоны и цвет команды.
*/
export function ColorToHex(color) {
    return `#${componentToHex(Math.floor(color.r * 255))}${componentToHex(Math.floor(color.g * 255))}${componentToHex(Math.floor(color.b * 255))}`;
}

/*
-- Цвета --
Если ссытесь насчет "оптимизации" - закомментируйте часть цветов
ex: ColorsLib.Red;
*/
export const Colors = {
    // Основная группа
    Red: new Color(1, 0, 0, 0),
    Blue: new Color(0, 0, 1, 0),
    Green: new Color(0, 0.7, 0, 0),
    Yellow: new Color(1, 1, 0, 0),
    Magenta: new Color(1, 0, 1, 0),
    Cyan: new Color(0, 1, 1, 0),
    Purple: new Color(0.7, 0, 0.7, 0),
    Lime: new Color(0, 1, 0, 0),
    White: new Color(1, 1, 1, 0),
    Black: new Color(0, 0, 0, 0),
    Gray: new Color(0.5, 0.5, 0.5, 0),
    Orange: new Color(1, 0.7, 0, 0),

    // Оттенки
    // Взяты с сайта https://colorscheme.ru/html-colors.html, можете посмотреть что представляет из себя каждый цвет
    Gold: RGB(255, 215, 0),
    Moccasin: RGB(255, 228, 181),
    Khaki: RGB(240, 230, 140),
    DarkKhaki: RGB(189, 183, 107),
    OrangeRed: RGB(255, 69, 0),
    Pink: RGB(255, 192, 203),
    HotPink: RGB(255, 105, 180),
    MediumVioletRed: RGB(199, 21, 133),
    DarkRed: RGB(139, 0, 0),
    IndianRed: RGB(205, 92, 92),
    Salmon: RGB(250, 128, 114),
    Crimson: RGB(220, 20, 60),
    Lavender: RGB(230, 230, 250),
    Plum: RGB(221, 160, 221),
    MediumPurple: RGB(147, 112, 219),
    BlueViolet: RGB(138, 43, 226),
    DarkViolet: RGB(148, 0, 211),
    DarkMagenta: RGB(139, 0, 139),
    Indigo: RGB(75, 0, 130),
    Bisque: RGB(255, 228, 196),
    BurlyWood: RGB(222, 184, 135),
    SandyBrown: RGB(244, 164, 96),
    Chocolate: RGB(210, 105, 30),
    Brown: RGB(165, 42, 42),
    Sienna: RGB(160, 82, 45),
    LightGray: RGB(211, 211, 211),
    DarkGray: RGB(169, 169, 169),
    Silver: RGB(192, 192, 192),
    LightSlateGray: RGB(119, 136, 153),
    SlateGray: RGB(112, 128, 144),
    DarkSlateGray: RGB(47, 79, 79),
    MistyRose: RGB(255, 228, 225),
    AntiqueWhite: RGB(250, 235, 215),
    Aquamarine: RGB(127, 255, 212),
    Turquoise: RGB(64, 224, 208),
    SteelBlue: RGB(70, 130, 180),
    SkyBlue: RGB(135, 206, 235),
    DeepSkyBlue: RGB(0, 191, 255),
    DogherBlue: RGB(30, 144, 255),
    RoyalBlue: RGB(65, 105, 225),
    DarkBlue: RGB(0, 0, 139),
    GreenYellow: RGB(173, 255, 47),
    MediumSpringGreen: RGB(0, 250, 154),
    SpringGreen: RGB(0, 255, 127),
    DarkSeaGreen: RGB(143, 188, 143),
    Teal: RGB(0, 128, 128),
    LightGreen: RGB(144, 238, 144),
}