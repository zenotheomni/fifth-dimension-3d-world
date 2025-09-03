// Unity WebGL Bridge Handlers
// This file defines the global handlers that Unity calls via the .jslib bridge

console.log('[bridge] Loading Unity bridge handlers...');

// Door navigation handler
window.onDoorEnter = (key) => {
    console.log('[bridge] door enter:', key);
    
    // Dispatch custom event for React components
    document.dispatchEvent(new CustomEvent('fd:open', { detail: key }));
    
    // You can also handle navigation here directly
    // window.location.hash = `#/${key}`;
};

// Game start handler
window.onGameStart = (gameName) => {
    console.log('[bridge] game start:', gameName);
    
    // Dispatch custom event for React components
    document.dispatchEvent(new CustomEvent('fd:game-start', { detail: gameName }));
};

// Purchase request handler
window.onPurchaseRequest = (productId) => {
    console.log('[bridge] purchase request:', productId);
    
    // Dispatch custom event for React components
    document.dispatchEvent(new CustomEvent('fd:purchase', { detail: productId }));
};

// Unity ready handler
window.onUnityReady = () => {
    console.log('[bridge] Unity is ready');
    
    // Dispatch custom event for React components
    document.dispatchEvent(new CustomEvent('fd:unity-ready'));
};

// Scene loaded handler
window.onSceneLoaded = (sceneName) => {
    console.log('[bridge] scene loaded:', sceneName);
    
    // Dispatch custom event for React components
    document.dispatchEvent(new CustomEvent('fd:scene-loaded', { detail: sceneName }));
};

// Bridge status check
window.isUnityBridgeReady = () => {
    return typeof window.onDoorEnter === 'function' &&
           typeof window.onGameStart === 'function' &&
           typeof window.onUnityReady === 'function' &&
           typeof window.onSceneLoaded === 'function' &&
           typeof window.onPurchaseRequest === 'function';
};

// Unity instance management
window.FDBridge = {
    unityInstance: null,
    
    // Register Unity instance for bidirectional communication
    registerUnityInstance: (instance) => {
        window.FDBridge.unityInstance = instance;
        console.log('[bridge] Unity instance registered for bidirectional communication');
    },
    
    // Send message from web to Unity
    sendMessage: (gameObject, methodName, value) => {
        if (window.FDBridge.unityInstance) {
            console.log(`[bridge] Sending to Unity: ${gameObject}.${methodName}(${value})`);
            window.FDBridge.unityInstance.SendMessage(gameObject, methodName, value);
        } else {
            console.warn('[bridge] Unity instance not registered, cannot send message');
        }
    },
    
    // Test Unity communication
    testUnityCommunication: () => {
        if (window.FDBridge.unityInstance) {
            console.log('[bridge] Testing Unity communication...');
            window.FDBridge.sendMessage('LobbyManager', 'FocusDoor', 'arcade');
            setTimeout(() => {
                window.FDBridge.sendMessage('LobbyManager', 'StartGame', 'neon-runner');
            }, 1000);
        } else {
            console.log('[bridge] Unity instance not available for testing');
        }
    }
};

console.log('[bridge] Unity bridge handlers loaded successfully');
console.log('[bridge] Bridge ready:', window.isUnityBridgeReady());
console.log('[bridge] FDBridge object available for Unity communication'); 