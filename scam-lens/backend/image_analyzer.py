import base64


def image_to_base64(image_bytes):
    """
    Convert uploaded image bytes into
    a Base64 string.
    """

    encoded_image = base64.b64encode(
        image_bytes
    ).decode("utf-8")

    return encoded_image
