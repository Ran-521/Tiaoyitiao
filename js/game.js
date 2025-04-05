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
                    this.powerLevel = Math.min(elapsedTime / this.maxPowerTime, 1);
                    this.updatePowerBar();
                }
                
                // 更新游戏元素
                this.update(deltaTime / 1000); // 转换为秒
                
                // 绘制游戏元素
                this.draw();
            }
            
            // 请求下一帧
            if (this.state !== GameState.PAUSED) {
                this.animationFrame = requestAnimationFrame((time) => this.gameLoop(time));
            }
        } catch (error) {
            console.error('游戏循环中发生错误:', error);
            console.error('错误详情:', error.stack);
            // 尝试继续运行游戏循环
            this.animationFrame = requestAnimationFrame((time) => this.gameLoop(time));
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
                    // 如果玩家落地
                    if (this.player.velocity.y > 0 && this.player.position.y >= this.player.targetY) {
                        console.log(`玩家接近落地点: 当前Y=${this.player.position.y.toFixed(2)}, 目标Y=${this.player.targetY.toFixed(2)}`);
                        
                        // 玩家落在平台上
                        if (this.isPlayerOnPlatform()) {
                            console.log("玩家成功落在平台上！");
                            
                            this.player.land();
                            this.score++;
                            this.audio.playSound('land');
                            
                            // 移除旧平台并生成新平台
                            this.platforms.shift();
                            this.generateNextPlatform();
                            
                            // 增加难度
                            this.increaseDifficulty();
                            
                            // 更新分数显示
                            this.updateScoreDisplay();
                        } else {
                            // 玩家未落在平台上，游戏结束
                            console.log("玩家未落在平台上，游戏结束");
                            this.gameOver();
                        }
                    }
                }
            } else {
                console.error('玩家对象不存在!');
            }
        } catch (error) {
            console.error('更新游戏逻辑时发生错误:', error);
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
            console.log(`蓄力结束，跳跃力度: ${jumpPower.toFixed(2)}`);
            
            // 计算目标距离和高度
            const targetPlatform = this.platforms[1];
            const distanceX = targetPlatform.x - this.player.position.x;
            
            // 根据跳跃力度计算距离，添加一些随机性
            const randomFactor = 0.95 + Math.random() * 0.1; // 0.95-1.05的随机因子
            const jumpDistance = distanceX * jumpPower * randomFactor;
            
            // 计算跳跃高度，力度越大，跳跃越高
            const jumpHeight = -300 * jumpPower; // 负值，因为y轴向下为正
            
            console.log(`跳跃目标计算: 目标距离=${distanceX.toFixed(2)}, 实际跳跃距离=${jumpDistance.toFixed(2)}, 跳跃高度=${jumpHeight.toFixed(2)}`);
            
            // 玩家跳跃
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
    
    // 检查玩家是否落在平台上
    isPlayerOnPlatform() {
        try {
            const platform = this.platforms[0];
            if (!platform) {
                console.error('平台对象不存在!');
                return false;
            }
            
            // 调试信息
            console.log(`检查落地位置: 玩家X=${this.player.position.x.toFixed(2)}, 平台X=${platform.x.toFixed(2)}, 平台宽度=${platform.width}`);
            console.log(`平台范围: ${(platform.x - platform.width / 2).toFixed(2)} 到 ${(platform.x + platform.width / 2).toFixed(2)}`);
            
            // 增加一点容错度，使游戏更友好
            const tolerance = 5; // 5像素的容错度
            const onPlatform = (
                this.player.position.x >= platform.x - platform.width / 2 - tolerance &&
                this.player.position.x <= platform.x + platform.width / 2 + tolerance
            );
            
            console.log(`落地判定结果: ${onPlatform ? '成功' : '失败'}`);
            return onPlatform;
        } catch (error) {
            console.error('检查玩家是否在平台上时发生错误:', error);
            return false;
        }
    }
    
    // 生成下一个平台
    generateNextPlatform() {
        const lastPlatform = this.platforms[this.platforms.length - 1];
        
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
        
        // 调整视角（移动所有元素）
        if (this.platforms.length > 2) {
            const moveX = this.platforms[0].x - this.canvas.width / 4;
            this.platforms.forEach(platform => {
                platform.x -= moveX;
            });
            this.player.position.x -= moveX;
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