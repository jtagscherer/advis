package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

tf_web_library(
	name = "test_card",
	srcs = [
		"test-card.html",
		"test-card.ts"
	],
	path = "/test-card",
	deps = [
		"@org_polymer_paper_icon_button",
    "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
    "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:lodash",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_card_heading",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_color_scale"
	]
)
