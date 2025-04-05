/**
 * 跳一跳游戏 - 音频控制
 * 管理游戏中的音效和背景音乐
 * 当前设置：所有音效已禁用
 */

class Audio {
    constructor() {
        console.log('初始化音频系统... (静音模式)');
        
        // 音频设置 - 强制禁用
        this.soundEnabled = false;
        this.musicEnabled = false;
        
        console.log('音频系统初始化完成 (静音模式)');
    }
    
    // 以下方法均为空实现 - 不产生任何音效
    
    initAudioContext() {
        return false; // 不创建音频上下文
    }
    
    loadSounds() {
        // 不加载任何音效
    }
    
    createPlaceholderAudio() {
        // 不创建任何音效
        return null;
    }
    
    createPlaceholderMusic() {
        // 创建一个空的背景音乐对象，所有方法都是空操作
        this.backgroundMusic = {
            isPlaying: false,
            play: () => {},
            pause: () => {},
            stop: () => {}
        };
    }
    
    playMusicLoop() {
        // 不播放任何音乐循环
    }
    
    playSound(soundName) {
        // 不播放任何音效
    }
    
    stopSound(soundName) {
        // 不停止任何音效（因为没有播放）
    }
    
    playBackgroundMusic() {
        // 不播放背景音乐
    }
    
    pauseBackgroundMusic() {
        // 不暂停背景音乐（因为没有播放）
    }
    
    setSoundEnabled(enabled) {
        // 始终保持禁用状态
        this.soundEnabled = false;
    }
    
    setMusicEnabled(enabled) {
        // 始终保持禁用状态
        this.musicEnabled = false;
    }
} 