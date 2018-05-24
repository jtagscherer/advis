package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

licenses(["notice"])  # Apache 2.0

tf_web_library(
	name = "tf_graph_controls",
	srcs = ["tf-graph-controls.html"],
	path = "/tf-graph-controls",
	deps = [
		"//advis_plugin/dashboard/graph_view/components/tf_graph_common",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_dashboard_common",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_button",
		"@org_polymer_paper_dropdown_menu",
		"@org_polymer_paper_icon_button",
		"@org_polymer_paper_item",
		"@org_polymer_paper_menu",
		"@org_polymer_paper_radio_group",
		"@org_polymer_paper_toggle_button",
		"@org_polymer_paper_tooltip"
	]
)
