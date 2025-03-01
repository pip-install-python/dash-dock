
module DashDock
using Dash

const resources_path = realpath(joinpath( @__DIR__, "..", "deps"))
const version = "0.0.1"

include("jl/dashdock.jl")
include("jl/tab.jl")

function __init__()
    DashBase.register_package(
        DashBase.ResourcePkg(
            "dash_dock",
            resources_path,
            version = version,
            [
                DashBase.Resource(
    relative_package_path = "dash_dock.min.js",
    external_url = nothing,
    dynamic = nothing,
    async = nothing,
    type = :js
),
DashBase.Resource(
    relative_package_path = "dash_dock.min.js.map",
    external_url = nothing,
    dynamic = true,
    async = nothing,
    type = :js
)
            ]
        )

    )
end
end
