import dash
from dash import Input, Output, html, dcc, clientside_callback, _dash_renderer
import dash_dock
import dash_mantine_components as dmc
from dash_iconify import DashIconify

_dash_renderer._set_react_version("18.2.0")

styles = {
    "container": {
        "width": "100%",
        "height": "100vh",
        "display": "flex",
        "flexDirection": "column",
        "alignItems": "center",
        "justifyContent": "center",
        "padding": "20px",
    },
    "header": {
        "textAlign": "center",
        "marginBottom": "20px",
        "width": "100%",
        "maxWidth": "600px",
    },
    "apiInput": {
        "width": "100%",
        "maxWidth": "400px",
        "padding": "8px",
        "marginBottom": "10px",
        "border": "1px solid #ccc",
        "borderRadius": "4px",
    },
    "description": {
        "fontSize": "14px",
        "color": "#666",
        "marginBottom": "20px",
        "textAlign": "center",
    },
    "demoArea": {
        "display": "flex",
        "width": "100%",
        "height": "500px",  # Fixed height for demo area
        "backgroundColor": "white",
        "justifyContent": "center",
        "alignItems": "center",
        "position": "relative",
    },
    "planet": {
        "height": "120px",
        "width": "120px",
        "borderRadius": "50%",
        "backgroundColor": "#1976d2",
        "display": "flex",
        "justifyContent": "center",
        "alignItems": "center",
        "color": "white",
        "cursor": "pointer",
        "transition": "all 0.3s",
        "position": "relative",
    },
    "satellite": {
        "height": "40px",
        "width": "40px",
        # 'borderRadius': '50%',
        # 'backgroundColor': '#ff4081',
        "display": "flex",
        "justifyContent": "center",
        "alignItems": "center",
        "color": "white",
        "cursor": "pointer",
        "zIndex": 1,
    },
    "gridColumn": {
        "height": "300px",
        "width": "100%",
        "display": "flex",
        "justifyContent": "center",
        "alignItems": "center",
        "position": "relative",
        "padding": "20px",
        "boxSizing": "border-box",
    },
    "features": {
        "marginTop": "20px",
        "padding": "20px",
        "backgroundColor": "#f5f5f5",
        "borderRadius": "8px",
        # "maxWidth": "600px",
        "width": "100%",
        'color': 'black'
    },
    "featureList": {"listStyle": "none", "padding": "0", "margin": "0"},
    "featureItem": {
        "padding": "8px 0",
        "display": "flex",
        "alignItems": "center",
        "gap": "8px",
    },
}

app = dash.Dash(__name__, suppress_callback_exceptions=True, external_stylesheets=[dmc.styles.ALL, dmc.styles.CHARTS])

# Define the dock layout configuration
dock_config = {
    "global": {
        "tabEnableClose": False,
        "tabEnableFloat": True,
    },
    "borders": [
        {
            "type": "border",
            "location": "bottom",
            "size": 100,
            "children": [
                {
                    "type": "tab",
                    "name": "Console",
                    "component": "text",
                    "id": "console-tab"
                }
            ]
        },
        {
            "type": "border",
            "location": "left",
            "size": 250,
            "children": [
                {
                    "type": "tab",
                    "name": "Explorer",
                    "component": "text",
                    "id": "explorer-tab"
                }
            ]
        }
    ],
    "layout": {
        "type": "row",
        "weight": 100,
        "children": [
            {
                "type": "tabset",
                "weight": 60,
                "selected": 0,
                "children": [
                    {
                        "type": "tab",
                        "name": "Main View",
                        "component": "text",
                        "enableFloat": True,
                        "id": "main-view-tab",
                    }
                ]
            },
            {
                "type": "tabset",
                "weight": 40,
                "selected": 0,
                "children": [
                    {
                        "type": "tab",
                        "name": "Data Properties",
                        "component": "text",
                        "id": "data-properties-tab",
                    },
                    {
                        "type": "tab",
                        "name": "Chart Properties",
                        "component": "text",
                        "id": "chart-properties-tab",
                    }
                ]
            }
        ]
    }
}

# Sample data for charts
chart_data = [
    {"month": "January", "value": 10, "x": 1, "y": 10},
    {"month": "February", "value": 11, "x": 2, "y": 11},
    {"month": "March", "value": 9, "x": 3, "y": 9},
    {"month": "April", "value": 16, "x": 4, "y": 16},
    {"month": "May", "value": 14, "x": 5, "y": 14}
]

# Scatter chart data format is different, so we need to transform it
scatter_data = [
    {
        "color": "blue.6",
        "name": "Sample Data",
        "data": [{"x": d["x"], "y": d["y"]} for d in chart_data]
    }
]

# Create theme switch component
theme_switch = dmc.Switch(
    offLabel=DashIconify(icon="radix-icons:sun", width=15, style={"color": "#FFB300"}),
    onLabel=DashIconify(icon="radix-icons:moon", width=15, style={"color": "#FFD700"}),
    id="color-scheme-switch",
    size="md",
    persistence=True,
    color="gray"
)

# Create the tab content components
tab_components = [
    dash_dock.Tab(
        id="explorer-tab",
        children=[
            html.H4("Explorer"),
            dcc.Checklist(
                id="dataset-selector",
                options=[
                    {"label": "Dataset A", "value": "a"},
                    {"label": "Dataset B", "value": "b"},
                    {"label": "Dataset C", "value": "c"},
                ],
                value=["a"]
            )
        ]
    ),
    dash_dock.Tab(
        id="main-view-tab",
        children=[
            html.H3("Main Visualization"),
            dmc.Box(id="selected-datasets-display"),
            dmc.Box(id="main-chart-container"),  # Container for dynamic chart
        ]
    ),
    dash_dock.Tab(
        id="data-properties-tab",
        children=[
            html.H4("Data Properties"),
            html.Button("Refresh Data", id="refresh-data-btn"),
            dmc.Box(id="data-refresh-status")
        ]
    ),
    dash_dock.Tab(
        id="chart-properties-tab",
        children=[
            html.H4("Chart Properties"),
            dmc.RadioGroup(
                id="chart-type-selector",
                label="Select Chart Type",
                value="line",
                children=dmc.Stack([
                    dmc.Radio(label="Line Chart", value="line"),
                    dmc.Radio(label="Bar Chart", value="bar"),
                    dmc.Radio(label="Scatter Chart", value="scatter"),
                ])
            ),
            dmc.Box(id="selected-chart-type")
        ]
    ),
    dash_dock.Tab(
        id="console-tab",
        children=[
            html.H4("Console"),
            html.Pre(id="console-output", style={"height": "80px", "overflow": "auto"})
        ]
    ),
]

# Custom headers for tabs
custom_headers = {
    "main-view-tab": html.Div([
        DashIconify(icon="fluent-emoji:bar-chart", width=15),
        "Main View"
    ], style={"display": "flex", "alignItems": "center"}),

    "explorer-tab": html.Div([
        DashIconify(icon="flat-color-icons:folder", width=15),
        "Explorer"
    ], style={"display": "flex", "alignItems": "center"})
}

# Add custom CSS to handle the app layout
app.index_string = '''
<!DOCTYPE html>
<html>
    <head>
        {%metas%}
        <title>{%title%}</title>
        {%favicon%}
        {%css%}
        <style>
            body {
                margin: 0;
                padding: 0;
                overflow-x: hidden;
                height: 100vh;
            }

            /* Main app container */
            #app-container {
                position: relative;
                width: 100%;
                height: 100vh;
                overflow: hidden;
            }

            /* Header section - fixed height at top */
            #app-header {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 70px;
                z-index: 10;
                background-color: white;
            }

            /* API key section - fixed height below header */
            #api-key-section {
                position: absolute;
                top: 80px;
                left: 0;
                right: 0;
                height: 70px;
                z-index: 10;
                background-color: white;
            }

            /* DashDock container - fills remaining space */
            #dash-dock-container {
                position: absolute;
                top: 160px;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 5;
            }

            /* Force the dash-dock-container to fill its container */
            .dash-dock-container {
                height: 100% !important;
                width: 100% !important;
                overflow: hidden !important;
            }

            /* Dark mode styles */
            html[data-mantine-color-scheme="dark"] #app-header,
            html[data-mantine-color-scheme="dark"] #api-key-section {
                background-color: var(--mantine-color-dark-7, #2e2e2e);
            }
        </style>
    </head>
    <body>
        <div id="app-content">
            {%app_entry%}
        </div>
        <footer>
            {%config%}
            {%scripts%}
            {%renderer%}
        </footer>
    </body>
</html>
'''

# Main app layout with proper stacking via absolute positioning
app.layout = dmc.MantineProvider(
    html.Div(
        id="app-container",
        children=[
            # Header section - fixed at top
            html.Div(
                id="app-header",
                children=[
                    html.Link(
                        rel="stylesheet",
                        href="https://use.fontawesome.com/releases/v5.15.4/css/all.css"
                    ),
                    dmc.Paper(
                        children=[
                            dmc.Group([
                                dmc.Title("Dash Dock Example", order=3),
                                theme_switch
                            ], justify="apart", align="center")
                        ],
                        p="md",
                        shadow="xs",
                        radius="md",
                        withBorder=True,
                        style={"height": "100%"}
                    ),
                ]
            ),

            # API key section - fixed below header
            html.Div(
                id="api-key-section",
                children=[
                    dmc.Paper(
                        children=[
                            dmc.Group([
                                dmc.PasswordInput(
                                    placeholder="Enter API key for premium features",
                                    w='70%',
                                    id="api-key-input"
                                ),

                                dmc.HoverCard(
                                    withArrow=True,
                                    width=200,
                                    shadow="md",
                                    children=[
                                        dmc.HoverCardTarget(
                                            dmc.Button(
                                                "Buy an Api Key",
                                                variant="subtle",
                                                rightSection=DashIconify(icon="twemoji:shopping-cart"),
                                                color="blue",
                                            )
                                        ),
                                        dmc.HoverCardDropdown(
                                            style={"width": "400px"},
                                            children=html.Div(
                                                [
                                                    html.H2("Features", style={"marginBottom": "15px"}),
                                                    html.Ul(
                                                        [
                                                            html.Li(
                                                                [
                                                                    DashIconify(icon="mdi:check", style={"color": "#4CAF50"}),
                                                                    "Free Tier: Up to 3 Tabs",
                                                                ],
                                                                style=styles["featureItem"],
                                                            ),
                                                            html.Li(
                                                                [
                                                                    DashIconify(icon="mdi:check", style={"color": "#4CAF50"}),
                                                                    "Light / Dark Mode works with DMC",
                                                                ],
                                                                style=styles["featureItem"],
                                                            ),
                                                            html.Li(
                                                                [
                                                                    DashIconify(icon="mdi:check", style={"color": "#4CAF50"}),
                                                                    "Dynamic Windows and Tabs",
                                                                ],
                                                                style=styles["featureItem"],
                                                            ),
                                                            html.Li(
                                                                [
                                                                    DashIconify(
                                                                        icon="mdi:star",
                                                                        style={"color": "#FFC107"}
                                                                    ),
                                                                    "Premium: Unlimited Tabs",
                                                                ],
                                                                style=styles["featureItem"],
                                                            ),
                                                            html.Li(
                                                                [
                                                                    DashIconify(
                                                                        icon="fluent-emoji:sparkling-heart",
                                                                        style={"color": "#9C27B0"}
                                                                    ),
                                                                    "Supports independent Dash Components development",
                                                                ],
                                                                style=styles["featureItem"],
                                                            ),
                                                            dmc.Divider(),

                                                            html.Li(
                                                                [
                                                                    DashIconify(
                                                                        icon="cib:buy-me-a-coffee",
                                                                        style={"color": "#9C27B0", "marginTop": "10px"}
                                                                    ),
                                                                    dmc.Center(
                                                                        dmc.Anchor(
                                                                            href='https://pipinstallpython.pythonanywhere.com/catalogue/dash-planet_95/',
                                                                            children='Buy a DashDock API key',
                                                                            target='_blank',
                                                                            size='lg',
                                                                            c='blue'
                                                                        )
                                                                    ),
                                                                ],
                                                                style=styles["featureItem"],
                                                            )
                                                        ],
                                                    ),
                                                ],
                                                style=styles["featureList"],
                                            ),
                                        ),
                                    ]
                                ),
                            ], justify="left")
                        ],
                        p="md",
                        shadow="xs",
                        radius="md",
                        withBorder=True,
                        style={"height": "100%"}
                    ),
                ]
            ),

            # DashDock container - fills remaining space
            html.Div(id="dash-dock-container")
        ]
    )
)

# Clientside callback for theme toggle
clientside_callback(
    """
    (switchOn) => {
       document.documentElement.setAttribute('data-mantine-color-scheme', switchOn ? 'dark' : 'light');
       return window.dash_clientside.no_update
    }
    """,
    Output("color-scheme-switch", "id"),
    Input("color-scheme-switch", "checked"),
)


# Callback to update DashDock with API key
@app.callback(
    Output("dash-dock-container", "children"),
    Input("api-key-input", "value")
)
def update_dash_dock(api_key):
    # On initial load or when Apply is clicked
    return dash_dock.DashDock(
        id='dock-layout',
        model=dock_config,
        children=tab_components,
        useStateForModel=True,
        headers=custom_headers,
        apiKey=api_key if api_key else None,
        debugMode=True,
        supportsPopout=False
    )


# Callback for dataset selection
@app.callback(
    Output('selected-datasets-display', 'children'),
    [Input('dataset-selector', 'value')]
)
def update_selected_datasets(selected_datasets):
    if not selected_datasets:
        return "No datasets selected"

    return f"Selected datasets: {', '.join(selected_datasets)}"


# Callback for chart type selection
@app.callback(
    Output('selected-chart-type', 'children'),
    [Input('chart-type-selector', 'value')]
)
def update_chart_type(chart_type):
    return f"Selected chart type: {chart_type}"


# Callback for data refresh
@app.callback(
    Output('data-refresh-status', 'children'),
    Output('console-output', 'children'),
    [Input('refresh-data-btn', 'n_clicks')]
)
def refresh_data(n_clicks):
    if not n_clicks:
        return "Data not refreshed yet", "Console initialized. Waiting for events..."

    console_msg = f"Data refresh requested at click {n_clicks}"
    return f"Data refreshed {n_clicks} times", console_msg


# Callback to update the chart based on the selected chart type
@app.callback(
    Output('main-chart-container', 'children'),
    [Input('chart-type-selector', 'value')]
)
def update_chart(chart_type):
    if chart_type == "line":
        return dmc.LineChart(
            h=400,
            dataKey="month",
            data=chart_data,
            withLegend=True,
            xAxisLabel="Month",
            yAxisLabel="Value",
            series=[
                {"name": "value", "color": "blue.6", "label": "Sample Data"}
            ]
        )
    elif chart_type == "bar":
        return dmc.BarChart(
            h=400,
            dataKey="month",
            data=chart_data,
            withLegend=True,
            xAxisLabel="Month",
            yAxisLabel="Value",
            series=[
                {"name": "value", "color": "blue.6", "label": "Sample Data"}
            ]
        )
    elif chart_type == "scatter":
        return dmc.ScatterChart(
            h=400,
            data=scatter_data,
            dataKey={"x": "x", "y": "y"},
            xAxisLabel="X Value",
            yAxisLabel="Y Value",
            withLegend=True
        )
    else:
        return html.Div("Invalid chart type selected")


if __name__ == '__main__':
    # Use threaded=True for better performance
    app.run_server(debug=True, port=8640, threaded=True)