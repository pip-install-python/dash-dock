% Auto-generated: do not edit by hand
\name{panelWrapper}

\alias{panelWrapper}

\title{PanelWrapper component}

\description{
PanelWrapper is a container component that wraps content to be displayed within a DashDock panel.  This component serves as a way to associate Dash content with a specific panel ID in the DashDock layout.
}

\usage{
panelWrapper(children=NULL, id=NULL, active=NULL, className=NULL,
n_clicks=NULL, style=NULL, title=NULL)
}

\arguments{
\item{children}{A list of or a singular dash component, string or number. The children of this component.
These will be rendered inside the panel.}

\item{id}{Character. The ID used to identify this component in Dash callbacks.
This ID must match the panel ID in the DashDock layout.}

\item{active}{Logical. Whether this panel should be active when first added.
Only one panel should be active in a default layout.}

\item{className}{Character. Additional CSS class name for styling.}

\item{n_clicks}{Numeric. Number of times the panel has been clicked.}

\item{style}{Named list. Custom styles for the container div.}

\item{title}{Character. The title of the panel.
This will be displayed in the panel's tab.}
}

\value{named list of JSON elements corresponding to React.js properties and their values}

