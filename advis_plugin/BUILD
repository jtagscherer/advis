package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

py_library(
	name = "advis_plugin",
	srcs = ["plugin.py"],
	srcs_version = "PY2AND3",
	deps = [
		"@org_pocoo_werkzeug",
		"@org_pythonhosted_six",
		"@org_tensorflow_tensorboard//tensorboard/backend:http_util",
		"@org_tensorflow_tensorboard//tensorboard/backend/event_processing:event_accumulator",
		"@org_tensorflow_tensorboard//tensorboard/plugins:base_plugin"
	]
)

py_binary(
	name = "demo",
	srcs = ["demo.py", "argutil.py"],
	srcs_version = "PY2AND3",
	deps = [
		":summary",
		"//models"
	]
)

py_library(
	name = "summary",
	srcs = ["summary.py"],
	srcs_version = "PY2AND3"
)

tf_web_library(
	name = "dashboard",
	srcs = [
		"html/test-card.html",
		"html/dashboard.html"
	],
	path = "/advis-plugin",
	deps = [
		"@org_polymer_iron_icon",
		"@org_polymer_paper_icon_button",
		"@org_polymer_paper_input",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_card_heading",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_categorization_utils",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_color_scale",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_dashboard_common",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:lodash",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_paginated_view",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_runs_selector",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_tensorboard:registry"
	]
)
