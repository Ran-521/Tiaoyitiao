/**
 * 跳一跳游戏 - 玩家控制
 * 管理玩家角色的状态、移动和绘制
 */

class Player {
    constructor(x, y) {
        // 位置和大小
        this.position = { x, y };
        this.width = 30;
        this.height = 30;
        
        // 物理属性
        this.velocity = { x: 0, y: 0 };
        this.gravity = 800;
        
        // 状态标志
        this.isJumping = false;
        this.targetY = 0; // 目标着陆高度
        
        // 外观
        this.color = '#4a69bd';
        
        console.log(`创建玩家: x=${x}, y=${y}, 宽度=${this.width}, 高度=${this.height}`);
    }
    
    // 更新位置和速度
    update(deltaTime) {
        try {
            // 只在跳跃时应用物理效果
            if (this.isJumping) {
                // 应用重力
                this.velocity.y += this.gravity * deltaTime;
                
                // 更新位置
                this.position.x += this.velocity.x * deltaTime;
                this.position.y += this.velocity.y * deltaTime;
                
                // 日志输出（每10帧输出一次，避免过多日志）
                if (Math.random() < 0.1) {
                    console.log(`玩家位置: x=${this.position.x.toFixed(2)}, y=${this.position.y.toFixed(2)}, 速度: x=${this.velocity.x.toFixed(2)}, y=${this.velocity.y.toFixed(2)}`);
                }
            }
        } catch (e) {
            console.error('更新玩家位置时发生错误:', e);
        }
    }
    
    // 绘制玩家
    draw(ctx) {
        if (!ctx) {
            console.error('玩家绘制失败: ctx未定义');
            return;
        }
        
        try {
            ctx.save();
            
            // 绘制阴影
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // 绘制玩家形状（圆形）
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
            
            // 重置阴影
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // 绘制面部特征（简单的眼睛）
            ctx.fillStyle = 'white';
            
            // 左眼
            ctx.beginPath();
            ctx.arc(this.position.x - 5, this.position.y - 5, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
            
            // 右眼
            ctx.beginPath();
            ctx.arc(this.position.x + 5, this.position.y - 5, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
            
            // 如果在跳跃中，绘制运动轨迹
            if (this.isJumping && this.velocity.y !== 0) {
                this.drawTrail(ctx);
            }
            
            ctx.restore();
        } catch (e) {
            console.error('绘制玩家时发生错误:', e);
        }
    }
    
    // 绘制运动轨迹
    drawTrail(ctx) {
        try {
            const trailLength = 5; // 轨迹点数量
            const vxNorm = this.velocity.x / 10;
            const vyNorm = this.velocity.y / 10;
            
            ctx.strokeStyle = 'rgba(74, 105, 189, 0.4)'; // 玩家颜色的半透明版本
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            
            for (let i = 1; i <= trailLength; i++) {
                const t = i / trailLength;
                const x = this.position.x - vxNorm * t * 10;
                const y = this.position.y - vyNorm * t * 10;
                ctx.lineTo(x, y);
            }
            
            ctx.stroke();
            ctx.closePath();
        } catch (e) {
            console.error('绘制轨迹时发生错误:', e);
        }
    }
    
    // 执行跳跃
    jump(distanceX, jumpHeight, targetY) {
        try {
            if (!this.isJumping) {
                this.isJumping = true;
                this.targetY = targetY - this.height / 2; // 目标平台高度减去玩家半径
                
                // 计算物理参数
                // 水平速度是固定的，基于目标距离和预计的空中时间
                const estimatedTime = 0.75; // 大约的跳跃时间（秒）
                this.velocity.x = distanceX / estimatedTime;
                
                // 垂直速度使用物理公式计算，使玩家能达到期望的高度
                this.velocity.y = jumpHeight * 2.5; // 简化的跳跃物理
                
                console.log(`玩家跳跃: 距离=${distanceX.toFixed(2)}, 高度=${jumpHeight.toFixed(2)}, 目标Y=${targetY.toFixed(2)}`);
                console.log(`初始速度: x=${this.velocity.x.toFixed(2)}, y=${this.velocity.y.toFixed(2)}`);
            }
        } catch (e) {
            console.error('执行跳跃时发生错误:', e);
        }
    }
    
    // 落地后重置状态
    land() {
        try {
            this.isJumping = false;
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.position.y = this.targetY;
            console.log(`玩家已落地: x=${this.position.x.toFixed(2)}, y=${this.position.y.toFixed(2)}`);
        } catch (e) {
            console.error('玩家落地时发生错误:', e);
        }
    }
} 