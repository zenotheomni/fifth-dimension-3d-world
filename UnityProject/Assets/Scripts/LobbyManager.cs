using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;

public class LobbyManager : MonoBehaviour
{
    [Header("Lobby Configuration")]
    [SerializeField] private Transform lobbyCenter;
    [SerializeField] private float doorFocusSpeed = 2f;
    [SerializeField] private float cameraSmoothTime = 0.5f;
    
    [Header("Doors")]
    [SerializeField] private List<DoorPortal> availableDoors = new List<DoorPortal>();
    [SerializeField] private Dictionary<string, DoorPortal> doorRegistry = new Dictionary<string, DoorPortal>();
    
    [Header("Camera Control")]
    [SerializeField] private Camera lobbyCamera;
    [SerializeField] private Transform cameraTarget;
    [SerializeField] private Vector3 cameraOffset = new Vector3(0, 5, -10);
    
    private Vector3 cameraVelocity = Vector3.zero;
    private bool isFocusingDoor = false;
    private Transform focusTarget = null;
    
    // WebGL external functions
    #if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")]
    private static extern void FD_OnGameStart(string gameName);
    #endif
    
    void Start()
    {
        // Auto-find lobby camera if not assigned
        if (lobbyCamera == null)
        {
            lobbyCamera = Camera.main;
        }
        
        // Set up camera target
        if (cameraTarget == null)
        {
            GameObject targetObj = new GameObject("CameraTarget");
            targetObj.transform.position = lobbyCenter != null ? lobbyCenter.position : Vector3.zero;
            cameraTarget = targetObj.transform;
        }
        
        // Register all doors
        RegisterDoors();
        
        // Set initial camera position
        if (lobbyCamera != null && cameraTarget != null)
        {
            lobbyCamera.transform.position = cameraTarget.position + cameraOffset;
            lobbyCamera.transform.LookAt(cameraTarget);
        }
        
        Debug.Log("LobbyManager initialized");
    }
    
    void Update()
    {
        // Handle camera movement
        if (isFocusingDoor && focusTarget != null)
        {
            UpdateCameraFocus();
        }
        
        // Handle input
        HandleInput();
    }
    
    void RegisterDoors()
    {
        // Find all door portals in the scene
        DoorPortal[] doors = FindObjectsOfType<DoorPortal>();
        
        foreach (DoorPortal door in doors)
        {
            if (!availableDoors.Contains(door))
            {
                availableDoors.Add(door);
            }
            
            // Register by destination key if available
            // Note: This would need to be set up in the Unity editor
            // or through a custom inspector
        }
        
        Debug.Log($"Registered {availableDoors.Count} doors");
    }
    
    public void FocusDoor(string doorKey)
    {
        Debug.Log($"FocusDoor called with key: {doorKey}");
        
        // Find the door by key
        DoorPortal targetDoor = FindDoorByKey(doorKey);
        
        if (targetDoor != null)
        {
            StartFocusSequence(targetDoor);
        }
        else
        {
            Debug.LogWarning($"Door with key '{doorKey}' not found");
        }
    }
    
    DoorPortal FindDoorByKey(string key)
    {
        // This is a simplified lookup - in a real implementation,
        // you'd want to store the key in the DoorPortal component
        foreach (DoorPortal door in availableDoors)
        {
            // For now, just check the first door
            // You'd need to add a public property to DoorPortal for this
            return door;
        }
        return null;
    }
    
    void StartFocusSequence(DoorPortal door)
    {
        isFocusingDoor = true;
        focusTarget = door.transform;
        
        Debug.Log($"Starting focus sequence on door: {door.name}");
        
        // You could add visual effects here
        // like highlighting the door, playing sounds, etc.
    }
    
    void UpdateCameraFocus()
    {
        if (focusTarget == null || lobbyCamera == null) return;
        
        // Calculate target position
        Vector3 targetPosition = focusTarget.position + cameraOffset;
        
        // Smoothly move camera
        lobbyCamera.transform.position = Vector3.SmoothDamp(
            lobbyCamera.transform.position,
            targetPosition,
            ref cameraVelocity,
            cameraSmoothTime
        );
        
        // Look at the door
        lobbyCamera.transform.LookAt(focusTarget);
        
        // Check if we're close enough to stop focusing
        float distance = Vector3.Distance(lobbyCamera.transform.position, targetPosition);
        if (distance < 0.1f)
        {
            isFocusingDoor = false;
            focusTarget = null;
            Debug.Log("Door focus sequence completed");
        }
    }
    
    void HandleInput()
    {
        // Reset camera to lobby center
        if (Input.GetKeyDown(KeyCode.R))
        {
            ResetCameraToLobby();
        }
        
        // Cycle through doors
        if (Input.GetKeyDown(KeyCode.Tab))
        {
            CycleToNextDoor();
        }
    }
    
    void ResetCameraToLobby()
    {
        isFocusingDoor = false;
        focusTarget = null;
        
        if (lobbyCamera != null && cameraTarget != null)
        {
            Vector3 targetPos = cameraTarget.position + cameraOffset;
            lobbyCamera.transform.position = targetPos;
            lobbyCamera.transform.LookAt(cameraTarget);
        }
        
        Debug.Log("Camera reset to lobby center");
    }
    
    void CycleToNextDoor()
    {
        if (availableDoors.Count == 0) return;
        
        // Find current focused door
        int currentIndex = -1;
        if (focusTarget != null)
        {
            for (int i = 0; i < availableDoors.Count; i++)
            {
                if (availableDoors[i].transform == focusTarget)
                {
                    currentIndex = i;
                    break;
                }
            }
        }
        
        // Move to next door
        int nextIndex = (currentIndex + 1) % availableDoors.Count;
        StartFocusSequence(availableDoors[nextIndex]);
        
        Debug.Log($"Cycling to door: {availableDoors[nextIndex].name}");
    }
    
    public void StartGame(string gameName)
    {
        Debug.Log($"Starting game: {gameName}");
        
        // Notify React
        #if UNITY_WEBGL && !UNITY_EDITOR
        FD_OnGameStart(gameName);
        #else
        Debug.Log($"[EDITOR] Would call FD_OnGameStart with game: {gameName}");
        #endif
        
        // You could add game-specific logic here
        // like loading different scenes, setting up game state, etc.
    }
    
    public void ReturnToLobby()
    {
        Debug.Log("Returning to lobby");
        
        // Reset camera
        ResetCameraToLobby();
        
        // You could add lobby-specific logic here
        // like resetting game state, showing UI, etc.
    }
    
    void OnDrawGizmos()
    {
        // Draw lobby center
        if (lobbyCenter != null)
        {
            Gizmos.color = Color.green;
            Gizmos.DrawWireSphere(lobbyCenter.position, 2f);
        }
        
        // Draw door connections
        Gizmos.color = Color.blue;
        foreach (DoorPortal door in availableDoors)
        {
            if (door != null && lobbyCenter != null)
            {
                Gizmos.DrawLine(lobbyCenter.position, door.transform.position);
            }
        }
    }
} 