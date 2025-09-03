mergeInto(LibraryManager.library, {
  FD_OnDoorEnter: function (ptr) {
    const key = UTF8ToString(ptr);
    if (typeof window.onDoorEnter === 'function') window.onDoorEnter(key);
  },
  
  FD_OnGameStart: function (ptr) {
    const gameName = UTF8ToString(ptr);
    if (typeof window.onGameStart === 'function') window.onGameStart(gameName);
  },
  
  FD_OnPurchaseRequest: function (ptr) {
    const productId = UTF8ToString(ptr);
    if (typeof window.onPurchaseRequest === 'function') window.onPurchaseRequest(productId);
  },
  
  FD_OnUnityReady: function () {
    if (typeof window.onUnityReady === 'function') window.onUnityReady();
  },
  
  FD_OnSceneLoaded: function (ptr) {
    const sceneName = UTF8ToString(ptr);
    if (typeof window.onSceneLoaded === 'function') window.onSceneLoaded(sceneName);
  }
}); 