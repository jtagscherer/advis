import os

from tensorboard.backend import http_util

def check_directory_validity(parser, arg):
  if not os.path.exists(arg):
    try:
      os.makedirs(arg)
    except Exception as error:
      print('Could not create the specified directory: {}'.format(error))

  if not os.path.isdir(arg):
    parser.error('The directory {} does not exist!'.format(arg))
  else:
    return arg

def check_missing_arguments(request, arguments):
	"""Check whether a request contains all necessary arguments.
	
	Arguments:
		request: The request to be checked.
		arguments: A list of all arguments that should be contained in the 
			request.
	Returns:
		None if no arguments are missing, or an appropriate response if some are in 
		fact missing.
	"""
	missing_arguments = []
	
	for argument in arguments:
		if argument not in request.args:
			missing_arguments.append(argument)
	
	if len(missing_arguments) > 0:
		return http_util.Respond(
			request,
			'Your request is missing the following necessary arguments: {}.'
				.format(' ,'.join(missing_arguments)),
			'text/plain',
			code=400
		)
	else:
		return None
