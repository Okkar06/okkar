#!/usr/bin/env powershell
# Smoke test driver for okkar_profolio (client + server)
# Run from repo root: powershell -ExecutionPolicy Bypass -File .claude\skills\run-okkar-profolio\smoke.ps1
# Set DATABASE_URL env var for a real DB; omit to use a stub (contact POST returns 500, other checks pass).

param(
  [int]$ClientPort = 5173,
  [int]$ApiPort    = 4000
)

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..\..')

function Wait-Port {
  param([int]$Port, [string]$Path = '/', [int]$TimeoutSec = 20)
  $deadline = [datetime]::Now.AddSeconds($TimeoutSec)
  while ([datetime]::Now -lt $deadline) {
    try {
      $null = Invoke-WebRequest -Uri "http://localhost:$Port$Path" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
      return
    } catch {
      # 4xx is still a live server — only network errors mean not ready
      if ($_.Exception.Response) { return }
      Start-Sleep -Milliseconds 500
    }
  }
  throw "Port $Port did not open within ${TimeoutSec}s"
}

$clientProc = $null
$apiProc    = $null

try {
  # --- Start client dev server ---
  Write-Host "`n[1/3] Starting Vite dev server on :$ClientPort ..."
  $clientProc = Start-Process -FilePath 'node' `
    -ArgumentList (Join-Path $root 'client\node_modules\.bin\vite'), '--port', $ClientPort `
    -WorkingDirectory (Join-Path $root 'client') `
    -PassThru -WindowStyle Hidden
  Wait-Port $ClientPort
  Write-Host "      OK - client is up (pid $($clientProc.Id))"

  # --- Start API server ---
  Write-Host "[2/3] Starting API server on :$ApiPort ..."
  $dbUrl  = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { 'postgresql://fake:fake@localhost:5432/fake' }
  $apiEnv = [System.Environment]::GetEnvironmentVariables()
  $apiEnv['PORT']          = "$ApiPort"
  $apiEnv['DATABASE_URL']  = $dbUrl
  $apiEnv['CLIENT_ORIGIN'] = "http://localhost:$ClientPort"

  $psi = [System.Diagnostics.ProcessStartInfo]::new()
  $psi.FileName  = 'node'
  $psi.Arguments = 'src/server.js'
  $psi.WorkingDirectory = (Join-Path $root 'server')
  $psi.UseShellExecute = $false
  $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
  foreach ($kv in $apiEnv.GetEnumerator()) { $psi.Environment[$kv.Key] = $kv.Value }

  $apiProc = [System.Diagnostics.Process]::Start($psi)
  Wait-Port $ApiPort
  Write-Host "      OK - API is up (pid $($apiProc.Id))"

  # --- Smoke checks ---
  Write-Host "[3/3] Running smoke checks ..."
  $pass = 0; $fail = 0

  function Check([string]$Label, [scriptblock]$Test) {
    try {
      & $Test
      Write-Host "  PASS  $Label"
      $script:pass++
    } catch {
      Write-Host "  FAIL  $Label  ->  $_"
      $script:fail++
    }
  }

  Check "GET /             -> 200 with HTML" {
    $r = Invoke-WebRequest "http://localhost:$ClientPort/" -UseBasicParsing
    if ($r.StatusCode -ne 200) { throw "status $($r.StatusCode)" }
    if ($r.Content -notmatch '<!doctype html') { throw 'expected HTML' }
  }

  Check "GET /api/health   -> {status: ok}" {
    $r = Invoke-WebRequest "http://localhost:$ApiPort/api/health" -UseBasicParsing
    $j = $r.Content | ConvertFrom-Json
    if ($j.status -ne 'ok') { throw "body: $($r.Content)" }
  }

  Check "POST /api/contacts (empty body) -> 400" {
    $code = 0
    try {
      Invoke-WebRequest "http://localhost:$ApiPort/api/contacts" `
        -Method POST -ContentType 'application/json' -Body '{}' -UseBasicParsing | Out-Null
    } catch {
      $code = $_.Exception.Response.StatusCode.value__
    }
    if ($code -ne 400) { throw "expected 400, got $code" }
  }

  Check "POST /api/contacts (bad email) -> 400" {
    $code = 0
    try {
      $b = '{"name":"Test","email":"notanemail","message":"Hello"}'
      Invoke-WebRequest "http://localhost:$ApiPort/api/contacts" `
        -Method POST -ContentType 'application/json' -Body $b -UseBasicParsing | Out-Null
    } catch {
      $code = $_.Exception.Response.StatusCode.value__
    }
    if ($code -ne 400) { throw "expected 400, got $code" }
  }

  Write-Host "`nResults: $pass passed, $fail failed"
  if ($fail -gt 0) { exit 1 }

} finally {
  if ($clientProc -and -not $clientProc.HasExited) { $clientProc.Kill(); Write-Host "Stopped client (pid $($clientProc.Id))" }
  if ($apiProc    -and -not $apiProc.HasExited)    { $apiProc.Kill();    Write-Host "Stopped API    (pid $($apiProc.Id))" }
}
