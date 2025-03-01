# AUTO GENERATED FILE - DO NOT EDIT

#' @export
dashDock <- function(children=NULL, id=NULL, apiKey=NULL, apiUrl=NULL, colorScheme=NULL, debugMode=NULL, font=NULL, freeTabLimit=NULL, headers=NULL, loading_state=NULL, model=NULL, popoutURL=NULL, realtimeResize=NULL, style=NULL, supportsPopout=NULL, useStateForModel=NULL) {
    
    props <- list(children=children, id=id, apiKey=apiKey, apiUrl=apiUrl, colorScheme=colorScheme, debugMode=debugMode, font=font, freeTabLimit=freeTabLimit, headers=headers, loading_state=loading_state, model=model, popoutURL=popoutURL, realtimeResize=realtimeResize, style=style, supportsPopout=supportsPopout, useStateForModel=useStateForModel)
    if (length(props) > 0) {
        props <- props[!vapply(props, is.null, logical(1))]
    }
    component <- list(
        props = props,
        type = 'DashDock',
        namespace = 'dash_dock',
        propNames = c('children', 'id', 'apiKey', 'apiUrl', 'colorScheme', 'debugMode', 'font', 'freeTabLimit', 'headers', 'loading_state', 'model', 'popoutURL', 'realtimeResize', 'style', 'supportsPopout', 'useStateForModel'),
        package = 'dashDock'
        )

    structure(component, class = c('dash_component', 'list'))
}
