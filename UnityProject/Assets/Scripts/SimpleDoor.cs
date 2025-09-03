using UnityEngine;
using System.Runtime.InteropServices;

public class SimpleDoor : MonoBehaviour
{
    [Header("Door Settings")]
    public string destinationKey = "arcade";
    public Color doorColor = Color.blue;
    public float pulseSpeed = 2f;
    
    private Renderer doorRenderer;
    private Material originalMaterial;
    private Color pulseColor;
    
    // WebGL bridge function
    #if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")]
    private static extern void FD_OnDoorEnter(string key);
    #endif
    
    void Start()
    {
        doorRenderer = GetComponent<Renderer>();
        if (doorRenderer != null)
        {
            originalMaterial = doorRenderer.material;
            pulseColor = doorColor;
        }
        
        // Make sure the door is visible
        if (doorRenderer == null)
        {
            // Add a renderer if none exists
            gameObject.AddComponent<MeshRenderer>();
            gameObject.AddComponent<MeshFilter>();
            GetComponent<MeshFilter>().mesh = CreateCubeMesh();
            doorRenderer = GetComponent<Renderer>();
            originalMaterial = doorRenderer.material;
        }
    }
    
    void Update()
    {
        // Pulse the door color
        if (doorRenderer != null)
        {
            float pulse = Mathf.Sin(Time.time * pulseSpeed) * 0.5f + 0.5f;
            Color currentColor = Color.Lerp(doorColor, Color.white, pulse * 0.3f);
            doorRenderer.material.color = currentColor;
        }
    }
    
    void OnMouseDown()
    {
        Debug.Log($"Door clicked! Destination: {destinationKey}");
        
        // Notify React
        #if UNITY_WEBGL && !UNITY_EDITOR
        FD_OnDoorEnter(destinationKey);
        #else
        Debug.Log($"[EDITOR] Would call FD_OnDoorEnter with key: {destinationKey}");
        #endif
    }
    
    void OnMouseEnter()
    {
        if (doorRenderer != null)
        {
            doorRenderer.material.color = Color.yellow;
        }
    }
    
    void OnMouseExit()
    {
        if (doorRenderer != null)
        {
            doorRenderer.material.color = doorColor;
        }
    }
    
    private Mesh CreateCubeMesh()
    {
        Mesh mesh = new Mesh();
        
        Vector3[] vertices = {
            new Vector3(-0.5f, -0.5f, -0.5f),
            new Vector3(0.5f, -0.5f, -0.5f),
            new Vector3(0.5f, 0.5f, -0.5f),
            new Vector3(-0.5f, 0.5f, -0.5f),
            new Vector3(-0.5f, -0.5f, 0.5f),
            new Vector3(0.5f, -0.5f, 0.5f),
            new Vector3(0.5f, 0.5f, 0.5f),
            new Vector3(-0.5f, 0.5f, 0.5f)
        };
        
        int[] triangles = {
            0, 2, 1, 0, 3, 2, // front
            2, 3, 4, 2, 4, 6, // top
            1, 2, 6, 1, 6, 5, // right
            0, 7, 4, 0, 3, 7, // left
            5, 6, 7, 5, 7, 4, // back
            0, 4, 1, 1, 4, 5  // bottom
        };
        
        mesh.vertices = vertices;
        mesh.triangles = triangles;
        mesh.RecalculateNormals();
        
        return mesh;
    }
} 