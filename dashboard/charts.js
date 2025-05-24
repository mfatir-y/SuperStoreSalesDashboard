import { aggregateByMonth } from './dataLoader.js';

export function renderMap(data, onInsightCallback) {
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

    const mapSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": 550,
        "height": 350,
        "data": {"values": mapData},
        "mark": {"type": "bar", "tooltip": true},
        "encoding": {
            "x": {
                "field": "state",
                "type": "nominal",
                "title": "State",
                "axis": {"labelAngle": -45}
            },
            "y": {
                "field": "sales",
                "type": "quantitative",
                "title": "Sales ($)"
            },
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
                {"field": "state", "type": "nominal", "title": "State"},
                {"field": "region", "type": "nominal", "title": "Region"},
                {"field": "sales", "type": "quantitative", "title": "Sales", "format": "$,.0f"},
                {"field": "profit", "type": "quantitative", "title": "Profit", "format": "$,.0f"},
                {"field": "profitRatio", "type": "quantitative", "title": "Profit Ratio", "format": ".1f"}
            ]
        }
    };

    vegaEmbed('#map-chart', mapSpec, {actions: false}).then(result => {
        result.view.addEventListener('click', (event, item) => {
            if (item && item.datum) {
                onInsightCallback('location', item.datum);
            }
        });
    });
}

export function renderSegmentChart(data, onInsightCallback) {
    const monthlyData = aggregateByMonth(data, 'segment');

    const segmentSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": 380,
        "height": 200,
        "data": {"values": monthlyData},
        "mark": {"type": "area", "opacity": 0.8},
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
                "legend": {"title": "Segment"}
            },
            "tooltip": [
                {"field": "date", "type": "temporal", "title": "Date"},
                {"field": "segment", "type": "nominal", "title": "Segment"},
                {"field": "sales", "type": "quantitative", "title": "Sales", "format": "$,.0f"}
            ]
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

export function renderCategoryChart(data, onInsightCallback) {
    const monthlyData = aggregateByMonth(data, 'category');

    const categorySpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": 380,
        "height": 200,
        "data": {"values": monthlyData},
        "mark": {"type": "area", "opacity": 0.8},
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
                "legend": {"title": "Category"}
            },
            "tooltip": [
                {"field": "date", "type": "temporal", "title": "Date"},
                {"field": "category", "type": "nominal", "title": "Category"},
                {"field": "sales", "type": "quantitative", "title": "Sales", "format": "$,.0f"}
            ]
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