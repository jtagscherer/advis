package(default_visibility = ["//visibility:public"])

load("@python_dependencies//:requirements.bzl", "requirement")
load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

py_library(
	name = "routers",
	srcs = [
		"model_router.py",
		"prediction_router.py",
		"distortion_router.py",
		"dataset_router.py",
		"single_visualization_router.py",
		"composite_visualization_router.py",
		"node_difference_router.py"
	],
	srcs_version = "PY2AND3",
	deps = [
		"//advis_plugin:util",
		"@org_tensorflow_tensorboard//tensorboard/backend:http_util",
		requirement('numpy'),
		requirement('Pillow')
	]
)
