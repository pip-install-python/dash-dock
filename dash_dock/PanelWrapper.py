# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class PanelWrapper(Component):
    """A PanelWrapper component.
PanelWrapper is a container component that wraps content to be displayed
within a DashDock panel.

This component serves as a way to associate Dash content with a specific
panel ID in the DashDock layout.

Keyword arguments:

- children (a list of or a singular dash component, string or number; optional):
    The children of this component. These will be rendered inside the
    panel.

- id (string; required):
    The ID used to identify this component in Dash callbacks. This ID
    must match the panel ID in the DashDock layout.

- active (boolean; default False):
    Whether this panel should be active when first added. Only one
    panel should be active in a default layout.

- className (string; default ''):
    Additional CSS class name for styling.

- n_clicks (number; default 0):
    Number of times the panel has been clicked.

- style (dict; optional):
    Custom styles for the container div.

- title (string; default ''):
    The title of the panel. This will be displayed in the panel's tab."""
    _children_props = []
    _base_nodes = ['children']
    _namespace = 'dash_dock'
    _type = 'PanelWrapper'
    @_explicitize_args
    def __init__(self, children=None, id=Component.REQUIRED, className=Component.UNDEFINED, style=Component.UNDEFINED, title=Component.UNDEFINED, active=Component.UNDEFINED, n_clicks=Component.UNDEFINED, **kwargs):
        self._prop_names = ['children', 'id', 'active', 'className', 'n_clicks', 'style', 'title']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['children', 'id', 'active', 'className', 'n_clicks', 'style', 'title']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in ['id']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')

        super(PanelWrapper, self).__init__(children=children, **args)
