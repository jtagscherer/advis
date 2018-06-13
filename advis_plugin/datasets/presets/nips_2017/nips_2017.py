from os.path import dirname, join
import json

def get_display_name():
	return 'NIPS 2017 Adversarial Learning Challenge'

def get_categories():
	categories_file = join(dirname(__file__), join('data', 'categories.json'))
	
	with open(categories_file, 'r') as categories_data:
		categories = json.load(categories_data)
	
	return categories

def get_all_images():
	# Retrieve image descriptions from their file
	images_file = join(dirname(__file__), join('data', 'images.json'))
	
	with open(images_file, 'r') as images_data:
		images = json.load(images_data)
	
	# Replace image IDs with their full file name
	image_base_path = join(dirname(__file__), join('data', 'images'))
	
	return [
		{
			'id': image['id'],
			'index': index,
			'path': join(image_base_path, '{}.png'.format(image['id'])),
			'categoryId': image['categoryId'],
			'categoryName': image['categoryName']
		} for index, image in enumerate(images)]
