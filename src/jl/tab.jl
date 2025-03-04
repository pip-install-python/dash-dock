# AUTO GENERATED FILE - DO NOT EDIT

export tab

"""
    tab(;kwargs...)
    tab(children::Any;kwargs...)
    tab(children_maker::Function;kwargs...)


A Tab component.
This is a simple component that holds content to be rendered within a Tab.
Takes an ID that corresponds to a particular tab in the layout.
Keyword arguments:
- `children` (a list of or a singular dash component, string or number; optional): Children to render within Tab
- `id` (String; required): Unique ID to identify this component in Dash callbacks.
"""
function tab(; kwargs...)
        available_props = Symbol[:children, :id]
        wild_props = Symbol[]
        return Component("tab", "Tab", "dash_dock", available_props, wild_props; kwargs...)
end

tab(children::Any; kwargs...) = tab(;kwargs..., children = children)
tab(children_maker::Function; kwargs...) = tab(children_maker(); kwargs...)

