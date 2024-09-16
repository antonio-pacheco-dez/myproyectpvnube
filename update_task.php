<?php
include 'db_connection.php'; // Incluye tu archivo de conexión

header('Content-Type: application/json');

try {
    $id = $_POST['id'];
    $start = $_POST['start'];
    $end = $_POST['end'];
    $progress = $_POST['progress'];

    $sql = "
        UPDATE POP_WSTURNO
        SET INICIO = :start, FIN = :end, PROGRESS = :progress
        WHERE ID = :id
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':start', $start);
    $stmt->bindParam(':end', $end);
    $stmt->bindParam(':progress', $progress);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar la tarea.']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
