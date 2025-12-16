<?php
/**
 * User Model
 * 
 * Handles all user-related database operations
 */

class User {
    private $conn;
    private $table_name = "users";

    // User properties
    public $id;
    public $email;
    public $password;
    public $full_name;
    public $role; // consumer, ngo, partner, admin
    public $phone;
    public $address;
    public $status; // active, suspended, pending
    public $created_at;
    public $updated_at;

    /**
     * Constructor
     * @param PDO $db Database connection
     */
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Register a new user
     * @return bool Success status
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET email = :email,
                    password = :password,
                    full_name = :full_name,
                    role = :role,
                    phone = :phone,
                    address = :address,
                    status = 'active',
                    created_at = NOW()";

        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->full_name = htmlspecialchars(strip_tags($this->full_name));
        $this->role = htmlspecialchars(strip_tags($this->role));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->address = htmlspecialchars(strip_tags($this->address));

        // Hash password
        $hashed_password = password_hash($this->password, PASSWORD_BCRYPT);

        // Bind values
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $hashed_password);
        $stmt->bindParam(":full_name", $this->full_name);
        $stmt->bindParam(":role", $this->role);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":address", $this->address);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    /**
     * Check if email already exists
     * @return bool
     */
    public function emailExists() {
        $query = "SELECT id, email, password, full_name, role, phone, address, status
                FROM " . $this->table_name . "
                WHERE email = :email
                LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->id = $row['id'];
            $this->full_name = $row['full_name'];
            $this->role = $row['role'];
            $this->phone = $row['phone'];
            $this->address = $row['address'];
            $this->status = $row['status'];
            $this->password = $row['password'];
            return true;
        }

        return false;
    }

    /**
     * Get user by ID
     * @return bool
     */
    public function readOne() {
        $query = "SELECT id, email, full_name, role, phone, address, status, created_at
                FROM " . $this->table_name . "
                WHERE id = :id
                LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->email = $row['email'];
            $this->full_name = $row['full_name'];
            $this->role = $row['role'];
            $this->phone = $row['phone'];
            $this->address = $row['address'];
            $this->status = $row['status'];
            $this->created_at = $row['created_at'];
            return true;
        }

        return false;
    }

    /**
     * Update user information
     * @return bool
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET full_name = :full_name,
                    phone = :phone,
                    address = :address,
                    updated_at = NOW()
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->full_name = htmlspecialchars(strip_tags($this->full_name));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->address = htmlspecialchars(strip_tags($this->address));

        // Bind
        $stmt->bindParam(":full_name", $this->full_name);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    /**
     * Update user password
     * @return bool
     */
    public function updatePassword() {
        $query = "UPDATE " . $this->table_name . "
                SET password = :password,
                    updated_at = NOW()
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Hash password
        $hashed_password = password_hash($this->password, PASSWORD_BCRYPT);

        $stmt->bindParam(":password", $hashed_password);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    /**
     * Get all users by role
     * @param string $role User role filter
     * @return array
     */
    public function getAllByRole($role) {
        $query = "SELECT id, email, full_name, role, phone, address, status, created_at
                FROM " . $this->table_name . "
                WHERE role = :role
                ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":role", $role);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
