<?php
// Приём заявок с сайта. Адрес получателя лежит вне public_html: ../form-config.php
// return ['to' => 'почта@пример.ru', 'from' => 'site@das-stroi.ru'];
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function out($code, $data) { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
function field($k, $max) { $v = isset($_POST[$k]) ? trim((string)$_POST[$k]) : ''; $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v); return mb_substr($v, 0, $max); }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(405, ['ok' => false, 'error' => 'Метод не поддерживается']);

$cfgFile = dirname(__DIR__) . '/form-config.php';
$cfg = is_file($cfgFile) ? require $cfgFile : [];
$to = isset($cfg['to']) ? $cfg['to'] : '';
$from = isset($cfg['from']) ? $cfg['from'] : 'site@das-stroi.ru';
$logFile = dirname(__DIR__) . '/form-leads.log';

// ловушка для ботов: поле скрыто от людей
if (field('website', 200) !== '') out(200, ['ok' => true]);

// не чаще 3 заявок за 10 минут с одного адреса
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0';
$rl = sys_get_temp_dir() . '/das_rl_' . md5($ip);
$now = time();
$hits = is_file($rl) ? array_filter(array_map('intval', explode(',', (string)file_get_contents($rl))), function ($t) use ($now) { return $now - $t < 600; }) : [];
if (count($hits) >= 3) out(429, ['ok' => false, 'error' => 'Слишком много заявок подряд. Позвоните нам: +7 (342) 202-75-55']);

$d = [
  'Имя' => field('name', 80),
  'Телефон' => field('phone', 24),
  'Услуга' => field('service', 80),
  'Объект' => field('object', 80),
  'Связаться через' => field('channel', 20),
  'Комментарий' => field('message', 2000),
  'Страница' => field('page', 300),
  'UTM' => field('utm', 300),
];
$digits = preg_replace('/\D/', '', $d['Телефон']);
if (strlen($digits) < 10 || strlen($digits) > 12) out(422, ['ok' => false, 'error' => 'Проверьте номер телефона']);
if (field('agree', 2) !== '1') out(422, ['ok' => false, 'error' => 'Нужно согласие на обработку данных']);

$hits[] = $now;
@file_put_contents($rl, implode(',', $hits), LOCK_EX);

$lines = [];
foreach ($d as $k => $v) if ($v !== '') $lines[] = $k . ': ' . $v;
$body = implode("\n", $lines) . "\n\nВремя: " . date('d.m.Y H:i') . "\nIP: " . $ip;

// журнал на случай, если почта не дошла
@file_put_contents($logFile, "=== " . date('c') . "\n" . $body . "\n\n", FILE_APPEND | LOCK_EX);

if ($to === '') out(500, ['ok' => false, 'error' => 'Форма ещё не настроена. Позвоните нам: +7 (342) 202-75-55']);

$subject = '=?UTF-8?B?' . base64_encode('Заявка с сайта: ' . ($d['Услуга'] !== '' ? $d['Услуга'] : 'без услуги')) . '?=';
$headers = "From: ДАС-СТРОЙ <" . $from . ">\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: 8bit\r\nMIME-Version: 1.0";
$sent = @mail($to, $subject, $body, $headers, '-f' . $from);

if (!$sent) out(502, ['ok' => false, 'error' => 'Не удалось отправить. Позвоните нам: +7 (342) 202-75-55']);
out(200, ['ok' => true]);
