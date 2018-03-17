load("@org_tensorflow_tensorboard//tensorboard/defs:vulcanize.bzl", "tensorboard_html_binary")
load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@org_tensorflow_tensorboard//tensorboard/defs:zipper.bzl", "tensorboard_zip_file")

py_binary(
	name = "advis_tensorboard",
	srcs = ["main.py"],
	data = ["assets.zip"],
	main = "main.py",
	srcs_version = "PY2AND3",
	deps = [
		"//advis_plugin",
		"@org_pocoo_werkzeug",
		"@org_tensorflow_tensorboard//tensorboard:default",
		"@org_tensorflow_tensorboard//tensorboard:program"
	],
	visibility = ["//:__pkg__"]
)

tf_web_library(
	name = "index",
	srcs = ["html/index.html"],
	path = "/",
	deps = [
		"//advis_plugin:dashboard",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:webcomponentsjs",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_tensorboard",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_tensorboard:default_plugins"
	]
)

tensorboard_html_binary(
	name = "index_bin",
	input_path = "/html/index.html",
	output_path = "/index.html",
	deps = [":index"]
)

tensorboard_zip_file(
	name = "assets",
	deps = [":index_bin"]
)
