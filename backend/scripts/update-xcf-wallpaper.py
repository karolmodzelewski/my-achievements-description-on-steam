# Run by the backend through GIMP's console in batch mode, the paths and the text come from the environment
import json
import os
import re
from xml.sax.saxutils import escape

from gi.repository import Gimp, Gio

TAG_PATTERN = re.compile(r'(<[^>]+>)')


def write_result(result):
    with open(os.environ['WALLPAPER_RESULT'], 'w', encoding='utf-8') as result_file:
        json.dump(result, result_file)


def get_text_layers(layers):
    text_layers = []

    for layer in layers:
        if isinstance(layer, Gimp.TextLayer):
            text_layers.append(layer)

        if layer.is_group():
            text_layers.extend(get_text_layers(layer.get_children()))

    return text_layers


# Keeps every tag of the markup and puts the text into its first text, so the new text keeps the font, size and colour
def replace_markup_text(markup, text):
    parts = TAG_PATTERN.split(markup)
    text_indexes = [index for index, part in enumerate(parts) if not TAG_PATTERN.fullmatch(part) and part.strip()]

    if not text_indexes:
        return escape(text)

    for index in text_indexes:
        parts[index] = ''

    parts[text_indexes[0]] = escape(text)

    return ''.join(parts)


# A temporary text layer with a dynamic box takes the natural width of the text
def get_text_width(image, layer):
    size, unit = layer.get_font_size()
    measuring_layer = Gimp.TextLayer.new(image, ' ', layer.get_font(), size, unit)

    image.insert_layer(measuring_layer, None, 0)
    measuring_layer.set_letter_spacing(layer.get_letter_spacing())

    if layer.get_markup():
        measuring_layer.set_markup(layer.get_markup())
    else:
        measuring_layer.set_text(layer.get_text())

    width = measuring_layer.get_width()

    image.remove_layer(measuring_layer)

    return width


# A fixed text box would wrap a longer text, so it's widened to fit it, keeping its justified edge in place
def widen_fixed_box(image, layer):
    previous_width = layer.get_width()
    width = get_text_width(image, layer)

    if width <= previous_width:
        return

    _, offset_x, offset_y = layer.get_offsets()
    justification = layer.get_justification()

    layer.resize(width, layer.get_height())

    if justification == Gimp.TextJustification.RIGHT:
        layer.set_offsets(offset_x - (width - previous_width), offset_y)
    elif justification == Gimp.TextJustification.CENTER:
        layer.set_offsets(offset_x - (width - previous_width) // 2, offset_y)


def update_wallpaper():
    text = os.environ['WALLPAPER_TEXT']
    image = Gimp.file_load(Gimp.RunMode.NONINTERACTIVE, Gio.File.new_for_path(os.environ['WALLPAPER_SOURCE']))
    text_layers = get_text_layers(image.get_layers())

    if len(text_layers) != 1:
        image.delete()
        write_result({'error': 'TEXT_LAYERS', 'textLayersAmount': len(text_layers)})

        return

    layer = text_layers[0]
    markup = layer.get_markup()

    if markup:
        layer.set_markup(replace_markup_text(markup, text))
    else:
        layer.set_text(text)

    widen_fixed_box(image, layer)
    Gimp.file_save(Gimp.RunMode.NONINTERACTIVE, image, Gio.File.new_for_path(os.environ['WALLPAPER_XCF']), None)

    flattened_image = image.duplicate()

    flattened_image.merge_visible_layers(Gimp.MergeType.CLIP_TO_IMAGE)
    Gimp.file_save(Gimp.RunMode.NONINTERACTIVE, flattened_image, Gio.File.new_for_path(os.environ['WALLPAPER_PNG']), None)
    flattened_image.delete()
    image.delete()
    write_result({'error': None})


try:
    update_wallpaper()
except Exception as error:
    write_result({'error': 'GIMP', 'message': str(error)})
