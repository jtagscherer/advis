package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains the detailed predictions dialog 
# component
tf_web_library(
	name = "detailed_predictions_dialog",
	srcs = [
		"detailed-predictions-dialog.html",
		"detailed-predictions-dialog.css",
		"detailed-predictions-dialog.ts"
	],
	path = "/dialogs/detailed-predictions-dialog",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_polymer_paper_dialog",
		"@org_polymer_paper_button",
		"//advis_plugin/dashboard/dialogs/components/dialog_header",
		"//advis_plugin/dashboard/dialogs/components/dialog_behavior",
		"//advis_plugin/dashboard/dialogs/detailed_predictions_dialog/preview_and_predictions"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "detailed_predictions_dialog_scss",
  src = "detailed-predictions-dialog.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:color",
		"//advis_plugin/dashboard/shared/style:style"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "detailed_predictions_dialog_css",
  srcs = [":detailed_predictions_dialog_scss"],
  outs = ["detailed-predictions-dialog.css"],
  cmd = "cat $(locations :detailed_predictions_dialog_scss) > $@"
)
