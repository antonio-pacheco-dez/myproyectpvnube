<?php
// PHP Data Objects(PDO) Sample Code:
try {
    $conn = new PDO("sqlsrv:server = tcp:pvnube-server.database.windows.net,1433; Database = pvnube_database", "adminpvnube", "Pv1234567");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
catch (PDOException $e) {
    print("Error connecting to SQL Server.");
    die(print_r($e));
}

// SQL Server Extension Sample Code:
$connectionInfo = array("UID" => "adminpvnube", "pwd" => "{your_password_here}", "Database" => "pvnube_database", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:pvnube-server.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);
?>