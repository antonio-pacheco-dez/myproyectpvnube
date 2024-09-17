<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

// Configuración de conexión
$serverName = "localhost";
$connectionOptions = array(
    "Database" => "pvnube_database",
    "Uid" => "adminpvnube",
    "PWD" => "Pv1234567"
);

// Conectar a SQL Server
$conn = sqlsrv_connect($serverName, $connectionOptions);

if ($conn === false) {
    die(print_r(sqlsrv_errors(), true));
}

// Consulta de datos
$sql = "SELECT * FROM tu_tabla";
$stmt = sqlsrv_query($conn, $sql);

if ($stmt === false) {
    die(print_r(sqlsrv_errors(), true));
}

$data = array();
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $data[] = $row;
}

        // Enviar datos como JSON
echo "data: " . json_encode($data) . "\n\n";

// Cerrar conexión
sqlsrv_close($conn);
?>
