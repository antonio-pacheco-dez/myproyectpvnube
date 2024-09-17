<?php
header('Content-Type: application/json');
include 'db_connection.php'; // Conexión a la base de datos

try {
    // Consulta SQL
    $sql = "
    SELECT
        ws.NOMBRE AS NOMBRE_AREA,
        wst.DIASEM AS DIA,
        CONVERT(VARCHAR(5), wst.INICIO, 108) AS INICIO,
        CONVERT(VARCHAR(5), wst.FIN, 108) AS FIN,
        wst.TIPO_RESP,
        COALESCE(wst.CVE_RESP, wst.CVE_DEP) AS NO_RESPONSABLE,
        CASE
            WHEN wst.CVE_RESP IS NOT NULL THEN v.NOMBRE
            WHEN wst.CVE_DEP IS NOT NULL THEN d.NOMBRE
            ELSE NULL
        END AS RESPONSABLE_NOMBRE
    FROM [dbo].[POP_WSTURNO] AS wst
    INNER JOIN [dbo].[POP_WS] AS ws
        ON wst.WS_ID = ws.ID
    LEFT JOIN [dbo].[VEND20] AS v
        ON wst.CVE_RESP = v.CVE_VEND
    LEFT JOIN [dbo].[DEP] AS d
        ON wst.CVE_DEP = d.CVE_DEP
    WHERE wst.CVE_RESP IS NOT NULL OR wst.CVE_DEP IS NOT NULL
    ORDER BY ws.NOMBRE, wst.DIASEM, wst.INICIO;
    ";

    // Preparar y ejecutar la consulta
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Obtener el año y el mes actual
    $current_year = date('Y');
    $current_month = date('m');

    // Formatear los datos para el Gantt
    $formatted_tasks = [];
    foreach ($tasks as $task) {
        // Asegurar que el día siempre tenga dos dígitos
        $day_of_week = str_pad($task['DIA'], 2, '0', STR_PAD_LEFT);
        
        // Construir la fecha y hora en formato ISO 8601
        $start = $current_year . '-' . $current_month . '-' . $day_of_week . ' ' . $task['INICIO'];
        $end = $current_year . '-' . $current_month . '-' . $day_of_week . ' ' . $task['FIN'];

        // Formatear el nombre del responsable
        $responsible_name = $task['RESPONSABLE_NOMBRE'] ? $task['RESPONSABLE_NOMBRE'] : 'No Disponible';

        // Añadir la tarea formateada
        $formatted_tasks[] = [
            'NOMBRE_AREA' => $task['NOMBRE_AREA'], // Asegúrate de usar 'NOMBRE_AREA'
            'INICIO' => $start,
            'FIN' => $end,
            'NO_RESPONSABLE' => $task['NO_RESPONSABLE'], // Si es necesario
            'RESPONSABLE_NOMBRE' => $responsible_name
        ];
    }

    // Enviar los datos en formato JSON
    echo json_encode($formatted_tasks); 
} catch (PDOException $e) {
    // Enviar error en formato JSON
    echo json_encode(['error' => $e->getMessage()]);
}
?>
