package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a category and its prediction certainty.
tf_web_library(
	name = "prediction_category",
	srcs = [
		"prediction-category.html",
		"prediction-category.css",
		"prediction-category.ts"
	],
	path = "/prediction-category",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_progress",
		"@org_polymer_paper_tooltip"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "prediction_category_scss",
  src = "prediction-category.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:text",
		"//advis_plugin/dashboard/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "prediction_category_css",
  srcs = [":prediction_category_scss"],
  outs = ["prediction-category.css"],
  cmd = "cat $(locations :prediction_category_scss) > $@"
)
