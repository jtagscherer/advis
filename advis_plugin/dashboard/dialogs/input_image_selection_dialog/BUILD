package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains the input image selection dialog.
tf_web_library(
	name = "input_image_selection_dialog",
	srcs = [
		"input-image-selection-dialog.html",
		"input-image-selection-dialog.css",
		"input-image-selection-dialog.ts"
	],
	path = "/dialogs/input-image-selection-dialog",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_dialog",
		"@org_polymer_iron_list",
		"@org_polymer_iron_flex_layout",
		"//advis_plugin/dashboard/dialogs/input_image_selection_dialog/input_image_item",
		"//advis_plugin/dashboard/dialogs/input_image_selection_dialog/confusion_matrix",
		"//advis_plugin/dashboard/dialogs/components/dialog_header",
		"//advis_plugin/dashboard/dialogs/components/dialog_header/categorized_header_item",
		"//advis_plugin/dashboard/dialogs/components/dialog_behavior",
		"//advis_plugin/dashboard/section_header"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "input_image_selection_dialog_scss",
  src = "input-image-selection-dialog.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:style",
		"//advis_plugin/dashboard/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "input_image_selection_dialog_css",
  srcs = [":input_image_selection_dialog_scss"],
  outs = ["input-image-selection-dialog.css"],
  cmd = "cat $(locations :input_image_selection_dialog_scss) > $@"
)
