<?php
/**
 * User Profile API Endpoint
 * 
 * GET /api/profile.php - Get user profile
 * PUT /api/profile.php - Update user profile
 * Requires Authorization header with JWT token
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

// Check authorization header
$jwt = null;

// Some Apache/PHP setups expose the Authorization header differently.
$headers = function_exists('getallheaders') ? getallheaders() : [];
$authHeader = null;

// Case-insensitive lookup in getallheaders()
if (is_array($headers)) {
    foreach ($headers as $k => $v) {
        if (strtolower((string)$k) === 'authorization') {
            $authHeader = $v;
            break;
        }
    }
}

// Fallbacks
if ($authHeader === null) {
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
}

if ($authHeader !== null) {
    $jwt = preg_replace('/^Bearer\s+/i', '', (string)$authHeader);
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
        // Fetch optional fields that may exist in some environments (e.g., partner store name).
        $optional = readOptionalFields($db, 'users', $user->id, ['business_name', 'store_name', 'organization_name']);
        $businessName = $optional['business_name'] ?? $optional['store_name'] ?? $optional['organization_name'] ?? null;

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
                "business_name" => $businessName,
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
    
    $baseOk = $user->update();

    // Best-effort update of optional "store/business name" field if the column exists.
    $optionalOk = true;
    $incomingBusinessName = null;
    if (isset($data->business_name)) {
        $incomingBusinessName = $data->business_name;
    } elseif (isset($data->store_name)) {
        $incomingBusinessName = $data->store_name;
    } elseif (isset($data->organization_name)) {
        $incomingBusinessName = $data->organization_name;
    }

    if ($incomingBusinessName !== null) {
        $incomingBusinessName = htmlspecialchars(strip_tags((string)$incomingBusinessName));
        $targetCol = null;
        if (hasColumn($db, 'users', 'business_name')) {
            $targetCol = 'business_name';
        } elseif (hasColumn($db, 'users', 'store_name')) {
            $targetCol = 'store_name';
        } elseif (hasColumn($db, 'users', 'organization_name')) {
            $targetCol = 'organization_name';
        }

        if ($targetCol !== null) {
            try {
                $stmt = $db->prepare("UPDATE `users` SET `{$targetCol}` = :v, updated_at = NOW() WHERE id = :id");
                $stmt->bindParam(':v', $incomingBusinessName);
                $stmt->bindParam(':id', $user->id);
                $optionalOk = $stmt->execute();
            } catch (Throwable $e) {
                $optionalOk = false;
            }
        }
    }

    if($baseOk && $optionalOk) {
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
