<?php
// PHP Data Objects(PDO) Sample Code:
try {
    // Conexión usando PDO
    $conn = new PDO("sqlsrv:server = tcp:pvnube-server.database.windows.net,1433; Database = pvnube_database", "adminpvnube", "Pv1234567");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Imprime el error en caso de fallo en la conexión
    print("Error connecting to SQL Server.");
    die(print_r($e));
}
?>