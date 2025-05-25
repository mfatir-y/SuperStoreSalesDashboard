function getChartDimensions() {
    const width = window.innerWidth;
    return {
        mapWidth: Math.min(width * 0.5, 700),
        mapHeight: Math.min(width * 0.3, 400),
        chartWidth: Math.min(width * 0.4, 380),
        chartHeight: Math.min(width * 0.5, 300),
        chartFontSize: Math.min(width * 0.025, 12),
    };
}

export function renderMap(data, onInsightCallback) {
    const stateToFIPS = {
      'Alabama': '01', 'Alaska': '02', 'Arizona': '04', 'Arkansas': '05',
      'California': '06', 'Colorado': '08', 'Connecticut': '09', 'Delaware': '10',
      'Florida': '12', 'Georgia': '13', 'Hawaii': '15', 'Idaho': '16',
      'Illinois': '17', 'Indiana': '18', 'Iowa': '19', 'Kansas': '20',
      'Kentucky': '21', 'Louisiana': '22', 'Maine': '23', 'Maryland': '24',
      'Massachusetts': '25', 'Michigan': '26', 'Minnesota': '27', 'Mississippi': '28',
      'Missouri': '29', 'Montana': '30', 'Nebraska': '31', 'Nevada': '32',
      'New Hampshire': '33', 'New Jersey': '34', 'New Mexico': '35', 'New York': '36',
      'North Carolina': '37', 'North Dakota': '38', 'Ohio': '39', 'Oklahoma': '40',
      'Oregon': '41', 'Pennsylvania': '42', 'Rhode Island': '44', 'South Carolina': '45',
      'South Dakota': '46', 'Tennessee': '47', 'Texas': '48', 'Utah': '49',
      'Vermont': '50', 'Virginia': '51', 'Washington': '53', 'West Virginia': '54',
      'Wisconsin': '55', 'Wyoming': '56'
    };

    // Group data by state for map visualization
    const stateData = {};
    data.forEach(d => {
        if (!stateData[d.state]) {
            stateData[d.state] = {
                state: d.state,
                region: d.region,
                sales: 0,
                profit: 0,
                count: 0
            };
        }
        stateData[d.state].sales += d.sales;
        stateData[d.state].profit += d.profit;
        stateData[d.state].count += 1;
    });

    // Convert to array and calculate profit ratios
    const mapData = Object.values(stateData).map(d => ({
        ...d,
        profitRatio: d.sales > 0 ? (d.profit / d.sales) * 100 : 0
    }));
    mapData.forEach(d => {
      d.id = stateToFIPS[d.state];
    });

    function updateMapSpec() {
        const dims = getChartDimensions();
        const mapSpec = {
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
                    "stroke": "#0ff",
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
        vegaEmbed('#map-chart', mapSpec, {actions: false}).then(result => {
            result.view.addEventListener('click', (event, item) => {
                if (item && item.datum) {
                    const insightData = {
                        state: item.datum.state,
                        region: item.datum.region,
                        sales: item.datum.sales,
                        profit: item.datum.profit,
                        profitRatio: item.datum.profitRatio
                    };
                    onInsightCallback('location', insightData);
                }
            });
        });
    }

    updateMapSpec();
    window.addEventListener('resize', updateMapSpec);
}

function aggregateByMonth(data, groupBy) {
    const grouped = {};

    data.forEach(d => {
        const monthKey = d.date.getFullYear() + '-' + String(d.date.getMonth() + 1).padStart(2, '0');
        const key = `${monthKey}_${d[groupBy]}`;

        if (!grouped[key]) {
            grouped[key] = {
                date: monthKey + '-01',
                [groupBy]: d[groupBy],
                sales: 0,
                profit: 0,
                count: 0,
            };
        }
        grouped[key].sales += d.sales;
        grouped[key].profit += d.profit;
        grouped[key].count += 1;
    });
    return Object.values(grouped).map(o => ({...o, date: new Date(o.date)}));
}

export function renderSegmentChart(data, onInsightCallback) {
    const monthlyData = aggregateByMonth(data, 'segment');

    function updateSegmentSpec() {
        const dims = getChartDimensions();
        const segmentSpec = {
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
                "height": dims.chartHeight / 3,  // Divide by 3 for each segment
                "mark": {"type": "line", "point": true},
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
                        "title": "Sales ($)",
                        "axis": {"format": "$,.0f"}
                    },
                    "color": {
                        "field": "segment",
                        "type": "nominal",
                        "scale": {
                            "domain": ["Consumer", "Corporate", "Home Office"],
                            "range": ["#4e79a7", "#f28e2c", "#e15759"]
                        },
                        "legend": null
                    },
                    "tooltip": [
                        {"field": "date", "type": "temporal", "title": "Date"},
                        {"field": "segment", "type": "nominal", "title": "Segment"},
                        {"field": "sales", "type": "quantitative", "title": "Sales", "format": "$,.0f"},
                        {"field": "profit", "type": "quantitative", "title": "Profit", "format": "$,.0f"}
                    ]
                }
            }
        };
        vegaEmbed('#segment-chart', segmentSpec, {actions: false}).then(result => {
            result.view.addEventListener('click', (event, item) => {
                if (item && item.datum) {
                    onInsightCallback('segment', item.datum);
                }
            });
        });
    }

    updateSegmentSpec();
    window.addEventListener('resize', updateSegmentSpec);
}

export function renderCategoryChart(data, onInsightCallback) {
    const monthlyData = aggregateByMonth(data, 'category');

    function updateCategorySpec() {
        const dims = getChartDimensions();
        const categorySpec = {
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
                "height": dims.chartHeight / 3,  // Divide by 3 for each category
                "mark": {"type": "line", "point": true},
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
                        "title": "Sales ($)",
                        "axis": {"format": "$,.0f"}
                    },
                    "color": {
                        "field": "category",
                        "type": "nominal",
                        "scale": {
                            "domain": ["Furniture", "Office Supplies", "Technology"],
                            "range": ["#76b900", "#ff9500", "#0084ff"]
                        },
                        "legend": null
                    },
                    "tooltip": [
                        {"field": "date", "type": "temporal", "title": "Date"},
                        {"field": "category", "type": "nominal", "title": "Category"},
                        {"field": "sales", "type": "quantitative", "title": "Sales", "format": "$,.0f"},
                        {"field": "profit", "type": "quantitative", "title": "Profit", "format": "$,.0f"}
                    ]
                }
            }
        };
        vegaEmbed('#category-chart', categorySpec, {actions: false}).then(result => {
            result.view.addEventListener('click', (event, item) => {
                if (item && item.datum) {
                    onInsightCallback('category', item.datum);
                }
            });
        });
    }

    updateCategorySpec();
    window.addEventListener('resize', updateCategorySpec);
} 