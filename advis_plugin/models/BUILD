py_library(
	name = "models",
	srcs = ["models.py", "util.py"],
	srcs_version = "PY2AND3",
	deps = ["//data/checkpoints:checkpoints"],
  visibility = ["//visibility:public"],
  data = glob(["presets/*.py"])
)
