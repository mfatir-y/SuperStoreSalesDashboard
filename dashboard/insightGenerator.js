export function generateInsight(type, data) {
    let insightText = '';

    if (type === 'location') {
        const profitStatus = data.profitRatio > 0 ? 'profitable' : 'unprofitable';
        insightText = `Location Analysis: ${data.state} shows ${Math.abs(data.profitRatio).toFixed(1)}% profit ratio with $${data.sales.toLocaleString()} in sales. This location is currently ${profitStatus}, ${data.profitRatio > 10 ? 'performing exceptionally well' : data.profitRatio < -10 ? 'requiring immediate attention' : 'showing moderate performance'}.`;
    } else if (type === 'segment') {
        const monthName = data.date.toLocaleDateString('en', { month: 'long', year: 'numeric' });
        insightText = `Segment Trends: ${data.segment} segment generated $${data.sales.toLocaleString()} in ${monthName}. ${data.segment === 'Consumer' ? 'Consumer segment typically shows steady growth with seasonal peaks.' : data.segment === 'Corporate' ? 'Corporate segment demonstrates consistent bulk purchasing patterns.' : 'Home Office segment reflects remote work trends and smaller order volumes.'}`;
    } else if (type === 'category') {
        const monthName = data.date.toLocaleDateString('en', { month: 'long', year: 'numeric' });
        insightText = `Category Performance: ${data.category} category achieved $${data.sales.toLocaleString()} in sales during ${monthName}. ${data.category === 'Technology' ? 'Technology products typically have higher margins but seasonal demand patterns.' : data.category === 'Furniture' ? 'Furniture sales show longer purchase cycles with higher transaction values.' : 'Office Supplies demonstrate consistent demand with frequent reorders.'}`;
    }
    return insightText;
}

export function showInsight(type, data) {
    const insightText = generateInsight(type, data);
    document.getElementById('insight-text').textContent = insightText;
    document.getElementById('insight-panel').style.display = 'block';
}

export function hideInsight() {
    document.getElementById('insight-panel').style.display = 'none';
} 