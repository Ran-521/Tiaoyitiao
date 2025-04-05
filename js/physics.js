/**
 * 跳一跳游戏 - 物理系统
 * 负责处理游戏中的物理计算
 */

// 计算抛物线路径
function calculateParabolicPath(start, end, height, steps) {
    try {
        const path = [];
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = start.x + (end.x - start.x) * t;
            
            // 使用二次贝塞尔曲线计算y值，模拟重力效果
            const y = start.y * (1 - t) * (1 - t) +
                      (start.y + height) * 2 * (1 - t) * t +
                      end.y * t * t;
            
            path.push({ x, y });
        }
        
        return path;
    } catch (e) {
        console.error('计算抛物线路径时发生错误:', e);
        // 返回一个简单的直线路径作为后备
        return [
            { x: start.x, y: start.y },
            { x: end.x, y: end.y }
        ];
    }
}

// 计算两点间距离
function distance(x1, y1, x2, y2) {
    try {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    } catch (e) {
        console.error('计算距离时发生错误:', e);
        return 0;
    }
}

// 判断两个矩形是否相交
function rectanglesIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    try {
        return !(
            x1 + w1 < x2 ||
            x2 + w2 < x1 ||
            y1 + h1 < y2 ||
            y2 + h2 < y1
        );
    } catch (e) {
        console.error('检测矩形相交时发生错误:', e);
        return false;
    }
}

// 判断点是否在矩形内
function pointInRectangle(px, py, rx, ry, rw, rh) {
    try {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    } catch (e) {
        console.error('检测点是否在矩形内时发生错误:', e);
        return false;
    }
}

// 生成指定范围内的随机数
function randomRange(min, max) {
    try {
        return min + Math.random() * (max - min);
    } catch (e) {
        console.error('生成随机数时发生错误:', e);
        return min;
    }
}

// 角度转弧度
function degToRad(degrees) {
    try {
        return degrees * Math.PI / 180;
    } catch (e) {
        console.error('角度转弧度时发生错误:', e);
        return 0;
    }
}

// 弧度转角度
function radToDeg(radians) {
    try {
        return radians * 180 / Math.PI;
    } catch (e) {
        console.error('弧度转角度时发生错误:', e);
        return 0;
    }
}

// 线性插值
function lerp(start, end, t) {
    try {
        return start + (end - start) * t;
    } catch (e) {
        console.error('线性插值计算时发生错误:', e);
        return start;
    }
}

// 简化的反弹效果
function bounce(value, min, max, elasticity = 0.7) {
    try {
        if (value < min) {
            return min + (min - value) * elasticity;
        }
        if (value > max) {
            return max - (value - max) * elasticity;
        }
        return value;
    } catch (e) {
        console.error('计算反弹效果时发生错误:', e);
        return value;
    }
} 