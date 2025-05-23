<?php
header('Content-Type: application/json');

// URLs das APIs das duas pools
$api_urls = [
    "pool_xmr_pt" => [
        "pool_stats" => "https://pool.xmr.pt/api/pool/stats",
        "network_stats" => "https://pool.xmr.pt/api/network/stats"
    ],
    "support_xmr" => [
        "pool_stats" => "https://supportxmr.com/api/pool/stats",
        "network_stats" => "https://supportxmr.com/api/network/stats"
    ]
];

$results = [];

foreach ($api_urls as $pool => $endpoints) {
    foreach ($endpoints as $key => $url) {
        $response = file_get_contents($url);
        if ($response === FALSE) {
            $results[$pool][$key] = "Erro ao buscar os dados da API!";
        } else {
            $results[$pool][$key] = json_decode($response, true);
        }
    }
}

echo json_encode($results, JSON_PRETTY_PRINT);
?>
