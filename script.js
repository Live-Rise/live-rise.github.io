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
    
    // 随机选择背景图片
    function setRandomBackground() {
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        const selectedImage = backgroundImages[randomIndex];
        
        backgroundElement.style.backgroundImage = `url('${selectedImage}')`;
    }
    
    // 页面加载时设置随机背景
    setRandomBackground();
}); 