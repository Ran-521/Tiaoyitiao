/**
 * 跳一跳游戏 - 音频控制
 * 管理游戏中的音效和背景音乐
 */

class Audio {
    constructor() {
        console.log('初始化音频系统...');
        
        // 音频设置
        this.soundEnabled = true;
        this.musicEnabled = true;
        
        // 音频上下文（延迟创建）
        this.audioContext = null;
        
        // 音频资源
        this.sounds = {};
        this.backgroundMusic = null;
        
        // 加载音效
        this.loadSounds();
        
        console.log('音频系统初始化完成');
    }
    
    // 延迟初始化音频上下文（需要用户交互）
    initAudioContext() {
        try {
            if (!this.audioContext && window.AudioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('音频上下文已创建');
                return true;
            }
            return !!this.audioContext;
        } catch (e) {
            console.error('创建音频上下文失败:', e);
            return false;
        }
    }
    
    // 加载音效
    loadSounds() {
        try {
            console.log('创建音效占位...');
            
            // 创建音效占位符
            this.sounds = {
                jump: { frequency: 400, duration: 0.3 },
                land: { frequency: 200, duration: 0.2 },
                gameover: { frequency: 100, duration: 0.8 },
                charge: { frequency: 300, duration: 0.1, repeating: true }
            };
            
            // 创建背景音乐
            this.createPlaceholderMusic();
            
            console.log('音效占位符创建完成');
        } catch (e) {
            console.error('加载音效失败:', e);
        }
    }
    
    // 创建占位音效
    createPlaceholderAudio(frequency, duration, callback) {
        try {
            if (!this.initAudioContext() || !this.soundEnabled) {
                return;
            }
            
            // 创建音调发生器
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            // 创建音量控制
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            // 连接节点
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 播放音效
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
            
            // 完成回调
            if (callback) {
                setTimeout(callback, duration * 1000);
            }
            
            return { oscillator, gainNode };
        } catch (e) {
            console.error('创建占位音效失败:', e);
            return null;
        }
    }
    
    // 创建占位背景音乐
    createPlaceholderMusic() {
        // 简单的占位功能，实际游戏应加载真正的背景音乐
        this.backgroundMusic = {
            isPlaying: false,
            loopInterval: null,
            
            play: () => {
                if (this.musicEnabled && !this.backgroundMusic.isPlaying) {
                    console.log('背景音乐开始播放');
                    this.backgroundMusic.isPlaying = true;
                    
                    // 模拟持续播放
                    this.playMusicLoop();
                }
            },
            
            pause: () => {
                console.log('背景音乐暂停');
                this.backgroundMusic.isPlaying = false;
                
                // 清除可能存在的循环计时器
                if (this.backgroundMusic.loopInterval) {
                    clearTimeout(this.backgroundMusic.loopInterval);
                    this.backgroundMusic.loopInterval = null;
                }
            },
            
            stop: () => {
                this.backgroundMusic.pause();
            }
        };
    }
    
    // 模拟背景音乐循环
    playMusicLoop() {
        try {
            if (!this.backgroundMusic.isPlaying) return;
            
            // 播放简单的音符序列
            const notes = [262, 294, 330, 349, 392, 440, 494, 523];
            const note = notes[Math.floor(Math.random() * notes.length)];
            const duration = 0.2;
            
            this.createPlaceholderAudio(note, duration, () => {
                // 使用setTimeout而不是直接递归，防止调用栈溢出
                this.backgroundMusic.loopInterval = setTimeout(() => {
                    if (this.backgroundMusic.isPlaying) {
                        this.playMusicLoop();
                    }
                }, duration * 1000);
            });
        } catch (e) {
            console.error('播放音乐循环失败:', e);
        }
    }
    
    // 播放音效
    playSound(soundName) {
        try {
            if (!this.soundEnabled) return;
            
            const sound = this.sounds[soundName];
            if (!sound) {
                console.warn(`未找到音效: ${soundName}`);
                return;
            }
            
            console.log(`播放音效: ${soundName}`);
            
            if (sound.repeating) {
                this.stopSound(soundName);
                sound.active = this.createPlaceholderAudio(sound.frequency, sound.duration, () => {
                    if (sound.active) {
                        setTimeout(() => this.playSound(soundName), 100);
                    }
                });
            } else {
                this.createPlaceholderAudio(sound.frequency, sound.duration);
            }
        } catch (e) {
            console.error(`播放音效失败 (${soundName}):`, e);
        }
    }
    
    // 停止音效
    stopSound(soundName) {
        try {
            const sound = this.sounds[soundName];
            if (sound && sound.active) {
                if (sound.active.oscillator) {
                    sound.active.oscillator.stop();
                }
                sound.active = null;
            }
        } catch (e) {
            console.error(`停止音效失败 (${soundName}):`, e);
        }
    }
    
    // 播放背景音乐
    playBackgroundMusic() {
        try {
            if (this.musicEnabled && this.backgroundMusic) {
                this.backgroundMusic.play();
            }
        } catch (e) {
            console.error('播放背景音乐失败:', e);
        }
    }
    
    // 暂停背景音乐
    pauseBackgroundMusic() {
        try {
            if (this.backgroundMusic) {
                this.backgroundMusic.pause();
            }
        } catch (e) {
            console.error('暂停背景音乐失败:', e);
        }
    }
    
    // 设置音效启用状态
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        console.log(`音效已${enabled ? '启用' : '禁用'}`);
        
        // 如果禁用，停止所有活动音效
        if (!enabled) {
            for (const soundName in this.sounds) {
                this.stopSound(soundName);
            }
        }
    }
    
    // 设置音乐启用状态
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        console.log(`音乐已${enabled ? '启用' : '禁用'}`);
        
        // 根据设置播放或暂停背景音乐
        if (enabled) {
            this.playBackgroundMusic();
        } else {
            this.pauseBackgroundMusic();
        }
    }
} 