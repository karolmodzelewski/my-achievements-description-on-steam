const textEncoder = new TextEncoder();

// Steam limits the description by its UTF-8 size, measured on a description cut off by Steam
export const STEAM_DESCRIPTION_MAX_SIZE = 8000;
// Browsers send line breaks of a textarea as \r\n
export const STEAM_LINE_BREAK_SIZE = 2;

export const getSteamTextSize = (text: string): number => textEncoder.encode(text.replaceAll('\n', '\r\n')).length;

// Steam cuts the text at the first character not fully fitting in the available size
export const getSteamCutOffIndex = (text: string, availableSize: number): number => {
    let size = 0;
    let index = 0;

    for (const character of text) {
        size += getSteamTextSize(character);

        if (size > availableSize) {
            return index;
        }

        // Characters outside of the Basic Multilingual Plane take two UTF-16 code units
        index += character.length;
    }

    return index;
};
