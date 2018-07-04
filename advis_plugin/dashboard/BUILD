package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains the dashboard
tf_web_library(
	name = "dashboard",
	srcs = [
		"dashboard.html",
		"dashboard.css",
		"dashboard.ts"
	],
	path = "/advis/dashboard",
	deps = [
		"//advis_plugin/dashboard/shared/libraries/palette",
		"//advis_plugin/dashboard/shared/constants",
		"//advis_plugin/dashboard/section_header",
		"//advis_plugin/dashboard/model_list_item",
		"//advis_plugin/dashboard/distortion_list_item",
		"//advis_plugin/dashboard/accuracy_radar_chart",
		"//advis_plugin/dashboard/layer_visualization",
		"//advis_plugin/dashboard/graph_view",
		"//advis_plugin/dashboard/dialogs/distortion_configuration_dialog",
		"//advis_plugin/dashboard/dialogs/distortion_update_confirmation_dialog",
		"@org_polymer_iron_icon",
		"@org_polymer_iron_selector",
		"@org_polymer_paper_input",
		"@org_polymer_paper_material",
		"@org_polymer_paper_button",
		"@org_polymer_paper_icon_button",
    "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_categorization_utils",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_dashboard_common",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_tensorboard:registry"
	]
)

# Compile the dashboard's Sass stylesheet to CSS
sass_binary(
  name = "dashboard_scss",
  src = "dashboard.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:color",
		"//advis_plugin/dashboard/shared/style:style"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "dashboard_css",
  srcs = [":dashboard_scss"],
  outs = ["dashboard.css"],
  cmd = "cat $(locations :dashboard_scss) > $@"
)
