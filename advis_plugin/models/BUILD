load("@python_dependencies//:requirements.bzl", "requirement")

py_library(
	name = "models",
	srcs = ["models.py", "util.py"],
	srcs_version = "PY2AND3",
	deps = [
		"//checkpoints:checkpoints",
		"//advis_plugin:util",
		requirement('scikit-image')
	],
  visibility = ["//visibility:public"],
  data = glob(["presets/*.py"])
)
