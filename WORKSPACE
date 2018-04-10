workspace(name = "io_github_jtagscherer_advis")

################################################################################
# CLOSURE RULES - Build rules and libraries for JavaScript development
#
# NOTE: SHA should match what's in TensorBoard's WORKSPACE file.
# NOTE: All the projects dependeded upon in this file use highly
#       available redundant URLs. They are strongly recommended because
#       they hedge against GitHub outages and allow Bazel's downloader
#       to guarantee high performance and 99.9% reliability. That means
#       practically zero build flakes on CI systems, without needing to
#       configure an HTTP_PROXY.

http_archive(
	name = "io_bazel_rules_closure",
	sha256 = "6691c58a2cd30a86776dd9bb34898b041e37136f2dc7e24cadaeaf599c95c657",
	strip_prefix = "rules_closure-08039ba8ca59f64248bb3b6ae016460fe9c9914f",
	urls = [
		"https://mirror.bazel.build/github.com/bazelbuild/rules_closure/archive/08039ba8ca59f64248bb3b6ae016460fe9c9914f.tar.gz",
		"https://github.com/bazelbuild/rules_closure/archive/08039ba8ca59f64248bb3b6ae016460fe9c9914f.tar.gz" # 2018-01-16
	]
)

load("@io_bazel_rules_closure//closure:defs.bzl", "closure_repositories")

# Inherit external repositories defined by Closure Rules.
closure_repositories()

################################################################################
# GO RULES - Build rules and libraries for Go development
#
# NOTE: TensorBoard does not require Go rules; they are a transitive
#       dependency of rules_webtesting.
# NOTE: SHA should match what's in TensorBoard's WORKSPACE file.

http_archive(
	name = "io_bazel_rules_go",
	sha256 = "8c333df68fb0096221e2127eda2807384e00cc211ee7e7ea4ed08d212e6a69c1",
	strip_prefix = "rules_go-0.5.4",
	urls = [
		"http://mirror.bazel.build/github.com/bazelbuild/rules_go/archive/0.5.4.tar.gz",
		"https://github.com/bazelbuild/rules_go/archive/0.5.4.tar.gz"
	]
)

load("@io_bazel_rules_go//go:def.bzl", "go_repositories")

# Inherit external repositories defined by Go Rules.
go_repositories()

# Needed as a transitive dependency of rules_webtesting below.
http_archive(
	name = "bazel_skylib",
	sha256 = "bbccf674aa441c266df9894182d80de104cabd19be98be002f6d478aaa31574d",
	strip_prefix = "bazel-skylib-2169ae1c374aab4a09aa90e65efe1a3aad4e279b",
	urls = [
		"https://mirror.bazel.build/github.com/bazelbuild/bazel-skylib/archive/2169ae1c374aab4a09aa90e65efe1a3aad4e279b.tar.gz",
		"https://github.com/bazelbuild/bazel-skylib/archive/2169ae1c374aab4a09aa90e65efe1a3aad4e279b.tar.gz" # 2018-01-12
	]
)

################################################################################
# WEBTESTING RULES - Build rules and libraries for web testing
#
# NOTE: SHA should match what's in TensorBoard's WORKSPACE file.
# NOTE: Some external repositories are omitted because they were already
#       defined by closure_repositories().

http_archive(
	name = "io_bazel_rules_webtesting",
	sha256 = "a1264301424f2d920fca04f2d3c5ef5ca1be4f2bbf8c84ef38006e54aaf22753",
	strip_prefix = "rules_webtesting-9f597bb7d1b40a63dc443d9ef7e931cfad4fb098",
	urls = [
		"https://mirror.bazel.build/github.com/bazelbuild/rules_webtesting/archive/9f597bb7d1b40a63dc443d9ef7e931cfad4fb098.tar.gz",
		"https://github.com/bazelbuild/rules_webtesting/archive/9f597bb7d1b40a63dc443d9ef7e931cfad4fb098.tar.gz"
	]
)

load("@io_bazel_rules_webtesting//web:repositories.bzl", "browser_repositories", "web_test_repositories")

web_test_repositories(
	omit_com_google_code_findbugs_jsr305 = True,
	omit_com_google_code_gson = True,
	omit_com_google_errorprone_error_prone_annotations = True,
	omit_com_google_guava = True,
	omit_junit = True,
	omit_org_hamcrest_core = True
)

################################################################################
# SASS RULES - Build rules and libraries for Sass support
#

http_archive(
  name = "io_bazel_rules_sass",
  sha256 = "14536292b14b5d36d1d72ae68ee7384a51e304fa35a3c4e4db0f4590394f36ad",
	strip_prefix = "rules_sass-0.0.3",
	urls = [
		"https://github.com/bazelbuild/rules_sass/archive/0.0.3.tar.gz"
	]
)

load("@io_bazel_rules_sass//sass:sass.bzl", "sass_repositories")

sass_repositories()

################################################################################
# TENSORBOARD - Framework for visualizing machines learning
#
# NOTE: If the need should arise to patch TensorBoard's codebase, then
#       git clone it to local disk and use local_repository() instead of
#       http_archive(). This should be a temporary measure until a pull
#       request can be merged upstream. It is an anti-pattern to
#       check-in a WORKSPACE file that uses local_repository() since,
#       unlike http_archive(), it isn't automated. If upstreaming a
#       change takes too long, then consider checking in a change where
#       http_archive() points to the forked repository.

http_archive(
	name = "org_tensorflow_tensorboard",
	sha256 = "31145825d351f767328e205e56178e1a7388ffde177a3c9a72817fce6bfd256a",
	strip_prefix = "tensorboard-1.6",
	urls = [
		"https://github.com/jtagscherer/tensorboard/archive/1.6.tar.gz"
	]
)

load("@org_tensorflow_tensorboard//third_party:workspace.bzl", "tensorboard_workspace")

# Inherit external repositories defined by Closure Rules.
tensorboard_workspace()

################################################################################
# PIP DEPENDENCIES - Load Python dependencies from Pip.
#

git_repository(
	name = "io_bazel_rules_python",
	remote = "https://github.com/bazelbuild/rules_python.git",
	commit = "b25495c47eb7446729a2ed6b1643f573afa47d99"
)

load("@io_bazel_rules_python//python:pip.bzl", "pip_repositories")

pip_repositories()

load("@io_bazel_rules_python//python:pip.bzl", "pip_import")

pip_import(
	name = "python_dependencies",
	requirements = "//advis_plugin:requirements.txt"
)

load("@python_dependencies//:requirements.bzl", "pip_install")
pip_install()

################################################################################
# MODEL DATA - Download data for pretrained models used to demo the plugin
#

new_http_archive(
  name = "model_inception_v3",
	sha256 = "9430692d3002277fa1e1a94fb82331fe5da68b9afd725c2679c21a0319933228",
  url = "http://download.tensorflow.org/models/inception_v3_2016_08_28.tar.gz",
  build_file = "models/BUILD"
)
