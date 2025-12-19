<?php
/**
 * Login API Endpoint
 * 
 * POST /api/login.php
 * Request body: { "email": "user@example.com", "password": "password", "role": "consumer" }
 * Response: { "success": true, "token": "jwt_token", "user": {...} }
 */

header("Content-Type: application/json; charset=UTF-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../models/User.php';
require_once '../utils/jwt.php';

function hasColumn(PDO $db, string $table, string $column): bool {
    try {
        $stmt = $db->prepare("SHOW COLUMNS FROM `{$table}` LIKE :col");
        $stmt->bindParam(':col', $column);
        $stmt->execute();
        return (bool)$stmt->fetch();
    } catch (Throwable $e) {
        return false;
    }
}

function readOptionalFields(PDO $db, string $table, $id, array $columns): array {
    $present = [];
    foreach ($columns as $col) {
        if (hasColumn($db, $table, $col)) {
            $present[] = $col;
        }
    }
    if (count($present) === 0) return [];
    $select = implode(', ', array_map(fn($c) => "`{$c}`", $present));
    $stmt = $db->prepare("SELECT {$select} FROM `{$table}` WHERE id = :id LIMIT 1");
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? $row : [];
}

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

if(!empty($data->email) && !empty($data->password)) {
    
    $user->email = $data->email;
    
    // Check if email exists
    if($user->emailExists()) {
        
        // Verify password
        if(password_verify($data->password, $user->password)) {
            
            // Check if user is active
            if($user->status !== 'active') {
                http_response_code(403);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Account is not active. Please contact support."
                ));
                exit();
            }

            // Verify role if provided
            if(!empty($data->role) && $user->role !== $data->role) {
                http_response_code(401);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Invalid credentials for this role."
                ));
                exit();
            }
            
            // Generate JWT token
            $jwt = JWT::encode($user->id, $user->email, $user->role);

            // Optional business/store name if present in schema
            $optional = readOptionalFields($db, 'users', $user->id, ['business_name', 'store_name', 'organization_name']);
            $businessName = $optional['business_name'] ?? $optional['store_name'] ?? $optional['organization_name'] ?? null;
            
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Login successful.",
                "token" => $jwt,
                "user" => array(
                    "id" => $user->id,
                    "email" => $user->email,
                    "full_name" => $user->full_name,
                    "role" => $user->role,
                    "phone" => $user->phone,
                    "address" => $user->address,
                    "business_name" => $businessName
                )
            ));
            
        } else {
            http_response_code(401);
            echo json_encode(array(
                "success" => false,
                "message" => "Invalid email or password."
            ));
        }
        
    } else {
        http_response_code(401);
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid email or password."
        ));
    }
    
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Email and password are required."
    ));
}
?>
