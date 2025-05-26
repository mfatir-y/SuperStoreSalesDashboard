export function createLocationPrompt(data, context) {
    return `You are a business analyst, provide a concise insight about the following data:

Location: ${data.state}
Region: ${data.region}
Sales: $${data.sales.toLocaleString()}
Profit: $${data.profit.toLocaleString()}
Profit Ratio: ${data.profitRatio.toFixed(1)}%

Current Filters Applied By User:
${context.filters ? `- Date Range: ${context.filters.dateRange}
- Region Filter: ${context.filters.region}
- Profit Ratio Range: ${context.filters.profitRatioMin}% to ${context.filters.profitRatioMax}%` : 'No filters applied'}

Please analyze this location's performance, considering:
1. Overall profitability
2. Regional context
3. Risk factors
4. Improvement opportunities

Do not assume anything, just provide the facts.
Keep the response under 3 sentences, written in a paragraph format and focus on actionable insights.`;
}

export function createSegmentPrompt(data, context) {
    return `You are a business analyst, provide a concise insight about the following data:

Segment: ${data.segment}
Time Period: ${data.date.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
Sales: $${data.sales.toLocaleString()}
Profit: $${data.profit.toLocaleString()}

Current Filters Applied By User:
${context.filters ? `- Date Range: ${context.filters.dateRange}
- Region Filter: ${context.filters.region}
- Profit Ratio Range: ${context.filters.profitRatioMin}% to ${context.filters.profitRatioMax}%` : 'No filters applied'}

Please analyze this segment's performance, considering:
1. Historical performance trends
2. Comparison with other segments
3. Seasonal patterns if any
4. Growth opportunities

Do not assume anything, just provide the facts.
Keep the response under 3 sentences, written in a paragraph format and focus on actionable insights.`;
}

export function createCategoryPrompt(data, context) {
    return `You are a business analyst, provide a concise insight about the following data:

Category: ${data.category}
Time Period: ${data.date.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
Sales: $${data.sales.toLocaleString()}
Profit: $${data.profit.toLocaleString()}

Current Filters Applied By User:
${context.filters ? `- Date Range: ${context.filters.dateRange}
- Region Filter: ${context.filters.region}
- Profit Ratio Range: ${context.filters.profitRatioMin}% to ${context.filters.profitRatioMax}%` : 'No filters applied'}

Please analyze this category's performance, considering:
1. Market trends and demand patterns
2. Comparison with other categories
3. Seasonal influences
4. Optimization opportunities

Do not assume anything, just provide the facts.
Keep the response under 3 sentences, written in a paragraph format and focus on actionable insights.`;
} 