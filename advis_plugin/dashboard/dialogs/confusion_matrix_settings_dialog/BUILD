package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains the confusion matrix settings dialog 
# component
tf_web_library(
	name = "confusion_matrix_settings_dialog",
	srcs = [
		"confusion-matrix-settings-dialog.html",
		"confusion-matrix-settings-dialog.css",
		"confusion-matrix-settings-dialog.ts"
	],
	path = "/dialogs/confusion-matrix-settings-dialog",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_dialog",
		"@org_polymer_paper_radio_group",
		"//advis_plugin/dashboard/dialogs/components/dialog_header",
		"//advis_plugin/dashboard/dialogs/components/dialog_behavior"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "confusion_matrix_settings_dialog_scss",
  src = "confusion-matrix-settings-dialog.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "confusion_matrix_settings_dialog_css",
  srcs = [":confusion_matrix_settings_dialog_scss"],
  outs = ["confusion-matrix-settings-dialog.css"],
  cmd = "cat $(locations :confusion_matrix_settings_dialog_scss) > $@"
)
