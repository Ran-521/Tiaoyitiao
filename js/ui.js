/**
 * 跳一跳游戏 - UI控制
 * 管理游戏界面、菜单和交互元素
 */

class UI {
    constructor(game) {
        this.game = game;
        this.screens = {
            'start-screen': document.getElementById('start-screen'),
            'game-screen': document.getElementById('game-screen'),
            'game-over-screen': document.getElementById('game-over-screen'),
            'ranking-screen': document.getElementById('ranking-screen'),
            'settings-screen': document.getElementById('settings-screen'),
            'pause-menu': document.getElementById('pause-menu')
        };
        
        console.log('UI实例已创建，可用屏幕:', Object.keys(this.screens));
    }
    
    // 设置UI事件监听
    setupEvents() {
        console.log('正在设置UI事件监听...');
        
        try {
            // 开始界面按钮
            const startBtn = document.getElementById('start-btn');
            if (startBtn) {
                console.log('发现开始游戏按钮，绑定点击事件');
                startBtn.addEventListener('click', () => {
                    console.log('开始游戏按钮被点击');
                    this.game.startGame();
                });
            } else {
                console.error('未找到开始游戏按钮!');
            }
            
            const rankingBtn = document.getElementById('ranking-btn');
            if (rankingBtn) {
                rankingBtn.addEventListener('click', () => {
                    console.log('排行榜按钮被点击');
                    this.showRanking();
                    this.showScreen('ranking-screen');
                });
            }
            
            const settingsBtn = document.getElementById('settings-btn');
            if (settingsBtn) {
                settingsBtn.addEventListener('click', () => {
                    console.log('设置按钮被点击');
                    this.showScreen('settings-screen');
                });
            }
            
            // 游戏界面按钮
            const pauseBtn = document.getElementById('pause-btn');
            if (pauseBtn) {
                pauseBtn.addEventListener('click', () => {
                    console.log('暂停按钮被点击');
                    this.game.pauseGame();
                });
            }
            
            // 暂停菜单按钮
            const resumeBtn = document.getElementById('resume-btn');
            if (resumeBtn) {
                resumeBtn.addEventListener('click', () => {
                    console.log('继续游戏按钮被点击');
                    this.game.resumeGame();
                });
            }
            
            const restartFromPauseBtn = document.getElementById('restart-from-pause-btn');
            if (restartFromPauseBtn) {
                restartFromPauseBtn.addEventListener('click', () => {
                    console.log('从暂停菜单重新开始按钮被点击');
                    this.game.resetGame();
                });
            }
            
            const homeFromPauseBtn = document.getElementById('home-from-pause-btn');
            if (homeFromPauseBtn) {
                homeFromPauseBtn.addEventListener('click', () => {
                    console.log('从暂停菜单返回主菜单按钮被点击');
                    this.showScreen('start-screen');
                });
            }
            
            // 游戏结束界面按钮
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => {
                    console.log('重新开始按钮被点击');
                    this.game.resetGame();
                });
            }
            
            const homeBtn = document.getElementById('home-btn');
            if (homeBtn) {
                homeBtn.addEventListener('click', () => {
                    console.log('返回主菜单按钮被点击');
                    this.showScreen('start-screen');
                });
            }
            
            // 排行榜界面按钮
            const rankingBackBtn = document.getElementById('ranking-back-btn');
            if (rankingBackBtn) {
                rankingBackBtn.addEventListener('click', () => {
                    console.log('从排行榜返回按钮被点击');
                    this.showScreen('start-screen');
                });
            }
            
            // 设置界面按钮
            const settingsBackBtn = document.getElementById('settings-back-btn');
            if (settingsBackBtn) {
                settingsBackBtn.addEventListener('click', () => {
                    console.log('从设置返回按钮被点击');
                    this.showScreen('start-screen');
                });
            }
            
            // 设置选项
            const soundToggle = document.getElementById('sound-toggle');
            if (soundToggle) {
                soundToggle.addEventListener('change', (e) => {
                    const enabled = e.target.checked;
                    console.log('音效开关状态改变:', enabled ? '开启' : '关闭');
                    this.game.audio.setSoundEnabled(enabled);
                });
            }
            
            const musicToggle = document.getElementById('music-toggle');
            if (musicToggle) {
                musicToggle.addEventListener('change', (e) => {
                    const enabled = e.target.checked;
                    console.log('音乐开关状态改变:', enabled ? '开启' : '关闭');
                    this.game.audio.setMusicEnabled(enabled);
                });
            }
            
            console.log('UI事件监听设置完成');
        } catch (error) {
            console.error('设置UI事件时发生错误:', error);
        }
    }
    
    // 显示指定屏幕
    showScreen(screenId) {
        console.log(`正在切换到屏幕: ${screenId}`);
        
        // 隐藏所有屏幕
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
            } else {
                console.warn('屏幕元素不存在');
            }
        });
        
        // 显示目标屏幕
        const targetScreen = this.screens[screenId];
        if (targetScreen) {
            targetScreen.classList.add('active');
            console.log(`屏幕 ${screenId} 已激活`);
        } else {
            console.error(`未找到目标屏幕: ${screenId}`);
        }
    }
    
    // 显示游戏结束界面
    showGameOver(score, bestScore) {
        document.getElementById('final-score').textContent = score;
        document.getElementById('best-score-final').textContent = bestScore;
        this.showScreen('game-over-screen');
    }
    
    // 显示排行榜
    showRanking() {
        const rankingList = document.getElementById('ranking-list');
        rankingList.innerHTML = '';
        
        // 获取本地排行榜数据（假设已存储）
        const rankings = this.loadRankings();
        
        if (rankings.length === 0) {
            rankingList.innerHTML = '<div class="no-rankings">暂无记录</div>';
            return;
        }
        
        // 创建排行榜项目
        rankings.forEach((item, index) => {
            const rankItem = document.createElement('div');
            rankItem.className = 'rank-item';
            rankItem.innerHTML = `
                <span class="rank-position">${index + 1}</span>
                <span class="rank-score">${item.score}</span>
                <span class="rank-date">${item.date}</span>
            `;
            rankingList.appendChild(rankItem);
        });
    }
    
    // 加载排行榜数据
    loadRankings() {
        const rankings = localStorage.getItem('jumpGameRankings');
        return rankings ? JSON.parse(rankings) : [];
    }
    
    // 保存得分到排行榜
    saveScore(score) {
        const rankings = this.loadRankings();
        
        // 添加新得分
        rankings.push({
            score: score,
            date: new Date().toLocaleDateString()
        });
        
        // 按分数降序排列
        rankings.sort((a, b) => b.score - a.score);
        
        // 只保留前10名
        const topRankings = rankings.slice(0, 10);
        
        // 保存到本地存储
        localStorage.setItem('jumpGameRankings', JSON.stringify(topRankings));
    }
} 