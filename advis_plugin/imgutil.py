"""
Utility methods for dealing with images and image tensors.
"""

import imghdr

_IMGHDR_TO_MIMETYPE = {
	'bmp': 'image/bmp',
	'gif': 'image/gif',
	'jpeg': 'image/jpeg',
	'png': 'image/png'
}

_DEFAULT_IMAGE_MIMETYPE = 'application/octet-stream'

def get_content_type(image):
	"""Analyze image data and return its content mime type.

	Arguments:
		image: The image data whose content type we want to know.
	"""
	
	return _IMGHDR_TO_MIMETYPE.get(
		imghdr.what(None, image),
		_DEFAULT_IMAGE_MIMETYPE
	)
