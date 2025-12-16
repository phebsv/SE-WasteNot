<?php
/**
 * Registration API Endpoint
 * 
 * POST /api/register.php
 * Request body: { "email": "user@example.com", "password": "password", "full_name": "John Doe", "role": "consumer", "phone": "", "address": "" }
 * Response: { "success": true, "message": "Registration successful", "user_id": 1 }
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

if($db === null) {
    http_response_code(503);
    echo json_encode(array("success" => false, "message" => "Database connection failed."));
    exit();
}

$user = new User($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if(
    !empty($data->email) &&
    !empty($data->password) &&
    !empty($data->full_name) &&
    !empty($data->role)
) {
    
    // Validate role
    $allowed_roles = ['consumer', 'ngo', 'partner', 'admin'];
    if(!in_array($data->role, $allowed_roles)) {
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid role. Allowed roles: consumer, ngo, partner, admin"
        ));
        exit();
    }

    // Validate email format
    if(!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid email format."
        ));
        exit();
    }

    // Validate password strength (minimum 6 characters)
    if(strlen($data->password) < 6) {
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => "Password must be at least 6 characters long."
        ));
        exit();
    }
    
    $user->email = $data->email;
    
    // Check if email already exists
    if($user->emailExists()) {
        http_response_code(409);
        echo json_encode(array(
            "success" => false,
            "message" => "Email already registered."
        ));
        exit();
    }
    
    // Set user properties
    $user->password = $data->password;
    $user->full_name = $data->full_name;
    $user->role = $data->role;
    $user->phone = $data->phone ?? "";
    $user->address = $data->address ?? "";
    
    // Create the user
    if($user->create()) {
        http_response_code(201);
        echo json_encode(array(
            "success" => true,
            "message" => "Registration successful.",
            "user_id" => $user->id
        ));
    } else {
        http_response_code(503);
        echo json_encode(array(
            "success" => false,
            "message" => "Unable to register user."
        ));
    }
    
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Incomplete data. Required: email, password, full_name, role"
    ));
}
?>
