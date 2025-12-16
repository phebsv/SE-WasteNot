<?php
/**
 * Users Management API (Admin Only)
 * 
 * GET /api/users.php - Get all users
 * GET /api/users.php?id=123 - Get specific user
 * PUT /api/users.php - Update user status
 * DELETE /api/users.php?id=123 - Delete user
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

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

// GET - Retrieve users
if($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    if(isset($_GET['id'])) {
        // Get specific user
        $userId = intval($_GET['id']);
        $query = "SELECT id, email, full_name, role, phone, address, status, created_at 
                  FROM users WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($user) {
            http_response_code(200);
            echo json_encode(array("success" => true, "user" => $user));
        } else {
            http_response_code(404);
            echo json_encode(array("success" => false, "message" => "User not found."));
        }
    } else {
        // Get all users
        $role = isset($_GET['role']) ? $_GET['role'] : null;
        $status = isset($_GET['status']) ? $_GET['status'] : null;
        
        $query = "SELECT id, email, full_name, role, phone, address, status, created_at 
                  FROM users WHERE 1=1";
        
        $params = [];
        if($role) {
            $query .= " AND role = ?";
            $params[] = $role;
        }
        if($status) {
            $query .= " AND status = ?";
            $params[] = $status;
        }
        
        $query .= " ORDER BY created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode(array("success" => true, "users" => $users));
    }
}

// PUT - Update user
elseif($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    
    if(empty($data->id)) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "User ID required."));
        exit();
    }
    
    $userId = intval($data->id);
    $updates = [];
    $params = [];
    
    if(isset($data->status)) {
        $updates[] = "status = ?";
        $params[] = $data->status;
    }
    if(isset($data->role)) {
        $updates[] = "role = ?";
        $params[] = $data->role;
    }
    if(isset($data->full_name)) {
        $updates[] = "full_name = ?";
        $params[] = $data->full_name;
    }
    
    if(empty($updates)) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "No fields to update."));
        exit();
    }
    
    $params[] = $userId;
    $query = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
    
    $stmt = $db->prepare($query);
    if($stmt->execute($params)) {
        http_response_code(200);
        echo json_encode(array("success" => true, "message" => "User updated successfully."));
    } else {
        http_response_code(500);
        echo json_encode(array("success" => false, "message" => "Failed to update user."));
    }
}

// DELETE - Delete user
elseif($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if(!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "User ID required."));
        exit();
    }
    
    $userId = intval($_GET['id']);
    $query = "DELETE FROM users WHERE id = ?";
    $stmt = $db->prepare($query);
    
    if($stmt->execute([$userId])) {
        http_response_code(200);
        echo json_encode(array("success" => true, "message" => "User deleted successfully."));
    } else {
        http_response_code(500);
        echo json_encode(array("success" => false, "message" => "Failed to delete user."));
    }
}

else {
    http_response_code(405);
    echo json_encode(array("success" => false, "message" => "Method not allowed."));
}
?>
