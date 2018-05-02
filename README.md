# Advis

Analyze how your deep learning model behaves when presented with randomly perturbed input data or targeted adversarial attacks.

## Building

1. Make sure your setup satisfies all requirements.
    1. You will need to [install a recent version of TensorFlow](https://www.tensorflow.org/install/), which comes with TensorBoard.
    Using Python 3 inside a virtual environment like [`venv`](https://docs.python.org/3/library/venv.html) is highly recommended.
    2. [Install Bazel](https://docs.bazel.build/versions/master/install.html) which will be used to build the plugin and integrate it into a custom version of TensorBoard.

2. Build TensorBoard and the plugin, link them against each other and launch the modified TensorBoard version with Advis installed. This might take a while when compiling for the first time.

    `bazel run //advis_tensorboard -- --logdir /tmp/advis_demo`
		
	Afterwards, the server will prepare all data needed to speed up interaction with the interface. You will be informed about the progress within your terminal. Please wait until TensorBoard outputs that the server has been started.

3. If everything went well, TensorBoard along with Advis should now be available at [`localhost:6006/#advis`](http://localhost:6006/#advis).

## Usage

**TODO**
