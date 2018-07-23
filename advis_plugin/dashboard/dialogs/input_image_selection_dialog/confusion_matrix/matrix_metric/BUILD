package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a canvas that displays a confusion matrix 
# metric such as precision or recall in a dynamically scrolling canvas.
tf_web_library(
	name = "matrix_metric",
	srcs = [
		"matrix-metric.html",
		"matrix-metric.css",
		"matrix-metric.ts"
	],
	path = "/matrix-metric",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "matrix_metric_scss",
  src = "matrix-metric.scss"
)

# Move the compiled CSS file to our desired path
genrule(
  name = "matrix_metric_css",
  srcs = [":matrix_metric_scss"],
  outs = ["matrix-metric.css"],
  cmd = "cat $(locations :matrix_metric_scss) > $@"
)
