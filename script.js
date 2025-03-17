document.addEventListener('DOMContentLoaded', function() {
    // 背景图片数组 - 替换为您的实际图片路径
    const backgroundImages = [
        'images/bg1.png',
        'images/bg2.png',
        'images/bg3.png',
        'images/bg4.png',
        'images/bg5.png',
        'images/bg6.png',
        'images/bg7.png',
        'images/bg8.png',
        'images/bg9.png',
        'images/bg10.png',
        'images/bg11.png',
        'images/bg12.png',
        'images/bg13.png',
  
        // 可以根据需要添加更多图片
    ];

    const backgroundElement = document.querySelector('.background-image');
    const logoElement = document.querySelector('.logo');
    const contentElement = document.querySelector('.content');
    
    // 随机选择背景图片
    function setRandomBackground() {
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        const selectedImage = backgroundImages[randomIndex];
        
        // 预加载图片
        const img = new Image();
        img.src = selectedImage;
        
        img.onload = function() {
            // 图片加载完成后设置背景，然后触发 Logo 动画
            backgroundElement.style.backgroundImage = `url('${selectedImage}')`;
            
            // Logo 动画已在 CSS 中设置，这里不需要额外的 JS 代码
            // 如果需要更精确控制，可以在这里添加 logoElement.style.animation = '...'
        };
    }
    
    // 页面加载时设置随机背景
    setRandomBackground();

    // 添加3D视差效果
    let isDesktop = window.innerWidth > 768;
    
    // 鼠标移动事件监听器
    document.addEventListener('mousemove', function(e) {
        if (!isDesktop) return; // 只在桌面端启用
        
        // 计算鼠标位置相对于窗口中心的偏移量
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;
        
        // 控制移动幅度
        const moveX = mouseX * 30; // 水平移动幅度
        const moveY = mouseY * 30; // 垂直移动幅度
        
        // LOGO的移动 - 与鼠标相反方向移动，增强3D效果
        logoElement.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
        
        // 背景的移动 - 与鼠标相同方向但幅度较小
        backgroundElement.style.transform = `scale(1.1) translate(${moveX * 0.2}px, ${moveY * 0.2}px)`;
    });
    
    // 添加设备方向感应（用于移动端）
    window.addEventListener('deviceorientation', function(e) {
        if (isDesktop) return; // 只在移动端启用
        
        // 如果设备方向数据可用
        if (e.beta !== null && e.gamma !== null) {
            // beta是前后倾斜角度，gamma是左右倾斜角度
            let tiltY = e.beta / 180 * 15;  // 限制在±15px范围内
            let tiltX = e.gamma / 90 * 15;
            
            // 限制最大位移
            tiltX = Math.max(-15, Math.min(15, tiltX));
            tiltY = Math.max(-15, Math.min(15, tiltY));
            
            // 应用位移效果
            logoElement.style.transform = `translate(${-tiltX}px, ${-tiltY}px)`;
            backgroundElement.style.transform = `scale(1.1) translate(${tiltX * 0.1}px, ${tiltY * 0.1}px)`;
        }
    });

    // 检测窗口大小变化以更新isDesktop状态
    window.addEventListener('resize', function() {
        isDesktop = window.innerWidth > 768;
    });
}); 