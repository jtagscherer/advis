package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a canvas that displays hierarchical 
# category labels depending on the zoom level and panning position of a 
# confusion matrix.
tf_web_library(
	name = "label_view",
	srcs = [
		"label-view.html",
		"label-view.css",
		"label-view.ts"
	],
	path = "/label-view",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "label_view_scss",
  src = "label-view.scss"
)

# Move the compiled CSS file to our desired path
genrule(
  name = "label_view_css",
  srcs = [":label_view_scss"],
  outs = ["label-view.css"],
  cmd = "cat $(locations :label_view_scss) > $@"
)
