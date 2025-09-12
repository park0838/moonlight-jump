// Infinite platform generation system for moonlight-jump.html
// Add this after the existing updateScore function

// Dynamic platform generation for infinite climbing
let lastGeneratedHeight = 0;
function generateNewPlatforms(currentHeight) {
    // Generate new platforms every 500m of height gained
    if (currentHeight > lastGeneratedHeight + 500) {
        const startY = GAME_CONFIG.gameHeight - 100 - (lastGeneratedHeight + 500) * 10;
        
        // Generate 50 more platforms
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * (GAME_CONFIG.gameWidth - 200) + 100;
            const y = startY - (i * GAME_CONFIG.platformGap);
            
            let type = 'normal';
            const platformIndex = Math.floor((lastGeneratedHeight + 500) / 10) + i;
            if (platformIndex % 8 === 0) type = 'spring';
            else if (platformIndex > 15 && Math.random() < 0.15) type = 'spring';
            
            const width = Math.random() > 0.5 ? 5 : 4;
            createPlatform(x, y, type, width);
        }
        
        lastGeneratedHeight += 500;
        
        // Clean up old platforms that are far below to save memory
        cleanupOldPlatforms();
    }
}

// Memory management - remove platforms far below player
function cleanupOldPlatforms() {
    if (!playerBody) return;
    
    const cleanupThreshold = playerBody.position.y + 1000;
    platforms = platforms.filter(platform => {
        if (platform.y > cleanupThreshold) {
            // Remove from physics world
            World.remove(world, [platform.body, platform.sensor]);
            // Remove visual element
            if (platform.element && platform.element.parentNode) {
                platform.element.parentNode.removeChild(platform.element);
            }
            return false;
        }
        return true;
    });
}

// Modified updateScore function - replace the existing one
function updateScore() {
    if (!playerBody) return;
    
    const height = Math.max(0, Math.floor((GAME_CONFIG.gameHeight - playerBody.position.y) / 10));
    if (height > gameState.score.height) {
        gameState.score.height = height;
        elements.heightScore.textContent = height + 'm';
        
        // Generate new platforms as player climbs higher
        generateNewPlatforms(height);
    }
    
    // Check game over
    if (playerBody.position.y > GAME_CONFIG.gameHeight + 200) {
        gameOver();
    }
}

// Modified resetGame function - add this line to reset infinite generation
// Add after: platforms = [];
// lastGeneratedHeight = 0;