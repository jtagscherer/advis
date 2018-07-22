package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a confusion matrix depicting a model's 
# predictions.
tf_web_library(
	name = "confusion_matrix",
	srcs = [
		"confusion-matrix.html",
		"confusion-matrix.css",
		"confusion-matrix.ts"
	],
	path = "/confusion-matrix",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"//advis_plugin/dashboard/shared/libraries/chroma",
		"//advis_plugin/dashboard/dialogs/input_image_selection_dialog/confusion_matrix/zoomable_canvas",
		"//advis_plugin/dashboard/dialogs/input_image_selection_dialog/confusion_matrix/matrix_overlay",
		"//advis_plugin/dashboard/dialogs/input_image_selection_dialog/confusion_matrix/label_view"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "confusion_matrix_scss",
  src = "confusion-matrix.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:color",
		"//advis_plugin/dashboard/shared/style:text"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "confusion_matrix_css",
  srcs = [":confusion_matrix_scss"],
  outs = ["confusion-matrix.css"],
  cmd = "cat $(locations :confusion_matrix_scss) > $@"
)
