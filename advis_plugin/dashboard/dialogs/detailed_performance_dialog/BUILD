package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a dialog for assessing detailed 
# performance metrics of a model.
tf_web_library(
	name = "detailed_performance_dialog",
	srcs = [
		"detailed-performance-dialog.html",
		"detailed-performance-dialog.css",
		"detailed-performance-dialog.ts"
	],
	path = "/dialogs/detailed-performance-dialog",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_dialog",
		"//advis_plugin/dashboard/dialogs/components/dialog_header",
		"//advis_plugin/dashboard/dialogs/components/dialog_header/categorized_header_item",
		"//advis_plugin/dashboard/dialogs/components/dialog_behavior",
		"//advis_plugin/dashboard/dialogs/detailed_performance_dialog/performance_metric",
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "detailed_performance_dialog_scss",
  src = "detailed-performance-dialog.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:style"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "detailed_performance_dialog_css",
  srcs = [":detailed_performance_dialog_scss"],
  outs = ["detailed-performance-dialog.css"],
  cmd = "cat $(locations :detailed_performance_dialog_scss) > $@"
)
