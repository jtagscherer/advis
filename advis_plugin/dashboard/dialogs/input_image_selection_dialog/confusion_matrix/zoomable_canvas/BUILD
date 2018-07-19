package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a canvas that can be zoomed and panned.
tf_web_library(
	name = "zoomable_canvas",
	srcs = [
		"zoomable-canvas.html",
		"zoomable-canvas.css",
		"zoomable-canvas.ts"
	],
	path = "/zoomable-canvas",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "zoomable_canvas_scss",
  src = "zoomable-canvas.scss"
)

# Move the compiled CSS file to our desired path
genrule(
  name = "zoomable_canvas_css",
  srcs = [":zoomable_canvas_scss"],
  outs = ["zoomable-canvas.css"],
  cmd = "cat $(locations :zoomable_canvas_scss) > $@"
)
