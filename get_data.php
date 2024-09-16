<?php
header('Content-Type: application/json');
include 'bd_connection.php';

try {
    $sql = "
        SELECT
            d.NOMBRE AS department_name,
            w.ID AS ws_id,
            t.DIASEM AS day_of_week,
            CONVERT(VARCHAR(8), t.INICIO, 108) AS start_time, -- Convertir a formato HH:MM:SS
            CONVERT(VARCHAR(8), t.FIN, 108) AS end_time -- Convertir a formato HH:MM:SS
        FROM POP_WSTURNO t
        JOIN POP_WS w ON t.WS_ID = w.ID
        JOIN DEP d ON t.CVE_DEP = d.CVE_DEP
        ORDER BY d.NOMBRE, t.DIASEM, t.INICIO
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted_tasks = array_map(function($task) {
        return [
            'id' => $task['ws_id'] . '-' . $task['day_of_week'],
            'name' => $task['department_name'],
            'start' => '2024-09-' . $task['day_of_week'] . 'T' . $task['start_time'], // Ajustar la fecha según sea necesario
            'end' => '2024-09-' . $task['day_of_week'] . 'T' . $task['end_time'], // Ajustar la fecha según sea necesario
            'progress' => 0
        ];
    }, $tasks);

    echo json_encode($formatted_tasks);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
