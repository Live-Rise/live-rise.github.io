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
}); 