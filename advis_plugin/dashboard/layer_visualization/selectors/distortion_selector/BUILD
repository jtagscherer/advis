package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a component for selecting a distortion 
# method
tf_web_library(
	name = "distortion_selector",
	srcs = [
		"distortion-selector.html",
		"distortion-selector.css",
		"distortion-selector.ts"
	],
	path = "/distortion-selector",
	deps = [
    "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_polymer_paper_card",
		"@org_polymer_iron_icon",
		"@org_polymer_paper_ripple",
		"@org_polymer_paper_menu_button"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "distortion_selector_scss",
  src = "distortion-selector.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:text",
		"//advis_plugin/dashboard/shared/style:color",
		"//advis_plugin/dashboard/shared/style:style"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "distortion_selector_css",
  srcs = [":distortion_selector_scss"],
  outs = ["distortion-selector.css"],
  cmd = "cat $(locations :distortion_selector_scss) > $@"
)
