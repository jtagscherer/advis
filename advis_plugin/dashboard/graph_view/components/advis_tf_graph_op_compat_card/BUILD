package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

licenses(["notice"])  # Apache 2.0

tf_web_library(
	name = "advis_tf_graph_op_compat_card",
	srcs = [
		"advis-tf-graph-op-compat-card.html",
		"advis-tf-graph-op-compat-list-item.html"
	],
	path = "/advis-tf-graph-op-compat-card",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_dashboard_common",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"//advis_plugin/dashboard/graph_view/components/advis_tf_graph_common",
		"//advis_plugin/dashboard/graph_view/components/advis_tf_graph_info:advis_tf_graph_icon",
		"@org_polymer_iron_collapse",
		"@org_polymer_iron_list",
		"@org_polymer_paper_icon_button",
		"@org_polymer_paper_item"
	]
)
