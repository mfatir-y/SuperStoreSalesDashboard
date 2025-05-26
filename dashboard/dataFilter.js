export function filterData(data, filters) {
    return data.filter(d => {
        if (filters.dateRange !== 'all') {
            const year = d.date.getFullYear();
            if (filters.dateRange === 'last-3-years') {
                const maxYear = data.reduce((max, record) => {
                    const recordYear = record.date.getFullYear();
                    return recordYear > max ? recordYear : max;
                }, 0);
                if (year < maxYear - 2) return false;
            } else if (filters.dateRange !== year.toString()) {
                return false;
            }
        }
        if (filters.region !== 'all' && d.region !== filters.region) {
            return false;
        }
        return !(d.profitRatio < filters.profitRatioMin || d.profitRatio > filters.profitRatioMax);
    });
}

export function calculateKPIs(filteredData) {
    if (filteredData.length === 0) return null;

    const totalSales = filteredData.reduce((sum, d) => sum + d.sales, 0);
    const totalProfit = filteredData.reduce((sum, d) => sum + d.profit, 0);
    const avgDiscount = filteredData.reduce((sum, d) => sum + d.discount, 0) / filteredData.length;
    const profitRatio = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
    const uniqueOrders = new Set(filteredData.map(d => d.date.toDateString())).size;
    const uniqueCustomers = Math.max(1, Math.floor(filteredData.length / 3));

    return {
        totalSales,
        totalProfit,
        avgDiscount,
        profitRatio,
        uniqueOrders,
        uniqueCustomers
    };
}

export function updateKPIDisplay(kpis) {
    if (!kpis) return;

    document.getElementById('kpi-sales').textContent = '$' + kpis.totalSales.toLocaleString(undefined, {maximumFractionDigits: 0});
    document.getElementById('kpi-profit').textContent = '$' + kpis.totalProfit.toLocaleString(undefined, {maximumFractionDigits: 0});
    document.getElementById('kpi-profit-ratio').textContent = kpis.profitRatio.toFixed(1) + '%';
    document.getElementById('kpi-profit-order').textContent = '$' + (kpis.totalProfit / Math.max(1, kpis.uniqueOrders)).toFixed(2);
    document.getElementById('kpi-profit-customer').textContent = '$' + (kpis.totalProfit / kpis.uniqueCustomers).toFixed(2);
    document.getElementById('kpi-discount').textContent = (kpis.avgDiscount * 100).toFixed(1) + '%';
} 