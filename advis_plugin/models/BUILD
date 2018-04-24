py_library(
	name = "models",
	srcs = ["models.py"],
	srcs_version = "PY2AND3",
  visibility = ["//visibility:public"],
	deps = [
		"//advis_plugin:layer_summary"
	],
  data = [
    "@model_inception_v3//:inception_v3.ckpt"
  ] + glob(["presets/*.py"])
)

exports_files(
  ["inception_v3.ckpt"],
  visibility = ["//visibility:public"]
)
