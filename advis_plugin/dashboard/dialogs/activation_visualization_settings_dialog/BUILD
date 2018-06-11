package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains the graph settings dialog component
tf_web_library(
	name = "activation_visualization_settings_dialog",
	srcs = [
		"activation-visualization-settings-dialog.html",
		"activation-visualization-settings-dialog.css",
		"activation-visualization-settings-dialog.ts"
	],
	path = "/dialogs/activation-visualization-settings-dialog",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_dialog",
		"@org_polymer_paper_radio_group",
		"@org_polymer_paper_toggle_button",
		"//advis_plugin/dashboard/dialogs/components/dialog_header",
		"//advis_plugin/dashboard/dialogs/components/dialog_header/categorized_header_item",
		"//advis_plugin/dashboard/dialogs/components/dialog_behavior"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "activation_visualization_settings_dialog_scss",
  src = "activation-visualization-settings-dialog.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "activation_visualization_settings_dialog_css",
  srcs = [":activation_visualization_settings_dialog_scss"],
  outs = ["activation-visualization-settings-dialog.css"],
  cmd = "cat $(locations :activation_visualization_settings_dialog_scss) > $@"
)
