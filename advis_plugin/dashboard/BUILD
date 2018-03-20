package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

tf_web_library(
	name = "dashboard",
	srcs = ["dashboard.html"],
	path = "/advis/dashboard",
	deps = [
    "//advis_plugin/test_card",
		"@org_polymer_iron_icon",
		"@org_polymer_paper_input",
    "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_categorization_utils",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_dashboard_common",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_runs_selector",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_tensorboard:registry"
	]
)
