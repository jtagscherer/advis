package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a canvas that displays further 
# information about the content of a confusion matrix as an overlay.
tf_web_library(
	name = "matrix_overlay",
	srcs = [
		"matrix-overlay.html",
		"matrix-overlay.css",
		"matrix-overlay.ts"
	],
	path = "/matrix-overlay",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "matrix_overlay_scss",
  src = "matrix-overlay.scss"
)

# Move the compiled CSS file to our desired path
genrule(
  name = "matrix_overlay_css",
  srcs = [":matrix_overlay_scss"],
  outs = ["matrix-overlay.css"],
  cmd = "cat $(locations :matrix_overlay_scss) > $@"
)
