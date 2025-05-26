import os
import sys

# Ensure the parent directory is in the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from usage import app
except ImportError as e:
    raise ImportError(
        f"Failed to import 'usage': Ensure 'usage.py' is in the correct path. Error: {e}"
    )

# Test for the component rendering
def test_render_component(dash_duo):
    dash_duo.start_server(app)
    my_component = dash_duo.find_element('#input > input')
    assert 'my-value' == my_component.get_attribute('value')
    dash_duo.clear_input(my_component)
    my_component.send_keys('Hello dash')
    dash_duo.wait_for_text_to_equal('#output', 'You have entered Hello dash')