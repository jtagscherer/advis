package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a component that shows a preview of the 
# input image that may be distorted and the predictions of a model when given 
# this image.
tf_web_library(
	name = "preview_and_predictions",
	srcs = [
		"preview-and-predictions.html",
		"preview-and-predictions.css",
		"preview-and-predictions.ts"
	],
	path = "/preview-and-predictions",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"//advis_plugin/dashboard/shared/constants",
		"//advis_plugin/dashboard/section_header",
		"//advis_plugin/dashboard/image_loader",
		"//advis_plugin/dashboard/dialogs/detailed_predictions_dialog/preview_and_predictions/prediction_category"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "preview_and_predictions_scss",
  src = "preview-and-predictions.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:text",
		"//advis_plugin/dashboard/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "preview_and_predictions_css",
  srcs = [":preview_and_predictions_scss"],
  outs = ["preview-and-predictions.css"],
  cmd = "cat $(locations :preview_and_predictions_scss) > $@"
)
