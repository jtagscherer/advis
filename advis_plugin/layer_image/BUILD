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
  name = "layer_image_scss",
  src = "layer-image.scss"
)

# Move the compiled CSS file to our desired path
genrule(
  name = "layer_image_css",
  srcs = [":layer_image_scss"],
  outs = ["layer-image.css"],
  cmd = "cat $(locations :layer_image_scss) > $@",
)
