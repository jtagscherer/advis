package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a dialog that allows the user to confirm 
# their distortion update and optionally rebuild the data cache.
tf_web_library(
	name = "distortion_update_confirmation_dialog",
	srcs = [
		"distortion-update-confirmation-dialog.html",
		"distortion-update-confirmation-dialog.css",
		"distortion-update-confirmation-dialog.ts"
	],
	path = "/dialogs/distortion-update-confirmation-dialog",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_polymer_paper_dialog",
		"@org_polymer_paper_button",
		"@org_polymer_paper_progress",
		"//advis_plugin/dashboard/dialogs/components/dialog_header",
		"//advis_plugin/dashboard/dialogs/components/dialog_behavior",
		"//advis_plugin/dashboard/shared/constants"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "distortion_update_confirmation_dialog_scss",
  src = "distortion-update-confirmation-dialog.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:color",
		"//advis_plugin/dashboard/shared/style:style",
		"//advis_plugin/dashboard/shared/style:text"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "distortion_update_confirmation_dialog_css",
  srcs = [":distortion_update_confirmation_dialog_scss"],
  outs = ["distortion-update-confirmation-dialog.css"],
  cmd = "cat $(locations :distortion_update_confirmation_dialog_scss) > $@"
)
