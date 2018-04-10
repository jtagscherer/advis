package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains the layer image component
tf_web_library(
	name = "layer_image",
	srcs = [
		"layer-image.html",
		"layer-image.css",
		"layer-image.ts"
	],
	path = "/layer-image",
	deps = [
		"//advis_plugin/dialogs/unit_details_dialog",
    "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "layer_image_scss",
  src = "layer-image.scss",
	deps = [
		"//advis_plugin/shared:text"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "layer_image_css",
  srcs = [":layer_image_scss"],
  outs = ["layer-image.css"],
  cmd = "cat $(locations :layer_image_scss) > $@"
)
