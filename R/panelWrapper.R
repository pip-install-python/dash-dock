# AUTO GENERATED FILE - DO NOT EDIT

#' @export
panelWrapper <- function(children=NULL, id=NULL, active=NULL, className=NULL, n_clicks=NULL, style=NULL, title=NULL) {
    
    props <- list(children=children, id=id, active=active, className=className, n_clicks=n_clicks, style=style, title=title)
    if (length(props) > 0) {
        props <- props[!vapply(props, is.null, logical(1))]
    }
    component <- list(
        props = props,
        type = 'PanelWrapper',
        namespace = 'dash_dock',
        propNames = c('children', 'id', 'active', 'className', 'n_clicks', 'style', 'title'),
        package = 'dashDock'
        )

    structure(component, class = c('dash_component', 'list'))
}
