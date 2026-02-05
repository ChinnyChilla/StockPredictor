# import base64
# from PIL import Image, UnidentifiedImageError
# from io import BytesIO
# import numpy as np

# def base64_to_pil_img(base64_img):
#     """Converts a Base64-encoded image to a PIL Image object, handling potential padding and data URI prefix issues."""
#     # Check if this is a data URI and strip the prefix if present
#     if "base64," in base64_img:
#         base64_img = base64_img.split("base64,")[-1]
    
#     # Add padding if necessary to make the base64 string length divisible by 4
#     base64_img += "=" * ((4 - len(base64_img) % 4) % 4)
    
#     try:
#         image_data = base64.b64decode(base64_img)
#         image = Image.open(BytesIO(image_data))
#         return image
#     except UnidentifiedImageError as e:
#         print(f"Cannot identify image file: {e}")
#         return None
#     except base64.binascii.Error as e:
#         print(f"Base64 decoding error: {e}")
#         return None

# def prepare_image(image, target_size):
#     """Preprocess the image for model prediction."""
#     if image.mode != "RGB":
#         image = image.convert("RGB")
#     image = image.resize(target_size)
#     image_array = np.asarray(image)
#     image_array = image_array / 255.0  # Normalize to [0,1]
#     image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension
#     return image_array
