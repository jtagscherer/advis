py_library(
	name = "models",
	srcs = ["models.py", "preprocessing.py"],
	srcs_version = "PY2AND3",
  visibility = ["//visibility:public"],
  data = [
    "@model_inception_v3//:inception_v3.ckpt"
  ]
)

py_library(
	name = "inception",
	srcs = ["inception.py"],
	srcs_version = "PY2AND3",
  visibility = ["//visibility:public"],
  deps = [
    ":models"
  ]
)

exports_files(
  ["inception_v3.ckpt"],
  visibility = ["//visibility:public"]
)
