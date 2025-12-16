<?php
/**
 * Activity Logs API (Admin Only)
 * 
 * GET /api/logs.php - Get activity logs
 * POST /api/logs.php - Create log entry
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../utils/jwt.php';

$database = new Database();
$db = $database->getConnection();

if($db === null) {
    http_response_code(503);
    echo json_encode(array("success" => false, "message" => "Database connection failed."));
    exit();
}

// Check authorization
$headers = getallheaders();
$jwt = null;

if(isset($headers['Authorization'])) {
    $auth_header = $headers['Authorization'];
    $jwt = str_replace('Bearer ', '', $auth_header);
}

// GET logs - requires auth
if($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    if($jwt === null) {
        http_response_code(401);
        echo json_encode(array("success" => false, "message" => "Access denied. Token required."));
        exit();
    }
    
    $decoded = JWT::decode($jwt);
    if(!$decoded || $decoded['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(array("success" => false, "message" => "Admin access required."));
        exit();
    }
    
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
    
    // Create logs table if it doesn't exist
    $createTableQuery = "CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        user_name VARCHAR(255),
        action VARCHAR(255) NOT NULL,
        message TEXT,
        level VARCHAR(50) DEFAULT 'info',
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at),
        INDEX idx_user_id (user_id)
    )";
    
    try {
        $db->exec($createTableQuery);
    } catch(PDOException $e) {
        // Table might already exist
    }
    
    $query = "SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ? OFFSET ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$limit, $offset]);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode(array("success" => true, "logs" => $logs));
}

// POST - Create log entry
elseif($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if(empty($data->action)) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Action is required."));
        exit();
    }
    
    // Create logs table if it doesn't exist
    $createTableQuery = "CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        user_name VARCHAR(255),
        action VARCHAR(255) NOT NULL,
        message TEXT,
        level VARCHAR(50) DEFAULT 'info',
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    try {
        $db->exec($createTableQuery);
    } catch(PDOException $e) {
        // Table might already exist
    }
    
    $userId = $data->user_id ?? null;
    $userName = $data->user_name ?? 'System';
    $action = $data->action;
    $message = $data->message ?? $action;
    $level = $data->level ?? 'info';
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
    
    $query = "INSERT INTO activity_logs (user_id, user_name, action, message, level, ip_address)
              VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $db->prepare($query);
    if($stmt->execute([$userId, $userName, $action, $message, $level, $ipAddress])) {
        http_response_code(201);
        echo json_encode(array("success" => true, "message" => "Log created successfully."));
    } else {
        http_response_code(500);
        echo json_encode(array("success" => false, "message" => "Failed to create log."));
    }
}

else {
    http_response_code(405);
    echo json_encode(array("success" => false, "message" => "Method not allowed."));
}
?>
