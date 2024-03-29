package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains the distortion configuration dialog 
# component
tf_web_library(
	name = "distortion_configuration_dialog",
	srcs = [
		"distortion-configuration-dialog.html",
		"distortion-configuration-dialog.css",
		"distortion-configuration-dialog.ts"
	],
	path = "/dialogs/distortion-configuration-dialog",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:lodash",
		"@org_polymer_paper_dialog",
		"@org_polymer_paper_button",
		"@org_polymer_iron_selector",
		"@org_polymer_neon_animation",
		"//advis_plugin/dashboard/dialogs/components/dialog_header",
		"//advis_plugin/dashboard/dialogs/components/dialog_behavior",
		"//advis_plugin/dashboard/distortion_list_item",
		"//advis_plugin/dashboard/section_header",
		"//advis_plugin/dashboard/empty_state",
		"//advis_plugin/dashboard/dialogs/distortion_configuration_dialog/distortion_preview",
		"//advis_plugin/dashboard/dialogs/distortion_configuration_dialog/parameter_configuration"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "distortion_configuration_dialog_scss",
  src = "distortion-configuration-dialog.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:color",
		"//advis_plugin/dashboard/shared/style:style"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "distortion_configuration_dialog_css",
  srcs = [":distortion_configuration_dialog_scss"],
  outs = ["distortion-configuration-dialog.css"],
  cmd = "cat $(locations :distortion_configuration_dialog_scss) > $@"
)
