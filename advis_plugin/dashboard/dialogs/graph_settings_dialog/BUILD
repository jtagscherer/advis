package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains the graph settings dialog component
tf_web_library(
	name = "graph_settings_dialog",
	srcs = [
		"graph-settings-dialog.html",
		"graph-settings-dialog.css",
		"graph-settings-dialog.ts"
	],
	path = "/dialogs/graph-settings-dialog",
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
  name = "graph_settings_dialog_scss",
  src = "graph-settings-dialog.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "graph_settings_dialog_css",
  srcs = [":graph_settings_dialog_scss"],
  outs = ["graph-settings-dialog.css"],
  cmd = "cat $(locations :graph_settings_dialog_scss) > $@"
)
