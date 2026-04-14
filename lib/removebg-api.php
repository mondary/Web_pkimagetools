<?php
declare(strict_types=1);

// This endpoint returns raw PNG bytes. Any PHP warning/notice would corrupt the output,
// so we disable error display and clear output buffers early.
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(0);
while (ob_get_level() > 0) {
  ob_end_clean();
}

function loadConfig(): array {
  $candidates = [
    __DIR__ . '/config.php',
    // When deployed under repo root `/lib/`, secrets can live next to the site root.
    dirname(__DIR__) . '/secrets/removebg.php',
    // OVH layout: secrets folder next to `www/` (FTP root), while app lives in `www/.../pkremovebg`.
    // Example: .../www/pk/pkremovebg/lib -> go up 4 levels to FTP root -> /secrets/removebg.php
    dirname(__DIR__, 4) . '/secrets/removebg.php',
  ];
  foreach ($candidates as $configPath) {
    if (is_file($configPath)) {
      $cfg = require $configPath;
      if (is_array($cfg)) return $cfg;
    }
  }
  return [];
}

function jsonError(int $status, string $message): void {
  while (ob_get_level() > 0) {
    ob_end_clean();
  }
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  jsonError(405, 'Use POST');
}

$cfg = loadConfig();
$apiKey = $cfg['api_key'] ?? $cfg['REMOVEBG_API_KEY'] ?? getenv('REMOVEBG_API_KEY') ?: '';
if (!is_string($apiKey) || $apiKey === '') {
  jsonError(500, 'Server missing remove.bg api key (set secrets/removebg.php, src/backend/config.php, or REMOVEBG_API_KEY env var).');
}

if (!isset($_FILES['image']) || !is_array($_FILES['image'])) {
  jsonError(400, 'Missing file field "image".');
}

$file = $_FILES['image'];
if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
  jsonError(400, 'Upload failed.');
}

$maxBytes = 15 * 1024 * 1024;
$size = $file['size'] ?? null;
if (is_int($size) && $size > $maxBytes) {
  jsonError(413, 'File too large.');
}

$mime = $file['type'] ?? '';
if (!is_string($mime) || $mime === '' || strncmp($mime, 'image/', 6) !== 0) {
  jsonError(400, 'Invalid file type.');
}

$tmpPath = $file['tmp_name'] ?? '';
if (!is_string($tmpPath) || $tmpPath === '' || !is_file($tmpPath)) {
  jsonError(400, 'Invalid upload temp file.');
}

$ch = curl_init('https://api.remove.bg/v1.0/removebg');
if ($ch === false) {
  jsonError(500, 'Failed to init curl.');
}

$postFields = [
  // remove.bg expects image_file or image_url; we use image_file.
  'image_file' => new CURLFile($tmpPath, $mime, $file['name'] ?? 'image'),
  // auto detects subject; you can force 'person' or 'product' if you want.
  // 'type' => 'auto',
  // You can set size to 'preview' for cheaper / faster, but user wants quality.
  // 'size' => 'auto',
  'format' => 'png',
];

curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    'X-Api-Key: ' . $apiKey,
  ],
  CURLOPT_POSTFIELDS => $postFields,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HEADER => true,
  CURLOPT_TIMEOUT => 90,
]);

$response = curl_exec($ch);
if ($response === false) {
  $err = curl_error($ch);
  curl_close($ch);
  jsonError(502, 'remove.bg request failed: ' . $err);
}

$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

$rawHeaders = substr($response, 0, (int)$headerSize);
$body = substr($response, (int)$headerSize);

if ($status < 200 || $status >= 300) {
  // remove.bg usually returns JSON error bodies for non-2xx.
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo $body !== '' ? $body : json_encode(['error' => 'remove.bg error'], JSON_UNESCAPED_UNICODE);
  exit;
}

header('Content-Type: image/png');
header('Cache-Control: no-store');
echo $body;
