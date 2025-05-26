import os
import sys
from dash.testing.application_runners import import_app

# Ensure the current directory is in the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Explicitly import the app module
try:
    from usage import app
except ImportError as e:
    raise ImportError(f"Failed to import 'usage': {e}")

# Basic test for the component rendering.
def test_render_component(dash_duo):
    # Start the Dash app
    dash_duo.start_server(app)

    # Get the generated component input with selenium
    my_component = dash_duo.find_element('#input > input')

    assert 'my-value' == my_component.get_attribute('value')

    # Clear the input
    dash_duo.clear_input(my_component)

    # Send keys to the custom input
    my_component.send_keys('Hello dash')

    # Wait for the text to equal, if after the timeout (default 10 seconds)
    # the text is not equal it will fail the test.
    dash_duo.wait_for_text_to_equal('#output', 'You have entered Hello dash')