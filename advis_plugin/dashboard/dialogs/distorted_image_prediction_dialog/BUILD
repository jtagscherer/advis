package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains the distorted image prediction dialog 
# component
tf_web_library(
	name = "distorted_image_prediction_dialog",
	srcs = [
		"distorted-image-prediction-dialog.html",
		"distorted-image-prediction-dialog.css",
		"distorted-image-prediction-dialog.ts"
	],
	path = "/dialogs/distorted-image-prediction-dialog",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_polymer_paper_dialog",
		"@org_polymer_iron_list",
		"@org_polymer_iron_flex_layout",
		"//advis_plugin/dashboard/shared/constants",
		"//advis_plugin/dashboard/dialogs/components/dialog_header",
		"//advis_plugin/dashboard/dialogs/components/dialog_behavior",
		"//advis_plugin/dashboard/dialogs/distorted_image_prediction_dialog/distorted_image_item"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "distorted_image_prediction_dialog_scss",
  src = "distorted-image-prediction-dialog.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:color",
		"//advis_plugin/dashboard/shared/style:style"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "distorted_image_prediction_dialog_css",
  srcs = [":distorted_image_prediction_dialog_scss"],
  outs = ["distorted-image-prediction-dialog.css"],
  cmd = "cat $(locations :distorted_image_prediction_dialog_scss) > $@"
)
