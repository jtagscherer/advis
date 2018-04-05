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
		"//advis_plugin/layer_image",
		"//advis_plugin/graph_view",
		"@org_polymer_iron_icon",
		"@org_polymer_paper_input",
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
		"//advis_plugin/shared:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "dashboard_css",
  srcs = [":dashboard_scss"],
  outs = ["dashboard.css"],
  cmd = "cat $(locations :dashboard_scss) > $@"
)
