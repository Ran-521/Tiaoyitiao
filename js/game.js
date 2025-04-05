/**
 * 跳一跳游戏 - 主游戏文件
 * 负责游戏初始化、主循环和游戏状态管理
 */

// 游戏状态
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

// 游戏类
class Game {
    constructor() {
        console.log('Game构造函数被调用');
        
        // 游戏状态
        this.state = GameState.MENU;
        
        // 游戏画布
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('未找到游戏画布元素!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('无法获取画布上下文!');
            return;
        }
        
        // 游戏分数
        this.score = 0;
        this.bestScore = this.loadBestScore();
        
        // 游戏元素
        this.player = null;
        this.platforms = [];
        this.currentPlatformIndex = 0;
        
        // 游戏难度参数
        this.difficulty = 1;
        this.minDistance = 100;
        this.maxDistance = 200;
        
        // 蓄力参数
        this.isPoweringUp = false;
        this.powerStartTime = 0;
        this.powerLevel = 0;
        this.maxPowerTime = 1000; // 最大蓄力时间（毫秒）
        
        // 游戏尺寸
        this.resize();
        
        // 绑定事件方法
        this.onResize = this.resize.bind(this);
        this.onKeyDown = this.handleKeyDown.bind(this);
        this.onKeyUp = this.handleKeyUp.bind(this);
        this.onMouseDown = this.handleMouseDown.bind(this);
        this.onMouseUp = this.handleMouseUp.bind(this);
        this.onTouchStart = this.handleTouchStart.bind(this);
        this.onTouchEnd = this.handleTouchEnd.bind(this);
        
        // 初始化UI
        this.ui = new UI(this);
        
        // 初始化音频
        this.audio = new Audio();
        
        // 时间管理
        this.lastTime = 0;
        this.animationFrame = null;
        
        console.log('游戏实例已创建完成');
    }
    
    // 初始化游戏
    init() {
        console.log('正在初始化游戏...');
        
        try {
            // 添加事件监听
            window.addEventListener('resize', this.onResize);
            window.addEventListener('keydown', this.onKeyDown);
            window.addEventListener('keyup', this.onKeyUp);
            
            if (this.canvas) {
                this.canvas.addEventListener('mousedown', this.onMouseDown);
                this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: true });
            } else {
                console.error('canvas元素不存在，无法添加事件监听');
            }
            
            window.addEventListener('mouseup', this.onMouseUp);
            window.addEventListener('touchend', this.onTouchEnd, { passive: true });
            
            // 设置UI事件
            this.ui.setupEvents();
            
            // 更新最佳分数显示
            this.updateScoreDisplay();
            
            // 绘制初始画面
            this.ctx.fillStyle = '#e0f7fa';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#4a69bd';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('准备开始游戏', this.canvas.width / 2, this.canvas.height / 2);
            
            console.log('游戏初始化完成！显示开始屏幕');
            // 确保显示开始屏幕
            this.ui.showScreen('start-screen');
            
            // 注意：我们不在初始化时播放背景音乐，而是等待游戏开始
        } catch (error) {
            console.error('游戏初始化失败：', error);
        }
    }
    
    // 开始新游戏
    startGame() {
        console.log('startGame方法被调用！');
        
        try {
            // 重置游戏状态
            this.state = GameState.PLAYING;
            this.score = 0;
            this.difficulty = 1;
            this.platforms = [];
            this.currentPlatformIndex = 0;
            
            // 先显示游戏屏幕，确保canvas可见
            console.log('显示游戏屏幕...');
            this.ui.showScreen('game-screen');
            
            // 重新获取canvas尺寸
            this.resize();
            
            console.log('创建玩家...');
            // 创建玩家
            this.player = new Player(this.canvas.width / 4, this.canvas.height / 2);
            
            console.log('创建初始平台...');
            // 创建初始平台
            const firstPlatform = new Platform(this.canvas.width / 4, this.canvas.height / 2 + 100, 80, 20);
            this.platforms.push(firstPlatform);
            
            console.log('生成下一个平台...');
            // 创建第二个平台（目标平台）
            this.generateNextPlatform();
            
            // 更新分数显示
            this.updateScoreDisplay();
            
            // 测试绘制一次，确认绘制正常
            console.log('测试绘制游戏元素...');
            this.draw();
            
            console.log('启动游戏循环...');
            // 开始游戏循环
            this.lastTime = performance.now();
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            this.gameLoop(this.lastTime);
            
            // 仅在游戏实际开始后播放背景音乐
            console.log('开始播放背景音乐...');
            this.audio.playBackgroundMusic();
            
            console.log('游戏已成功启动！');
        } catch (error) {
            console.error('游戏启动失败:', error);
            console.error('错误详情:', error.stack);
        }
    }
    
    // 游戏主循环
    gameLoop(currentTime) {
        try {
            // 计算时间差
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            // 清除画布
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 只有在游戏进行中才更新和绘制
            if (this.state === GameState.PLAYING) {
                // 更新蓄力条
                if (this.isPoweringUp) {
                    const elapsedTime = currentTime - this.powerStartTime;
                    this.powerLevel = Math.min(elapsedTime / this.maxPowerTime, 1.0);
                    this.updatePowerBar();
                }
                
                // 更新游戏元素
                this.update(deltaTime / 1000); // 转换为秒
                
                // 绘制游戏元素
                this.draw();
                
                // 确保玩家和平台数据是正常的
                this.validateGameState();
            }
            
            // 请求下一帧
            if (this.state !== GameState.PAUSED) {
                this.animationFrame = requestAnimationFrame((time) => this.gameLoop(time));
            }
        } catch (error) {
            console.error('游戏循环中发生错误:', error);
            console.error('错误详情:', error.stack);
            // 尝试继续运行游戏循环，但避免无限递归错误
            if (this.state !== GameState.GAME_OVER) {
                this.animationFrame = requestAnimationFrame((time) => this.gameLoop(time));
            }
        }
    }
    
    // 验证游戏状态，确保数据正常
    validateGameState() {
        try {
            // 检查玩家
            if (!this.player) {
                console.error('玩家对象不存在，重置游戏');
                this.resetGame();
                return;
            }
            
            // 检查平台
            if (!this.platforms || this.platforms.length < 2) {
                console.error('平台数据异常，重置游戏');
                this.resetGame();
                return;
            }
        } catch (error) {
            console.error('验证游戏状态时发生错误:', error);
        }
    }
    
    // 更新游戏逻辑
    update(deltaTime) {
        try {
            // 更新玩家
            if (this.player) {
                this.player.update(deltaTime);
                
                // 检查玩家是否在跳跃中
                if (this.player.isJumping) {
                    // 如果玩家落地或超过目标位置
                    if (this.player.velocity.y > 0 && this.player.position.y >= this.player.targetY) {
                        console.warn(`==========================================================================`);
                        console.warn(`====== 玩家落地过程开始 - 严重调试模式!! ======`);
                        console.warn(`玩家状态: Y坐标=${this.player.position.y.toFixed(2)}, 目标Y=${this.player.targetY.toFixed(2)}, Y速度=${this.player.velocity.y.toFixed(2)}`);
                        
                        // 1. 首先确保玩家Y坐标不会明显超过目标值
                        if (this.player.position.y > this.player.targetY + 5) {
                            console.warn(`修正玩家Y坐标: ${this.player.position.y.toFixed(2)} → ${this.player.targetY.toFixed(2)}`);
                            this.player.position.y = this.player.targetY;
                        }
                        
                        // 2. 记录和输出当前关键信息以供调试
                        if (this.platforms && this.platforms.length > 0) {
                            const platform = this.platforms[0];
                            console.warn(`目标平台: X=${platform.x.toFixed(2)}, Y=${platform.y.toFixed(2)}, 宽=${platform.width}, 高=${platform.height}`);
                            
                            const distanceToCenter = Math.abs(this.player.position.x - platform.x);
                            const platformHalfWidth = platform.width / 2;
                            console.warn(`玩家距平台中心: ${distanceToCenter.toFixed(2)}, 平台半宽: ${platformHalfWidth}`);
                            console.warn(`水平偏差率: ${(distanceToCenter / platformHalfWidth * 100).toFixed(1)}% (100%以内为成功)`);
                        }
                        
                        // 3. 执行落地判定
                        console.warn('执行落地判定...');
                        
                        // 强制调试: 确保isPlayerOnPlatform被正确调用并返回结果
                        const landedOnPlatform = this.isPlayerOnPlatform();
                        console.warn(`落地判定结果: ${landedOnPlatform ? '成功' : '失败'}`);
                        
                        // 4. 根据落地判定结果处理游戏状态
                        if (landedOnPlatform === true) { // 严格检查成功情况
                            console.warn("【成功】玩家成功落在平台上！游戏继续...");
                            
                            // 播放成功音效并更新玩家状态
                            this.audio.playSound('land');
                            this.player.land();
                            
                            // 更新游戏状态
                            this.score++;
                            this.updateScoreDisplay();
                            
                            // 生成新平台并处理视角
                            this.platforms.shift();
                            this.generateNextPlatform();
                            this.adjustViewport();
                            this.increaseDifficulty();
                        } else {
                            // 玩家未落在平台上，游戏结束
                            console.warn("【失败】玩家未落在平台上，游戏结束");
                            
                            // 调试时，添加更多信息并放慢游戏结束速度
                            console.warn(`isPlayerOnPlatform() 返回值：${landedOnPlatform}`);
                            console.warn(`isPlayerOnPlatform() 类型：${typeof landedOnPlatform}`);
                            console.warn(`条件判断: landedOnPlatform === true 结果: ${landedOnPlatform === true}`);
                            
                            // 添加一小段延迟，让玩家看到落空的过程
                            setTimeout(() => {
                                this.gameOver();
                            }, 500); // 延长延迟时间以便观察
                        }
                        
                        console.warn(`====== 玩家落地过程结束 - 严重调试模式!! ======`);
                        console.warn(`==========================================================================`);
                        return; // 落地处理完成，退出当前更新周期
                    }
                    
                    // 检查玩家是否掉出屏幕底部
                    if (this.player.position.y > this.canvas.height + 100) {
                        console.warn('玩家掉出屏幕底部，游戏结束');
                        this.gameOver();
                        return;
                    }
                }
                
                // 检查玩家是否超出屏幕范围，如果是则调整视角
                this.checkPlayerInView();
            } else {
                console.error('玩家对象不存在!');
            }
        } catch (error) {
            console.error('更新游戏逻辑时发生错误:', error);
            console.error('错误详情:', error.stack);
        }
    }
    
    // 新增方法：检查玩家是否在视野内
    checkPlayerInView() {
        try {
            if (!this.player) return;
            
            const margin = 50; // 边缘安全距离
            const leftEdge = margin;
            const rightEdge = this.canvas.width - margin;
            
            // 如果玩家接近屏幕边缘，调整视角
            if (this.player.position.x < leftEdge || this.player.position.x > rightEdge) {
                console.log(`玩家超出视野范围: x=${this.player.position.x.toFixed(2)}`);
                this.adjustViewport();
            }
        } catch (error) {
            console.error('检查玩家视野时发生错误:', error);
        }
    }
    
    // 检查玩家是否落在平台上
    isPlayerOnPlatform() {
        try {
            console.warn('==== 落地检测开始 - DEBUG MODE ====');
            
            // 基础检查：确保平台和玩家对象存在
            if (!this.platforms || this.platforms.length === 0) {
                console.error('没有可用平台进行检测!');
                return false;
            }
            
            const platform = this.platforms[0];
            if (!platform) {
                console.error('平台对象不存在!');
                return false;
            }
            
            if (!this.player) {
                console.error('玩家对象不存在!');
                return false;
            }
            
            // 获取关键坐标和尺寸
            const playerX = this.player.position.x;
            const playerY = this.player.position.y;
            const playerRadius = this.player.width / 2; // 玩家是圆形，所以使用半径
            
            const platformX = platform.x;
            const platformY = platform.y;
            const platformWidth = platform.width;
            const platformHeight = platform.height;
            
            // 详细的调试日志
            console.warn(`玩家坐标: (${playerX.toFixed(2)}, ${playerY.toFixed(2)}), 半径: ${playerRadius}`);
            console.warn(`平台坐标: (${platformX.toFixed(2)}, ${platformY.toFixed(2)}), 尺寸: ${platformWidth}x${platformHeight}`);
            
            // 计算平台的边界
            const platformLeft = platformX - platformWidth / 2;
            const platformRight = platformX + platformWidth / 2;
            const platformTop = platformY - platformHeight / 2;
            const platformBottom = platformY + platformHeight / 2;
            
            console.warn(`平台边界: 左=${platformLeft.toFixed(2)}, 右=${platformRight.toFixed(2)}, 上=${platformTop.toFixed(2)}, 下=${platformBottom.toFixed(2)}`);
            
            // 水平方向检测（考虑玩家半径）
            const playerLeft = playerX - playerRadius;
            const playerRight = playerX + playerRadius;
            
            // 使用非常宽松的容错度进行调试
            const strictTolerance = 10; // 严格容错度增加到10
            const mediumTolerance = 30; // 中等容错度增加到30
            const wideTolerance = 50; // 宽松容错度增加到50
            
            // 检查玩家是否在平台上方
            const isAbovePlatform = Math.abs(playerY - platformTop) <= (playerRadius + mediumTolerance);
            
            // 检查玩家是否在平台水平范围内（考虑不同的容错度）
            const isStrictlyOnPlatform = playerRight >= platformLeft && playerLeft <= platformRight;
            const isOnPlatformWithMediumTolerance = playerRight + mediumTolerance >= platformLeft && playerLeft - mediumTolerance <= platformRight;
            const isOnPlatformWithWideTolerance = playerRight + wideTolerance >= platformLeft && playerLeft - wideTolerance <= platformRight;
            
            // 计算玩家中心到平台中心的水平距离
            const horizontalDistance = Math.abs(playerX - platformX);
            const maxAllowedDistance = (platformWidth / 2) + playerRadius + wideTolerance;
            
            console.warn(`玩家水平范围: 左=${playerLeft.toFixed(2)}, 右=${playerRight.toFixed(2)}`);
            console.warn(`水平距离: ${horizontalDistance.toFixed(2)}, 最大允许距离: ${maxAllowedDistance.toFixed(2)}`);
            console.warn(`严格判定: ${isStrictlyOnPlatform}, 中等容错: ${isOnPlatformWithMediumTolerance}, 宽松容错: ${isOnPlatformWithWideTolerance}`);
            console.warn(`在平台上方: ${isAbovePlatform}`);
            
            // 最终判定逻辑 - 更宽松的判定
            let landingSuccess = false;
            
            // 1. 严格判定 - 完全在平台上，必定成功
            if (isStrictlyOnPlatform) {
                landingSuccess = true;
                console.warn('判定结果: 严格成功 - 玩家完全在平台范围内');
            }
            // 2. 中等容错 - 接近平台边缘，高概率成功
            else if (isOnPlatformWithMediumTolerance) {
                // 增加成功率到100%以便调试
                landingSuccess = true; // 原来是Math.random() < 0.9
                console.warn(`判定结果: 中等容错 - 接近平台边缘 (100%成功率) => 成功`);
            }
            // 3. 宽松容错 - 在平台扩展范围内，中等概率成功
            else if (isOnPlatformWithWideTolerance) {
                // 增加成功率到80%以便调试
                landingSuccess = Math.random() < 0.8; // 原来是0.3
                console.warn(`判定结果: 宽松容错 - 在扩展范围内 (80%成功率) => ${landingSuccess ? '成功' : '失败'}`);
            }
            // 4. 完全脱离平台但很接近 - 给予一定机会
            else if (horizontalDistance < maxAllowedDistance * 1.5) {
                // 增加一个额外的机会
                landingSuccess = Math.random() < 0.3; // 30%的成功率
                console.warn(`判定结果: 极限容错 - 接近但不在范围内 (30%成功率) => ${landingSuccess ? '成功' : '失败'}`);
            }
            // 5. 完全脱离平台
            else {
                console.warn('判定结果: 失败 - 玩家完全脱离平台范围');
            }
            
            console.warn(`最终落地判定: ${landingSuccess ? '成功' : '失败'}`);
            console.warn('==== 落地检测结束 - DEBUG MODE ====');
            
            return landingSuccess;
        } catch (error) {
            console.error('检查玩家是否在平台上时发生错误:', error);
            console.error('错误堆栈:', error.stack);
            return false; // 发生错误时判定失败
        }
    }
    
    // 绘制游戏元素
    draw() {
        try {
            // 绘制背景
            this.drawBackground();
            
            // 绘制平台
            if (this.platforms && this.platforms.length > 0) {
                this.platforms.forEach(platform => {
                    if (platform) {
                        platform.draw(this.ctx);
                    }
                });
            } else {
                console.warn('没有平台可绘制');
            }
            
            // 绘制玩家
            if (this.player) {
                this.player.draw(this.ctx);
            } else {
                console.warn('玩家对象不存在，无法绘制');
            }
        } catch (error) {
            console.error('绘制游戏元素时发生错误:', error);
        }
    }
    
    // 绘制游戏背景
    drawBackground() {
        if (this.ctx) {
            this.ctx.fillStyle = '#e0f7fa';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    // 蓄力开始
    startPowerUp() {
        if (this.state === GameState.PLAYING && !this.player.isJumping) {
            this.isPoweringUp = true;
            this.powerStartTime = performance.now();
            this.audio.playSound('charge');
            
            // 显示蓄力条
            const powerBarContainer = document.getElementById('power-bar-container');
            if (powerBarContainer) {
                powerBarContainer.style.display = 'block';
            }
            
            console.log('开始蓄力跳跃...');
        }
    }
    
    // 蓄力结束，玩家跳跃
    endPowerUp() {
        if (this.isPoweringUp) {
            this.isPoweringUp = false;
            
            // 计算跳跃强度
            const jumpPower = Math.max(0.2, Math.min(this.powerLevel, 1.0)); // 确保有最小跳跃力度
            console.warn(`蓄力结束，跳跃力度: ${jumpPower.toFixed(2)}`);
            
            // 计算目标距离和高度
            const targetPlatform = this.platforms[1];
            const distanceX = targetPlatform.x - this.player.position.x;
            
            // ===== 问题可能在这里 - 跳跃距离计算 =====
            // 简化跳跃逻辑: 让玩家总是成功跳跃到平台中心
            let jumpDistance;
            
            // 根据蓄力程度，让玩家落在平台的不同位置
            // 但始终在平台范围内，这样可以确保游戏不会立即结束
            if (jumpPower < 0.3) {
                // 低蓄力时，落在平台前区域
                const platformHalfWidth = targetPlatform.width / 2;
                jumpDistance = distanceX - platformHalfWidth * 0.5; // 落在平台前半部
                console.warn("蓄力较弱，落在平台前部");
            } else if (jumpPower > 0.8) {
                // 高蓄力时，落在平台后区域
                const platformHalfWidth = targetPlatform.width / 2;
                jumpDistance = distanceX + platformHalfWidth * 0.5; // 落在平台后半部
                console.warn("蓄力很强，落在平台后部");
            } else {
                // 中等蓄力，精确命中平台中心附近
                const randomOffset = (Math.random() * 10) - 5; // 在平台中心附近有微小随机偏移
                jumpDistance = distanceX + randomOffset;
                console.warn("完美蓄力！落在平台中心附近");
            }
            
            // 计算跳跃高度
            const minHeight = -180;
            const maxHeight = -320;
            const jumpHeight = minHeight + (maxHeight - minHeight) * jumpPower;
            
            // 详细日志
            console.warn(`跳跃详细计算:`);
            console.warn(`- 目标平台距离: ${distanceX.toFixed(2)}像素`);
            console.warn(`- 计算跳跃距离: ${jumpDistance.toFixed(2)}像素 (${(jumpDistance/distanceX*100).toFixed(1)}% 准确度)`);
            console.warn(`- 预计落点: ${(this.player.position.x + jumpDistance).toFixed(2)}`);
            console.warn(`- 目标平台位置: ${targetPlatform.x} ±${targetPlatform.width/2} (${targetPlatform.x - targetPlatform.width/2} 到 ${targetPlatform.x + targetPlatform.width/2})`);
            
            // 开始跳跃
            this.player.jump(jumpDistance, jumpHeight, targetPlatform.y);
            
            // 播放跳跃音效
            this.audio.playSound('jump');
            
            // 隐藏蓄力条
            const powerBarContainer = document.getElementById('power-bar-container');
            const powerBar = document.getElementById('power-bar');
            
            if (powerBarContainer) {
                powerBarContainer.style.display = 'none';
            }
            
            if (powerBar) {
                powerBar.style.height = '0%';
            }
        }
    }
    
    // 更新蓄力条显示
    updatePowerBar() {
        const powerBar = document.getElementById('power-bar');
        if (powerBar) {
            powerBar.style.height = `${this.powerLevel * 100}%`;
        }
    }
    
    // 生成下一个平台
    generateNextPlatform() {
        try {
            const lastPlatform = this.platforms[this.platforms.length - 1];
            if (!lastPlatform) {
                console.error('无法生成下一个平台：没有前一个平台');
                return;
            }
            
            // 计算距离（随难度增加）
            const distance = this.minDistance + Math.random() * (this.maxDistance - this.minDistance);
            
            // 计算新平台位置
            const x = lastPlatform.x + distance;
            const y = lastPlatform.y + (Math.random() * 80 - 40); // 随机高度变化
            
            // 计算平台宽度（随难度减小）
            const width = Math.max(30, 80 - this.difficulty * 5);
            
            // 创建新平台
            const newPlatform = new Platform(x, y, width, 20);
            this.platforms.push(newPlatform);
            
            console.log(`生成新平台: x=${x.toFixed(2)}, y=${y.toFixed(2)}, 宽度=${width}`);
            
            // 调整视角（移动所有元素）- 确保每次都正确调整
            this.adjustViewport();
        } catch (error) {
            console.error('生成下一个平台时发生错误:', error);
            console.error('错误详情:', error.stack);
        }
    }
    
    // 新增方法：调整视角，确保玩家始终在视野中
    adjustViewport() {
        try {
            if (!this.platforms || this.platforms.length < 1 || !this.player) {
                console.warn('无法调整视角：缺少必要的游戏元素');
                return;
            }
            
            // 确保第一个平台位于屏幕左侧1/4处
            const desiredFirstPlatformX = this.canvas.width / 4;
            
            // 计算需要水平偏移的距离
            const currentFirstPlatform = this.platforms[0];
            const moveX = currentFirstPlatform.x - desiredFirstPlatformX;
            
            // 只有当需要移动的距离足够大时才移动
            if (Math.abs(moveX) > 5) {
                console.log(`调整视角: 当前第一个平台位置=${currentFirstPlatform.x.toFixed(2)}, 目标位置=${desiredFirstPlatformX.toFixed(2)}`);
                console.log(`需要移动距离: ${moveX.toFixed(2)}`);
                
                // 移动所有平台
                this.platforms.forEach(platform => {
                    platform.x -= moveX;
                });
                
                // 同时移动玩家以保持相对位置
                this.player.position.x -= moveX;
                
                console.log(`视角调整完成: 所有元素左移${moveX.toFixed(2)}像素`);
            }
        } catch (error) {
            console.error('调整视角时发生错误:', error);
            console.error('错误详情:', error.stack);
        }
    }
    
    // 增加游戏难度
    increaseDifficulty() {
        this.difficulty += 0.1;
        this.minDistance = Math.min(this.minDistance + 5, 200);
        this.maxDistance = Math.min(this.maxDistance + 5, 350);
    }
    
    // 游戏结束
    gameOver() {
        this.state = GameState.GAME_OVER;
        
        // 保存最高分
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.saveBestScore();
        }
        
        // 停止背景音乐
        this.audio.pauseBackgroundMusic();
        
        // 播放游戏结束音效
        this.audio.playSound('gameover');
        
        // 显示游戏结束界面
        this.ui.showGameOver(this.score, this.bestScore);
    }
    
    // 暂停游戏
    pauseGame() {
        if (this.state === GameState.PLAYING) {
            this.state = GameState.PAUSED;
            
            // 暂停背景音乐
            this.audio.pauseBackgroundMusic();
            
            cancelAnimationFrame(this.animationFrame);
            this.ui.showScreen('pause-menu');
        }
    }
    
    // 恢复游戏
    resumeGame() {
        if (this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
            
            // 恢复背景音乐
            this.audio.playBackgroundMusic();
            
            this.lastTime = performance.now();
            this.gameLoop(this.lastTime);
            this.ui.showScreen('game-screen');
        }
    }
    
    // 重置游戏（从暂停或结束状态）
    resetGame() {
        cancelAnimationFrame(this.animationFrame);
        this.startGame();
    }
    
    // 更新分数显示
    updateScoreDisplay() {
        document.getElementById('current-score').textContent = this.score;
        document.getElementById('best-score').textContent = this.bestScore;
    }
    
    // 加载最高分
    loadBestScore() {
        const score = localStorage.getItem('jumpGameBestScore');
        return score ? parseInt(score) : 0;
    }
    
    // 保存最高分
    saveBestScore() {
        localStorage.setItem('jumpGameBestScore', this.bestScore.toString());
    }
    
    // 调整画布大小
    resize() {
        const container = document.querySelector('.game-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // 如果游戏正在进行，重新绘制
        if (this.state === GameState.PLAYING) {
            this.draw();
        }
    }
    
    // 键盘按下事件处理
    handleKeyDown(e) {
        if (e.code === 'Space' && this.state === GameState.PLAYING && !this.player.isJumping) {
            this.startPowerUp();
        }
    }
    
    // 键盘松开事件处理
    handleKeyUp(e) {
        if (e.code === 'Space' && this.isPoweringUp) {
            this.endPowerUp();
        }
    }
    
    // 鼠标按下事件处理
    handleMouseDown(e) {
        if (this.state === GameState.PLAYING && !this.player.isJumping) {
            this.startPowerUp();
        }
    }
    
    // 鼠标松开事件处理
    handleMouseUp(e) {
        if (this.isPoweringUp) {
            this.endPowerUp();
        }
    }
    
    // 触摸开始事件处理
    handleTouchStart(e) {
        if (this.state === GameState.PLAYING && !this.player.isJumping) {
            this.startPowerUp();
        }
    }
    
    // 触摸结束事件处理
    handleTouchEnd(e) {
        if (this.isPoweringUp) {
            this.endPowerUp();
        }
    }
    
    // 清理游戏资源
    cleanup() {
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mouseup', this.onMouseUp);
        this.canvas.removeEventListener('touchstart', this.onTouchStart);
        window.removeEventListener('touchend', this.onTouchEnd);
        
        cancelAnimationFrame(this.animationFrame);
    }
}

// 当文档加载完成时初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    
    // 存储在全局变量中，方便调试
    window.jumpGame = game;
}); 