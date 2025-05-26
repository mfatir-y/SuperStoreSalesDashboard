export function createMapSpec(mapData, dims) {
    return {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "title": "US Profitability Data",
        "width": dims.mapWidth,
        "height": dims.mapHeight,
        "projection": {"type": "albersUsa"},
        "layer": [
            {
                "data": {
                    "url": "data/us-10m.json",
                    "format": {
                        "type": "topojson",
                        "feature": "states"
                    }
                },
                "transform": [
                    {
                        "lookup": "id",
                        "from": {
                            "data": { "values": mapData },
                            "key": "id",
                            "fields": ["state", "sales", "profit", "profitRatio", "region"]
                        }
                    }
                ],
                "mark": {
                    "type": "geoshape",
                    "stroke": "#000",
                    "strokeWidth": 0.5
                },
                "encoding": {
                    "color": {
                        "field": "profitRatio",
                        "type": "quantitative",
                        "scale": {
                            "domain": [-50, 0, 50],
                            "range": ["#ff6b6b", "#ffffff", "#45b7d1"]
                        },
                        "title": "Profit Ratio (%)"
                    },
                    "tooltip": [
                        { "field": "state", "type": "nominal", "title": "State" },
                        { "field": "region", "type": "nominal", "title": "Region" },
                        { "field": "sales", "type": "quantitative", "title": "Sales", "format": "$,.0f" },
                        { "field": "profit", "type": "quantitative", "title": "Profit", "format": "$,.0f" },
                        { "field": "profitRatio", "type": "quantitative", "title": "Profit Percentage", "format": ".1f" }
                    ]
                }
            }
        ]
    };
}

export function createSegmentSpec(monthlyData, dims) {
    return {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {"values": monthlyData},
        "facet": {
            "row": {
                "field": "segment",
                "type": "nominal",
                "title": null,
                "header": {"labelFontSize": dims.chartFontSize, "labelAngle": 0, "labelAlign": "left"}
            }
        },
        "spec": {
            "width": dims.chartWidth,
            "height": dims.chartHeight / 3,
            "layer": [
                {
                    "mark": {"type": "area", "point": false},
                    "encoding": {
                        "x": {
                            "field": "date",
                            "type": "temporal",
                            "title": "Date",
                            "axis": {"format": "%b %Y"}
                        },
                        "y": {
                            "field": "sales",
                            "type": "quantitative",
                            "title": "Amount ($)",
                            "axis": {"format": "$,.0f"}
                        },
                        "color": {
                            "datum": "Sales",
                            "scale": {
                                "domain": ["Sales", "Profit"],
                                "range": ["#0faeca", "#ffca24"]
                            }
                        }
                    }
                },
                {
                    "mark": {"type": "area", "point": false, "strokeDash": [4, 4]},
                    "encoding": {
                        "x": {"field": "date", "type": "temporal"},
                        "y": {
                            "field": "profit",
                            "type": "quantitative"
                        },
                        "color": {
                            "datum": "Profit"
                        }
                    }
                }
            ],
            "encoding": {
                "tooltip": [
                    {"field": "date", "type": "temporal", "title": "Date"},
                    {"field": "segment", "type": "nominal", "title": "Segment"},
                    {"field": "sales", "type": "quantitative", "title": "Sales", "format": "$,.0f"},
                    {"field": "profit", "type": "quantitative", "title": "Profit", "format": "$,.0f"}
                ]
            }
        }
    };
}

export function createCategorySpec(monthlyData, dims) {
    return {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {"values": monthlyData},
        "facet": {
            "row": {
                "field": "category",
                "type": "nominal",
                "title": null,
                "header": {"labelFontSize": dims.chartFontSize, "labelAngle": 0, "labelAlign": "left"}
            }
        },
        "spec": {
            "width": dims.chartWidth,
            "height": dims.chartHeight / 3,
            "layer": [
                {
                    "mark": {"type": "area", "point": true},
                    "encoding": {
                        "x": {
                            "field": "date",
                            "type": "temporal",
                            "title": "Date",
                            "axis": {"format": "%b %Y"}
                        },
                        "y": {
                            "field": "sales",
                            "type": "quantitative",
                            "title": "Amount ($)",
                            "axis": {"format": "$,.0f"}
                        },
                        "color": {
                            "datum": "Sales",
                            "scale": {
                                "domain": ["Sales", "Profit"],
                                "range": ["#0faeca", "#ffca24"]
                            }
                        }
                    }
                },
                {
                    "mark": {"type": "area", "point": false, "strokeDash": [4, 4]},
                    "encoding": {
                        "x": {"field": "date", "type": "temporal"},
                        "y": {
                            "field": "profit",
                            "type": "quantitative"
                        },
                        "color": {
                            "datum": "Profit"
                        }
                    }
                }
            ],
            "encoding": {
                "tooltip": [
                    {"field": "date", "type": "temporal", "title": "Date"},
                    {"field": "category", "type": "nominal", "title": "Category"},
                    {"field": "sales", "type": "quantitative", "title": "Sales", "format": "$,.0f"},
                    {"field": "profit", "type": "quantitative", "title": "Profit", "format": "$,.0f"}
                ]
            }
        }
    };
} 