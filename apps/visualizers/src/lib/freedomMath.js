/**
 * 24-Hour Freedom Clock Wedge Calculators
 */

export function calculateFreedomIndex(freedomHours) {
    return Number(((freedomHours / 24) * 100).toFixed(1));
}

/**
 * Coordinate conversions for custom SVG path charting
 */
export function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
}

/**
 * Generates an SVG path for a perfect donut segment wedge
 */
export function generateDonutWedge(x, y, innerRadius, outerRadius, startAngle, endAngle) {
    // If it's a full 360 circle, offset slightly to prevent SVG zero division
    const adjustedEnd = endAngle - startAngle >= 360 ? endAngle - 0.01 : endAngle;

    const startOuter = polarToCartesian(x, y, outerRadius, startAngle);
    const endOuter = polarToCartesian(x, y, outerRadius, adjustedEnd);
    const startInner = polarToCartesian(x, y, innerRadius, startAngle);
    const endInner = polarToCartesian(x, y, innerRadius, adjustedEnd);

    const largeArcFlag = adjustedEnd - startAngle <= 180 ? "0" : "1";

    return [
        `M ${startOuter.x} ${startOuter.y}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
        `L ${endInner.x} ${endInner.y}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`,
        "Z"
    ].join(" ");
}
