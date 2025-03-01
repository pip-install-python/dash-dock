# AUTO GENERATED FILE - DO NOT EDIT

export panelwrapper

"""
    panelwrapper(;kwargs...)
    panelwrapper(children::Any;kwargs...)
    panelwrapper(children_maker::Function;kwargs...)


A PanelWrapper component.
PanelWrapper is a container component that wraps content to be displayed
within a DashDock panel.

This component serves as a way to associate Dash content with a specific
panel ID in the DashDock layout.
Keyword arguments:
- `children` (a list of or a singular dash component, string or number; optional): The children of this component.
These will be rendered inside the panel.
- `id` (String; required): The ID used to identify this component in Dash callbacks.
This ID must match the panel ID in the DashDock layout.
- `active` (Bool; optional): Whether this panel should be active when first added.
Only one panel should be active in a default layout.
- `className` (String; optional): Additional CSS class name for styling.
- `n_clicks` (Real; optional): Number of times the panel has been clicked.
- `style` (Dict; optional): Custom styles for the container div.
- `title` (String; optional): The title of the panel.
This will be displayed in the panel's tab.
"""
function panelwrapper(; kwargs...)
        available_props = Symbol[:children, :id, :active, :className, :n_clicks, :style, :title]
        wild_props = Symbol[]
        return Component("panelwrapper", "PanelWrapper", "dash_dock", available_props, wild_props; kwargs...)
end

panelwrapper(children::Any; kwargs...) = panelwrapper(;kwargs..., children = children)
panelwrapper(children_maker::Function; kwargs...) = panelwrapper(children_maker(); kwargs...)

