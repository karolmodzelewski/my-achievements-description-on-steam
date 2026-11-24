// Written by scripts/update-xcf-wallpaper.py, as GIMP's exit code doesn't tell whether the script succeeded
export interface GimpResult {
    error: 'TEXT_LAYERS' | 'GIMP' | null;
    textLayersAmount?: number;
    message?: string;
}
