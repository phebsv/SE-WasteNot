<?php
/**
 * JWT (JSON Web Token) Utility Class
 * 
 * Simple JWT implementation for authentication
 * In production, consider using a library like firebase/php-jwt
 */

class JWT {
    private static $secret_key = "WasteNot_Secret_Key_2025_Change_In_Production";
    private static $issuer = "wastenot.com";
    private static $expiration = 86400; // 24 hours

    /**
     * Encode data into JWT token
     * @param int $user_id User ID
     * @param string $email User email
     * @param string $role User role
     * @return string JWT token
     */
    public static function encode($user_id, $email, $role) {
        $issued_at = time();
        $expiration = $issued_at + self::$expiration;

        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        
        $payload = json_encode([
            'iss' => self::$issuer,
            'iat' => $issued_at,
            'exp' => $expiration,
            'user_id' => $user_id,
            'email' => $email,
            'role' => $role
        ]);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret_key, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Decode and verify JWT token
     * @param string $jwt JWT token
     * @return array|false Decoded data or false if invalid
     */
    public static function decode($jwt) {
        $tokenParts = explode('.', $jwt);

        if(count($tokenParts) !== 3) {
            return false;
        }

        $header = base64_decode($tokenParts[0]);
        $payload = base64_decode($tokenParts[1]);
        $signatureProvided = $tokenParts[2];

        // Verify signature
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret_key, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        if($base64UrlSignature !== $signatureProvided) {
            return false;
        }

        $payloadData = json_decode($payload, true);

        // Check if token expired
        if(isset($payloadData['exp']) && $payloadData['exp'] < time()) {
            return false;
        }

        return $payloadData;
    }

    /**
     * Base64 URL encode
     * @param string $text
     * @return string
     */
    private static function base64UrlEncode($text) {
        return str_replace(
            ['+', '/', '='],
            ['-', '_', ''],
            base64_encode($text)
        );
    }
}
?>
