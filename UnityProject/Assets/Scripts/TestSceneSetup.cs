using UnityEngine;

public class TestSceneSetup : MonoBehaviour
{
    [Header("Scene Setup")]
    public bool autoSetup = true;
    public Material floorMaterial;
    public Material wallMaterial;
    
    void Start()
    {
        if (autoSetup)
        {
            SetupTestScene();
        }
    }
    
    void SetupTestScene()
    {
        Debug.Log("Setting up test scene...");
        
        // Create floor
        CreateFloor();
        
        // Create walls
        CreateWalls();
        
        // Create doors
        CreateDoors();
        
        // Create some basic objects
        CreateBasicObjects();
        
        Debug.Log("Test scene setup complete!");
    }
    
    void CreateFloor()
    {
        GameObject floor = GameObject.CreatePrimitive(PrimitiveType.Plane);
        floor.name = "Floor";
        floor.transform.position = Vector3.zero;
        floor.transform.localScale = new Vector3(10, 1, 10);
        
        if (floorMaterial != null)
        {
            floor.GetComponent<Renderer>().material = floorMaterial;
        }
        else
        {
            floor.GetComponent<Renderer>().material.color = new Color(0.3f, 0.3f, 0.3f);
        }
    }
    
    void CreateWalls()
    {
        // Create 4 walls around the scene
        Vector3[] wallPositions = {
            new Vector3(0, 2, 5),   // North wall
            new Vector3(0, 2, -5),  // South wall
            new Vector3(5, 2, 0),   // East wall
            new Vector3(-5, 2, 0)   // West wall
        };
        
        Vector3[] wallRotations = {
            Vector3.zero,           // North
            Vector3.zero,           // South
            new Vector3(0, 90, 0),  // East
            new Vector3(0, 90, 0)   // West
        };
        
        for (int i = 0; i < 4; i++)
        {
            GameObject wall = GameObject.CreatePrimitive(PrimitiveType.Cube);
            wall.name = $"Wall_{i}";
            wall.transform.position = wallPositions[i];
            wall.transform.rotation = Quaternion.Euler(wallRotations[i]);
            wall.transform.localScale = new Vector3(10, 4, 0.2f);
            
            if (wallMaterial != null)
            {
                wall.GetComponent<Renderer>().material = wallMaterial;
            }
            else
            {
                wall.GetComponent<Renderer>().material.color = new Color(0.5f, 0.5f, 0.5f);
            }
        }
    }
    
    void CreateDoors()
    {
        // Create door to arcade
        GameObject arcadeDoor = new GameObject("ArcadeDoor");
        arcadeDoor.transform.position = new Vector3(0, 1, 4.9f);
        arcadeDoor.transform.localScale = new Vector3(2, 2, 0.1f);
        
        // Add door components
        arcadeDoor.AddComponent<SimpleDoor>();
        arcadeDoor.GetComponent<SimpleDoor>().destinationKey = "arcade";
        arcadeDoor.GetComponent<SimpleDoor>().doorColor = Color.cyan;
        
        // Create door to record store
        GameObject recordDoor = new GameObject("RecordStoreDoor");
        recordDoor.transform.position = new Vector3(4.9f, 1, 0);
        recordDoor.transform.rotation = Quaternion.Euler(0, 90, 0);
        recordDoor.transform.localScale = new Vector3(2, 2, 0.1f);
        
        recordDoor.AddComponent<SimpleDoor>();
        recordDoor.GetComponent<SimpleDoor>().destinationKey = "record-store";
        recordDoor.GetComponent<SimpleDoor>().doorColor = Color.magenta;
        
        // Create door to ballroom
        GameObject ballroomDoor = new GameObject("BallroomDoor");
        ballroomDoor.transform.position = new Vector3(0, 1, -4.9f);
        ballroomDoor.transform.localScale = new Vector3(2, 2, 0.1f);
        
        ballroomDoor.AddComponent<SimpleDoor>();
        ballroomDoor.GetComponent<SimpleDoor>().destinationKey = "ballroom";
        ballroomDoor.GetComponent<SimpleDoor>().doorColor = Color.green;
    }
    
    void CreateBasicObjects()
    {
        // Create a center platform
        GameObject platform = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        platform.name = "CenterPlatform";
        platform.transform.position = new Vector3(0, 0.5f, 0);
        platform.transform.localScale = new Vector3(3, 1, 3);
        platform.GetComponent<Renderer>().material.color = new Color(0.2f, 0.2f, 0.8f);
        
        // Create some decorative cubes
        for (int i = 0; i < 5; i++)
        {
            GameObject cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
            cube.name = $"DecorativeCube_{i}";
            
            float angle = (i / 5f) * Mathf.PI * 2f;
            float radius = 3f;
            cube.transform.position = new Vector3(
                Mathf.Cos(angle) * radius,
                0.5f,
                Mathf.Sin(angle) * radius
            );
            
            cube.transform.localScale = new Vector3(0.5f, 1f, 0.5f);
            cube.GetComponent<Renderer>().material.color = new Color(
                Random.Range(0.5f, 1f),
                Random.Range(0.5f, 1f),
                Random.Range(0.5f, 1f)
            );
        }
    }
    
    // Editor function to set up scene manually
    [ContextMenu("Setup Test Scene")]
    void SetupSceneManually()
    {
        SetupTestScene();
    }
} 