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
                
                // 检查是否已经达到或超过目标Y位置
                if (this.velocity.y > 0 && this.position.y >= this.targetY) {
                    console.log(`玩家到达目标位置: 当前Y=${this.position.y.toFixed(2)}, 目标Y=${this.targetY.toFixed(2)}`);
                    console.log(`当前X=${this.position.x.toFixed(2)}, 目标X=${(this.targetX || 0).toFixed(2)}`);
                }
                
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
                
                // 精确计算目标Y位置 (考虑到目标平台高度和玩家高度)
                this.targetY = targetY - this.height / 2; // 目标平台高度减去玩家半径
                
                // 记录目标位置，用于后续参考
                this.targetX = this.position.x + distanceX;
                
                // 计算物理参数 - 根据跳跃力度调整估计时间
                // 跳跃距离越小，所需时间应该越短
                // 这样可以让短距离跳跃感觉更快、更自然
                const jumpDistanceFactor = Math.abs(distanceX) / 200; // 标准化距离因子
                const estimatedTime = 0.4 + jumpDistanceFactor * 0.4; // 从0.4秒到0.8秒
                
                // 计算水平速度，确保能够准确地到达目标位置
                this.velocity.x = distanceX / estimatedTime;
                
                // 修复垂直速度计算，使用物理公式，确保正确到达目标高度
                // 使用抛物线公式: v₀ = (h + 0.5 * g * t²) / t
                const halfTime = estimatedTime / 2;
                this.velocity.y = (jumpHeight + 0.5 * this.gravity * halfTime * halfTime) / halfTime;
                
                console.log(`------ 改进后的跳跃物理计算 ------`);
                console.log(`跳跃距离: ${distanceX.toFixed(2)}像素, 跳跃高度: ${jumpHeight.toFixed(2)}像素`);
                console.log(`估计跳跃时间: ${estimatedTime.toFixed(2)}秒 (根据距离动态调整)`);
                console.log(`目标位置: X=${this.targetX.toFixed(2)}, Y=${this.targetY.toFixed(2)}`);
                console.log(`初始速度: X=${this.velocity.x.toFixed(2)}, Y=${this.velocity.y.toFixed(2)}`);
                console.log(`重力加速度: ${this.gravity}`);
                console.log(`------ 跳跃初始化完成 ------`);
                
                // 记录跳跃开始时间，用于调试
                this.jumpStartTime = Date.now();
            }
        } catch (e) {
            console.error('执行跳跃时发生错误:', e);
            console.error('错误详情:', e.stack);
        }
    }
    
    // 落地后重置状态
    land() {
        try {
            // 记录跳跃总时间，用于调试
            const jumpDuration = (Date.now() - (this.jumpStartTime || Date.now())) / 1000;
            
            console.log(`落地前状态: 跳跃=${this.isJumping}, 位置Y=${this.position.y.toFixed(2)}, 目标Y=${this.targetY.toFixed(2)}`);
            console.log(`跳跃总时间: ${jumpDuration.toFixed(2)}秒`);
            
            // 首先重置跳跃状态
            this.isJumping = false;
            
            // 重置速度
            this.velocity.x = 0;
            this.velocity.y = 0;
            
            // 确保玩家位置精确设置到目标Y位置
            this.position.y = this.targetY;
            
            console.log(`玩家已落地: x=${this.position.x.toFixed(2)}, y=${this.position.y.toFixed(2)}, 跳跃状态=${this.isJumping}`);
        } catch (e) {
            console.error('玩家落地时发生错误:', e);
            console.error('错误详情:', e.stack);
        }
    }
} 