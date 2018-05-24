package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

licenses(["notice"])  # Apache 2.0

tf_web_library(
	name = "tf_graph_debugger_data_card",
	srcs = [
		"tf-graph-debugger-data-card.html",
	],
	path = "/tf-graph-debugger-data-card",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_dashboard_common",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"//advis_plugin/dashboard/graph_view/components/tf_graph_common",
		"@org_polymer_paper_material",
		"@org_polymer_paper_slider",
		"@org_polymer_paper_spinner",
		"@org_polymer_paper_toggle_button"
	]
)
