py_library(
	name = "models",
	srcs = ["models.py"],
	srcs_version = "PY2AND3",
  visibility = ["//visibility:public"],
  data = [
    "@model_inception_v3//:inception-v3/model.ckpt-157585"
  ]
)

exports_files(
  ["inception-v3/model.ckpt-157585"],
  visibility = ["//visibility:public"]
)
