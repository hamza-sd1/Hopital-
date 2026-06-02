<?php

use App\Http\Controllers\Api\ActiviteController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\FactureController;
use App\Http\Controllers\Api\MedecinController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\TypeDocumentController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats'])->middleware('role:admin,medecin,patient');

    Route::apiResource('users', UserController::class)->middleware('role:admin');
    Route::apiResource('services', ServiceController::class)->middleware('role:admin,facturation');
    Route::get('/factures', [FactureController::class, 'index'])->middleware('role:admin,facturation,patient');
    Route::get('/factures/{facture}', [FactureController::class, 'show'])->middleware('role:admin,facturation,patient');
    Route::post('/factures', [FactureController::class, 'store'])->middleware('role:admin,facturation');
    Route::put('/factures/{facture}', [FactureController::class, 'update'])->middleware('role:admin,facturation');
    Route::patch('/factures/{facture}', [FactureController::class, 'update'])->middleware('role:admin,facturation');
    Route::delete('/factures/{facture}', [FactureController::class, 'destroy'])->middleware('role:admin,facturation');
    Route::post('/factures/{facture}/rappel', [FactureController::class, 'sendReminder'])->middleware('role:admin,facturation');
    Route::get('/messages', [MessageController::class, 'index'])->middleware('role:admin,facturation,patient,medecin');
    Route::post('/messages', [MessageController::class, 'store'])->middleware('role:admin,facturation');
    Route::patch('/messages/{message}/lu', [MessageController::class, 'markAsRead'])->middleware('role:admin,facturation,patient,medecin');

    Route::get('/patients', [PatientController::class, 'index'])->middleware('role:admin,medecin,facturation');
    Route::get('/patients/{patient}', [PatientController::class, 'show'])->middleware('role:admin,medecin,facturation');
    Route::post('/patients', [PatientController::class, 'store'])->middleware('role:admin');
    Route::put('/patients/{patient}', [PatientController::class, 'update'])->middleware('role:admin');
    Route::patch('/patients/{patient}', [PatientController::class, 'update'])->middleware('role:admin');
    Route::delete('/patients/{patient}', [PatientController::class, 'destroy'])->middleware('role:admin');

    Route::apiResource('medecins', MedecinController::class)->middleware('role:admin');

    Route::get('/types-documents', [TypeDocumentController::class, 'index'])->middleware('role:admin,medecin');
    Route::get('/types-documents/{typeDocument}', [TypeDocumentController::class, 'show'])->middleware('role:admin,medecin');
    Route::post('/types-documents', [TypeDocumentController::class, 'store'])->middleware('role:admin');
    Route::put('/types-documents/{typeDocument}', [TypeDocumentController::class, 'update'])->middleware('role:admin');
    Route::patch('/types-documents/{typeDocument}', [TypeDocumentController::class, 'update'])->middleware('role:admin');
    Route::delete('/types-documents/{typeDocument}', [TypeDocumentController::class, 'destroy'])->middleware('role:admin');

    Route::get('/consultations', [ConsultationController::class, 'index'])->middleware('role:admin,medecin,patient,facturation');
    Route::get('/consultations/{consultation}', [ConsultationController::class, 'show'])->middleware('role:admin,medecin,patient,facturation');
    Route::post('/consultations', [ConsultationController::class, 'store'])->middleware('role:admin,medecin');
    Route::put('/consultations/{consultation}', [ConsultationController::class, 'update'])->middleware('role:admin,medecin');
    Route::patch('/consultations/{consultation}', [ConsultationController::class, 'update'])->middleware('role:admin,medecin');
    Route::delete('/consultations/{consultation}', [ConsultationController::class, 'destroy'])->middleware('role:admin,medecin');

    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])
        ->middleware('role:admin,medecin,patient');
    Route::get('/documents/{document}/preview', [DocumentController::class, 'preview'])
        ->middleware('role:admin,medecin,patient');
    Route::get('/documents', [DocumentController::class, 'index'])->middleware('role:admin,medecin,patient');
    Route::get('/documents/{document}', [DocumentController::class, 'show'])->middleware('role:admin,medecin,patient');
    Route::post('/documents', [DocumentController::class, 'store'])->middleware('role:admin,medecin');
    Route::put('/documents/{document}', [DocumentController::class, 'update'])->middleware('role:admin,medecin');
    Route::patch('/documents/{document}', [DocumentController::class, 'update'])->middleware('role:admin,medecin');
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->middleware('role:admin,medecin');

    Route::patch('/notifications/{notification}/lu', [NotificationController::class, 'markAsRead']);
    Route::apiResource('notifications', NotificationController::class)->only(['index', 'store', 'show', 'destroy']);

    Route::apiResource('activites', ActiviteController::class)->only(['index', 'store'])->middleware('role:admin');
});
