using System.Runtime.InteropServices;
using UnityEngine;
using UnityEngine.UI;

public class DoorPortal : MonoBehaviour 
{
    [Header("Portal Configuration")]
    [SerializeField] private string destinationKey = "record-store";
    [SerializeField] private string portalName = "Portal";
    [SerializeField] private Color highlightColor = Color.cyan;
    [SerializeField] private float interactionDistance = 3f;
    
    [Header("Visual Feedback")]
    [SerializeField] private Material defaultMaterial;
    [SerializeField] private Material highlightMaterial;
    [SerializeField] private Light portalLight;
    [SerializeField] private ParticleSystem portalParticles;
    
    private Material originalMaterial;
    private Renderer portalRenderer;
    private bool isPlayerNearby = false;
    private bool isInteracting = false;
    
    // WebGL external functions
    #if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")]
    private static extern void FD_OnDoorEnter(string key);
    
    [DllImport("__Internal")]
    private static extern void FD_OnUnityReady();
    #endif
    
    void Start()
    {
        portalRenderer = GetComponent<Renderer>();
        if (portalRenderer != null)
        {
            originalMaterial = portalRenderer.material;
        }
        
        // Set up portal light
        if (portalLight != null)
        {
            portalLight.color = highlightColor;
            portalLight.intensity = 0.5f;
        }
        
        // Notify React that Unity is ready
        #if UNITY_WEBGL && !UNITY_EDITOR
        FD_OnUnityReady();
        #endif
        
        Debug.Log($"DoorPortal '{portalName}' initialized for destination: {destinationKey}");
    }
    
    void Update()
    {
        // Check for player proximity
        GameObject player = GameObject.FindGameObjectWithTag("Player");
        if (player != null)
        {
            float distance = Vector3.Distance(transform.position, player.transform.position);
            bool wasNearby = isPlayerNearby;
            isPlayerNearby = distance <= interactionDistance;
            
            // Handle proximity changes
            if (isPlayerNearby != wasNearby)
            {
                if (isPlayerNearby)
                {
                    OnPlayerEnter();
                }
                else
                {
                    OnPlayerExit();
                }
            }
            
            // Handle interaction input
            if (isPlayerNearby && Input.GetKeyDown(KeyCode.E))
            {
                OnPortalActivated();
            }
        }
    }
    
    void OnMouseDown()
    {
        if (isPlayerNearby && !isInteracting)
        {
            OnPortalActivated();
        }
    }
    
    void OnPlayerEnter()
    {
        // Visual feedback
        if (portalRenderer != null && highlightMaterial != null)
        {
            portalRenderer.material = highlightMaterial;
        }
        
        if (portalLight != null)
        {
            portalLight.intensity = 1.5f;
        }
        
        if (portalParticles != null)
        {
            portalParticles.Play();
        }
        
        // Show UI prompt
        ShowInteractionPrompt();
        
        Debug.Log($"Player entered portal '{portalName}'");
    }
    
    void OnPlayerExit()
    {
        // Reset visual state
        if (portalRenderer != null && originalMaterial != null)
        {
            portalRenderer.material = originalMaterial;
        }
        
        if (portalLight != null)
        {
            portalLight.intensity = 0.5f;
        }
        
        if (portalParticles != null)
        {
            portalParticles.Stop();
        }
        
        // Hide UI prompt
        HideInteractionPrompt();
        
        Debug.Log($"Player exited portal '{portalName}'");
    }
    
    void OnPortalActivated()
    {
        if (isInteracting) return;
        
        isInteracting = true;
        
        // Visual activation effect
        StartCoroutine(PortalActivationSequence());
        
        // Notify React
        #if UNITY_WEBGL && !UNITY_EDITOR
        FD_OnDoorEnter(destinationKey);
        #else
        Debug.Log($"[EDITOR] Would call FD_OnDoorEnter with key: {destinationKey}");
        #endif
        
        Debug.Log($"Portal '{portalName}' activated for destination: {destinationKey}");
    }
    
    System.Collections.IEnumerator PortalActivationSequence()
    {
        // Flash effect
        if (portalLight != null)
        {
            portalLight.intensity = 3f;
            yield return new WaitForSeconds(0.1f);
            portalLight.intensity = 1.5f;
        }
        
        // Wait for transition
        yield return new WaitForSeconds(0.5f);
        
        isInteracting = false;
    }
    
    void ShowInteractionPrompt()
    {
        // This would typically show a UI element
        // For now, just log it
        Debug.Log($"Press E to enter {portalName}");
    }
    
    void HideInteractionPrompt()
    {
        // Hide the interaction prompt
        Debug.Log($"Interaction prompt hidden for {portalName}");
    }
    
    void OnDrawGizmosSelected()
    {
        // Draw interaction range in editor
        Gizmos.color = highlightColor;
        Gizmos.DrawWireSphere(transform.position, interactionDistance);
    }
} 