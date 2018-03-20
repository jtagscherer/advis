package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains the test card component
tf_web_library(
	name = "test_card",
	srcs = [
		"test-card.html",
		"test-card.css",
		"test-card.ts"
	],
	path = "/test-card",
	deps = [
		"test_card_css",
		"@org_polymer_paper_icon_button",
    "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
    "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:lodash",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_card_heading",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_color_scale"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "test_card_scss",
  src = "test-card.scss"
)

# Move the compiled CSS file to our desired path
genrule(
  name = "test_card_css",
  srcs = [":test_card_scss"],
  outs = ["test-card.css"],
  cmd = "cat $(locations :test_card_scss) > $@",
)
