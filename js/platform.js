/**
 * 跳一跳游戏 - 平台管理
 * 控制平台的创建、外观和行为
 */

class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = this.generateRandomColor();
        
        // 为平台添加阴影效果
        this.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.shadowBlur = 10;
        this.shadowOffsetX = 4;
        this.shadowOffsetY = 4;
        
        console.log(`创建平台: x=${this.x}, y=${this.y}, width=${this.width}, height=${this.height}`);
    }
    
    // 绘制平台
    draw(ctx) {
        if (!ctx) {
            console.error('平台绘制失败: ctx未定义');
            return;
        }
        
        try {
            ctx.save();
            
            // 绘制平台阴影
            ctx.shadowColor = this.shadowColor;
            ctx.shadowBlur = this.shadowBlur;
            ctx.shadowOffsetX = this.shadowOffsetX;
            ctx.shadowOffsetY = this.shadowOffsetY;
            
            // 绘制平台主体
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
            ctx.fill();
            ctx.closePath();
            
            // 重置阴影
            ctx.shadowColor = 'transparent';
            
            // 绘制平台高亮
            ctx.fillStyle = this.lightenColor(this.color, 30);
            ctx.beginPath();
            ctx.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height / 4);
            ctx.fill();
            ctx.closePath();
            
            // 绘制中心目标点
            const centerSize = 6;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, centerSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
            
            ctx.restore();
        } catch (e) {
            console.error('平台绘制错误:', e);
        }
    }
    
    // 生成随机颜色
    generateRandomColor() {
        try {
            const colors = [
                '#4a69bd', // 蓝色
                '#6ab04c', // 绿色
                '#f0932b', // 橙色
                '#eb4d4b', // 红色
                '#be2edd'  // 紫色
            ];
            
            return colors[Math.floor(Math.random() * colors.length)];
        } catch (e) {
            console.error('生成随机颜色错误:', e);
            return '#4a69bd'; // 默认蓝色
        }
    }
    
    // 增亮颜色
    lightenColor(color, percent) {
        try {
            // 检查颜色格式是否为16进制
            const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(color);
            
            if (!isHex) {
                return color; // 如果格式不正确，返回原始颜色
            }
            
            // 去掉#号
            let hex = color.substring(1);
            
            // 如果是3位颜色，转为6位
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            
            // 解析RGB值
            let r = parseInt(hex.substring(0, 2), 16);
            let g = parseInt(hex.substring(2, 4), 16);
            let b = parseInt(hex.substring(4, 6), 16);
            
            // 增亮
            r = Math.min(255, r + Math.floor(percent / 100 * (255 - r)));
            g = Math.min(255, g + Math.floor(percent / 100 * (255 - g)));
            b = Math.min(255, b + Math.floor(percent / 100 * (255 - b)));
            
            // 转回十六进制
            const newR = r.toString(16).padStart(2, '0');
            const newG = g.toString(16).padStart(2, '0');
            const newB = b.toString(16).padStart(2, '0');
            
            return `#${newR}${newG}${newB}`;
        } catch (e) {
            console.error('颜色增亮错误:', e);
            return color; // 出错时返回原始颜色
        }
    }
} 