package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains the unit details component
tf_web_library(
	name = "unit_details_dialog",
	srcs = [
		"unit-details-dialog.html",
		"unit-details-dialog.css",
		"unit-details-dialog.ts"
	],
	path = "/dialogs/unit-details-dialog",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_dialog",
		"//advis_plugin/dialogs/dialog_header",
		"//advis_plugin/dialogs/dialog_header/categorized_header_item"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "unit_details_dialog_scss",
  src = "unit-details-dialog.scss"
)

# Move the compiled CSS file to our desired path
genrule(
  name = "unit_details_dialog_css",
  srcs = [":unit_details_dialog_scss"],
  outs = ["unit-details-dialog.css"],
  cmd = "cat $(locations :unit_details_dialog_scss) > $@",
)
