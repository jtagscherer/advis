package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

licenses(["notice"])  # Apache 2.0

tf_web_library(
	name = "advis_tf_graph",
	srcs = [
		"advis-tf-graph.html",
		"advis-tf-graph-minimap.html",
		"advis-tf-graph-scene.html"
	],
	path = "/advis-tf-graph",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_dashboard_common",
		"//advis_plugin/dashboard/graph_view/components/advis_tf_graph_common",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_iron_flex_layout",
		"@org_polymer_iron_icons",
		"@org_polymer_paper_button",
		"@org_polymer_paper_dropdown_menu",
		"@org_polymer_paper_input",
		"@org_polymer_paper_menu",
		"@org_polymer_paper_radio_group",
		"@org_polymer_paper_toggle_button",
		"@org_polymer_paper_tooltip"
	]
)
