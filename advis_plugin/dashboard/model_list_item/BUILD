package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a simple section header.
tf_web_library(
	name = "model_list_item",
	srcs = [
		"model-list-item.html",
		"model-list-item.css",
		"model-list-item.ts"
	],
	path = "/model-list-item",
	deps = [
		"//advis_plugin/dashboard/model_list_item/model_metric",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_ripple"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "model_list_item_scss",
  src = "model-list-item.scss",
	deps = [
		"//advis_plugin/shared/style:text",
		"//advis_plugin/shared/style:style"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "model_list_item_css",
  srcs = [":model_list_item_scss"],
  outs = ["model-list-item.css"],
  cmd = "cat $(locations :model_list_item_scss) > $@"
)
