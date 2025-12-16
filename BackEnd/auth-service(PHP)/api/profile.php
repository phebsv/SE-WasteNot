<?php
/**
 * User Profile API Endpoint
 * 
 * GET /api/profile.php - Get user profile
 * PUT /api/profile.php - Update user profile
 * Requires Authorization header with JWT token
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, PUT");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../models/User.php';
require_once '../utils/jwt.php';

$database = new Database();
$db = $database->getConnection();

if($db === null) {
    http_response_code(503);
    echo json_encode(array("success" => false, "message" => "Database connection failed."));
    exit();
}

// Check authorization header
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

// Verify token
$decoded = JWT::decode($jwt);

if(!$decoded) {
    http_response_code(401);
    echo json_encode(array("success" => false, "message" => "Invalid or expired token."));
    exit();
}

$user = new User($db);
$user->id = $decoded['user_id'];

// GET - Retrieve user profile
if($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    if($user->readOne()) {
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "user" => array(
                "id" => $user->id,
                "email" => $user->email,
                "full_name" => $user->full_name,
                "role" => $user->role,
                "phone" => $user->phone,
                "address" => $user->address,
                "status" => $user->status,
                "created_at" => $user->created_at
            )
        ));
    } else {
        http_response_code(404);
        echo json_encode(array("success" => false, "message" => "User not found."));
    }
}

// PUT - Update user profile
elseif($_SERVER['REQUEST_METHOD'] === 'PUT') {
    
    $data = json_decode(file_get_contents("php://input"));
    
    // Get current user data first
    if(!$user->readOne()) {
        http_response_code(404);
        echo json_encode(array("success" => false, "message" => "User not found."));
        exit();
    }
    
    // Update only provided fields
    $user->full_name = $data->full_name ?? $user->full_name;
    $user->phone = $data->phone ?? $user->phone;
    $user->address = $data->address ?? $user->address;
    
    if($user->update()) {
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Profile updated successfully."
        ));
    } else {
        http_response_code(503);
        echo json_encode(array("success" => false, "message" => "Unable to update profile."));
    }
}

else {
    http_response_code(405);
    echo json_encode(array("success" => false, "message" => "Method not allowed."));
}
?>
