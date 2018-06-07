package(default_visibility = ["//visibility:public"])

load("@io_bazel_rules_sass//sass:sass.bzl", "sass_library")

sass_library(
	name = "color",
	srcs = ["_color.scss"]
)

sass_library(
	name = "style",
	srcs = ["_style.scss"],
	deps = [":color"]
)

sass_library(
	name = "text",
	srcs = ["_text.scss"],
	deps = [":color"]
)
