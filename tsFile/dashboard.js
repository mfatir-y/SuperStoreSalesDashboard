"use strict";
/// <reference lib="es2017" />
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
var vega_embed_1 = require("vega-embed");
// TypeScript-style class for dashboard functionality
var SuperstoreDashboard = /** @class */ (function () {
    function SuperstoreDashboard() {
        this.data = [];
        this.filters = {
            dateRange: 'last-3-years',
            market: 'all',
            profitRatioMin: -169,
            profitRatioMax: 44
        };
        this.selectedContext = null;
        this.initializeEventListeners();
        this.loadData();
    }
    SuperstoreDashboard.prototype.loadData = function () {
        var _this = this;
        fetch('data/sample_superstore.csv')
            .then(function (res) { return res.text(); })
            .then(function (text) {
            var _a = text.trim().split('\n'), headerLine = _a[0], lines = _a.slice(1);
            var headers = headerLine.split(',');
            var raw = lines.map(function (line) {
                var cols = line.split(',');
                var obj = {};
                headers.forEach(function (h, i) { return obj[h] = cols[i]; });
                return obj;
            });
            _this.data = raw.map(function (d) { return ({
                date: new Date(d['Order Date']),
                segment: d.Segment,
                category: d.Category,
                region: d.Region,
                state: d.State,
                sales: +d.Sales,
                profit: +d.Profit,
                profitRatio: +d['Profit Ratio'],
                discount: +d.Discount,
                latitude: +d.Latitude,
                longitude: +d.Longitude
            }); });
            _this.renderDashboard();
        })
            .catch(function (error) { return console.error('Error loading CSV data:', error); });
    };
    SuperstoreDashboard.prototype.initializeEventListeners = function () {
        var _this = this;
        var dateFilter = document.getElementById('date-filter');
        dateFilter.addEventListener('change', function (e) {
            _this.filters.dateRange = e.target.value;
            _this.updateDashboard();
        });
        var marketFilter = document.getElementById('market-filter');
        marketFilter.addEventListener('change', function (e) {
            _this.filters.market = e.target.value;
            _this.updateDashboard();
        });
        var profitMinInput = document.getElementById('profit-ratio-min');
        profitMinInput.addEventListener('input', function (e) {
            var val = parseInt(e.target.value, 10);
            _this.filters.profitRatioMin = val;
            document.getElementById('profit-min-val').textContent = val + '%';
            _this.updateDashboard();
        });
        var profitMaxInput = document.getElementById('profit-ratio-max');
        profitMaxInput.addEventListener('input', function (e) {
            var val = parseInt(e.target.value, 10);
            _this.filters.profitRatioMax = val;
            document.getElementById('profit-max-val').textContent = val + '%';
            _this.updateDashboard();
        });
    };
    SuperstoreDashboard.prototype.filterData = function (data) {
        var _this = this;
        return data.filter(function (d) {
            if (_this.filters.dateRange !== 'all') {
                var year = d.date.getFullYear();
                if (_this.filters.dateRange === 'last-3-years') {
                    if (year < new Date().getFullYear() - 3)
                        return false;
                }
                else if (_this.filters.dateRange !== year.toString()) {
                    return false;
                }
            }
            if (_this.filters.market !== 'all' && d.region !== _this.filters.market) {
                return false;
            }
            return !(d.profitRatio < _this.filters.profitRatioMin || d.profitRatio > _this.filters.profitRatioMax);
        });
    };
    SuperstoreDashboard.prototype.updateKPIs = function (filteredData) {
        var totalSales = filteredData.reduce(function (sum, d) { return sum + d.sales; }, 0);
        var totalProfit = filteredData.reduce(function (sum, d) { return sum + d.profit; }, 0);
        var avgDiscount = filteredData.reduce(function (sum, d) { return sum + d.discount; }, 0) / filteredData.length;
        var profitRatio = (totalProfit / totalSales) * 100;
        var uniqueOrders = new Set(filteredData.map(function (d) { return d.date.toDateString(); })).size;
        var uniqueCustomers = Math.floor(filteredData.length / 3); // Approximate
        document.getElementById('kpi-sales').textContent = '$' + totalSales.toLocaleString(undefined, { maximumFractionDigits: 0 });
        document.getElementById('kpi-profit').textContent = '$' + totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 });
        document.getElementById('kpi-profit-ratio').textContent = profitRatio.toFixed(0) + '%';
        document.getElementById('kpi-profit-order').textContent = '$' + (totalProfit / uniqueOrders).toFixed(2);
        document.getElementById('kpi-profit-customer').textContent = '$' + (totalProfit / uniqueCustomers).toFixed(2);
        document.getElementById('kpi-discount').textContent = (avgDiscount * 100).toFixed(0) + '%';
    };
    SuperstoreDashboard.prototype.renderMap = function (data) {
        var _this = this;
        var mapSpec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "width": 600,
            "height": 350,
            "projection": { "type": "naturalEarth1" },
            "layer": [
                {
                    "data": {
                        "url": "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
                        "format": { "type": "topojson", "feature": "countries" }
                    },
                    "mark": {
                        "type": "geoshape",
                        "fill": "#e8e8e8",
                        "stroke": "#ffffff",
                        "strokeWidth": 0.5
                    }
                },
                {
                    "data": { "values": data },
                    "mark": {
                        "type": "circle",
                        "opacity": 0.8,
                        "stroke": "#fff",
                        "strokeWidth": 1
                    },
                    "encoding": {
                        "longitude": { "field": "longitude", "type": "quantitative" },
                        "latitude": { "field": "latitude", "type": "quantitative" },
                        "size": {
                            "field": "sales",
                            "type": "quantitative",
                            "scale": { "range": [50, 1000] },
                            "legend": null
                        },
                        "color": {
                            "field": "profitRatio",
                            "type": "quantitative",
                            "scale": {
                                "domain": [-50, 0, 50],
                                "range": ["#ff6b6b", "#ffffff", "#45b7d1"]
                            },
                            "legend": null
                        },
                        "tooltip": [
                            { "field": "state", "type": "nominal", "title": "State" },
                            { "field": "sales", "type": "quantitative", "title": "Sales", "format": "$,.0f" },
                            { "field": "profit", "type": "quantitative", "title": "Profit", "format": "$,.0f" },
                            { "field": "profitRatio", "type": "quantitative", "title": "Profit Ratio", "format": ".1f" }
                        ]
                    }
                }
            ]
        };
        (0, vega_embed_1.default)('#map-chart', mapSpec, { actions: false }).then(function (result) {
            result.view.addEventListener('click', function (event, item) {
                if (item && item.datum) {
                    _this.selectedContext = {
                        type: 'location',
                        data: item.datum
                    };
                    _this.showInsight();
                }
            });
        });
    };
    SuperstoreDashboard.prototype.renderSegmentChart = function (data) {
        var _this = this;
        var monthlyData = this.aggregateByMonth(data, 'segment');
        var segmentSpec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "width": 400,
            "height": 200,
            "data": { "values": monthlyData },
            "mark": { "type": "area", "opacity": 0.8 },
            "encoding": {
                "x": {
                    "field": "date",
                    "type": "temporal",
                    "title": "Date",
                    "axis": { "format": "%m/%Y" }
                },
                "y": {
                    "field": "sales",
                    "type": "quantitative",
                    "title": "Sales",
                    "axis": { "format": "$,.0f" }
                },
                "color": {
                    "field": "segment",
                    "type": "nominal",
                    "scale": {
                        "domain": ["Consumer", "Corporate", "Home Office"],
                        "range": ["#4e79a7", "#f28e2c", "#e15759"]
                    },
                    "legend": { "title": "Segment" }
                },
                "tooltip": [
                    { "field": "date", "type": "temporal", "title": "Date" },
                    { "field": "segment", "type": "nominal", "title": "Segment" },
                    { "field": "sales", "type": "quantitative", "title": "Sales", "format": "$,.0f" }
                ]
            }
        };
        (0, vega_embed_1.default)('#segment-chart', segmentSpec, { actions: false }).then(function (result) {
            result.view.addEventListener('click', function (event, item) {
                if (item && item.datum) {
                    _this.selectedContext = {
                        type: 'segment',
                        data: item.datum
                    };
                    _this.showInsight();
                }
            });
        });
    };
    SuperstoreDashboard.prototype.renderCategoryChart = function (data) {
        var _this = this;
        var monthlyData = this.aggregateByMonth(data, 'category');
        var categorySpec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "width": 400,
            "height": 200,
            "data": { "values": monthlyData },
            "mark": { "type": "area", "opacity": 0.8 },
            "encoding": {
                "x": {
                    "field": "date",
                    "type": "temporal",
                    "title": "Date",
                    "axis": { "format": "%m/%Y" }
                },
                "y": {
                    "field": "sales",
                    "type": "quantitative",
                    "title": "Sales",
                    "axis": { "format": "$,.0f" }
                },
                "color": {
                    "field": "category",
                    "type": "nominal",
                    "scale": {
                        "domain": ["Furniture", "Office Supplies", "Technology"],
                        "range": ["#76b900", "#ff9500", "#0084ff"]
                    },
                    "legend": { "title": "Category" }
                },
                "tooltip": [
                    { "field": "date", "type": "temporal", "title": "Date" },
                    { "field": "category", "type": "nominal", "title": "Category" },
                    { "field": "sales", "type": "quantitative", "title": "Sales", "format": "$,.0f" }
                ]
            }
        };
        (0, vega_embed_1.default)('#category-chart', categorySpec, { actions: false }).then(function (result) {
            result.view.addEventListener('click', function (event, item) {
                if (item && item.datum) {
                    _this.selectedContext = {
                        type: 'category',
                        data: item.datum
                    };
                    _this.showInsight();
                }
            });
        });
    };
    SuperstoreDashboard.prototype.aggregateByMonth = function (data, groupBy) {
        var grouped = {};
        data.forEach(function (d) {
            var _a;
            var monthKey = d.date.getFullYear() + '-' + String(d.date.getMonth() + 1).padStart(2, '0');
            var key = "".concat(monthKey, "_").concat(d[groupBy]);
            if (!grouped[key]) {
                grouped[key] = (_a = {
                        date: monthKey + '-01'
                    },
                    _a[groupBy] = d[groupBy],
                    _a.sales = 0,
                    _a.profit = 0,
                    _a.count = 0,
                    _a);
            }
            grouped[key].sales += d.sales;
            grouped[key].profit += d.profit;
            grouped[key].count += 1;
        });
        return Object.values(grouped).map(function (o) { return (__assign(__assign({}, o), { date: new Date(o.date) })); });
    };
    SuperstoreDashboard.prototype.showInsight = function () {
        if (!this.selectedContext)
            return;
        var _a = this.selectedContext, type = _a.type, data = _a.data;
        var insightText = '';
        if (type === 'location') {
            var profitStatus = data.profitRatio > 0 ? 'profitable' : 'unprofitable';
            insightText = "Location Analysis: ".concat(data.state, " shows ").concat(Math.abs(data.profitRatio).toFixed(1), "% profit ratio with $").concat(data.sales.toLocaleString(), " in sales. This location is currently ").concat(profitStatus, ", ").concat(data.profitRatio > 10 ? 'performing exceptionally well' : data.profitRatio < -10 ? 'requiring immediate attention' : 'showing moderate performance', ".");
        }
        else if (type === 'segment') {
            var monthName = data.date.toLocaleDateString('en', { month: 'long', year: 'numeric' });
            insightText = "Segment Trends: ".concat(data.segment, " segment generated $").concat(data.sales.toLocaleString(), " in ").concat(monthName, ". ").concat(data.segment === 'Consumer' ? 'Consumer segment typically shows steady growth with seasonal peaks.' : data.segment === 'Corporate' ? 'Corporate segment demonstrates consistent bulk purchasing patterns.' : 'Home Office segment reflects remote work trends and smaller order volumes.');
        }
        else if (type === 'category') {
            var monthName = data.date.toLocaleDateString('en', { month: 'long', year: 'numeric' });
            insightText = "Category Performance: ".concat(data.category, " category achieved $").concat(data.sales.toLocaleString(), " in sales during ").concat(monthName, ". ").concat(data.category === 'Technology' ? 'Technology products typically have higher margins but seasonal demand patterns.' : data.category === 'Furniture' ? 'Furniture sales show longer purchase cycles with higher transaction values.' : 'Office Supplies demonstrate consistent demand with frequent reorders.');
        }
        document.getElementById('insight-text').textContent = insightText;
        document.getElementById('insight-panel').style.display = 'block';
    };
    SuperstoreDashboard.prototype.renderDashboard = function () {
        var filteredData = this.filterData(this.data);
        this.updateKPIs(filteredData);
        this.renderMap(filteredData);
        this.renderSegmentChart(filteredData);
        this.renderCategoryChart(filteredData);
    };
    SuperstoreDashboard.prototype.updateDashboard = function () {
        this.renderDashboard();
        // Hide insight panel when filters change
        document.getElementById('insight-panel').style.display = 'none';
        this.selectedContext = null;
    };
    return SuperstoreDashboard;
}());
// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function () { new SuperstoreDashboard(); });
