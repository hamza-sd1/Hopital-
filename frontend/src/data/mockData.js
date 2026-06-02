export const stats = {
  nombre_patients: 248,
  nombre_medecins: 34,
  nombre_documents: 1260,
  nombre_consultations: 518,
}

export const chartDocuments = [
  { name: 'Analyses', total: 420 },
  { name: 'Radios', total: 280 },
  { name: 'Ordonnances', total: 310 },
  { name: 'Rapports', total: 180 },
]

export const patients = [
  { id_patient: 1, ip_patient: '20260001', cin: 'AB123456', telephone: '0612345678', groupe_sanguin: 'O+', user: { nom_complet: 'Salma Amrani' } },
  { id_patient: 2, ip_patient: '20260002', cin: 'CD987654', telephone: '0676543210', groupe_sanguin: 'A-', user: { nom_complet: 'Youssef Bennis' } },
  { id_patient: 3, ip_patient: '20260003', cin: 'EF456789', telephone: '0601020304', groupe_sanguin: 'B+', user: { nom_complet: 'Nora El Idrissi' } },
]

export const documents = [
  { id_document: 1, titre: 'Analyse sanguine', type: { nom_type: 'Analyse' }, patient: patients[0], statut: 'actif', date_upload: '2026-05-12' },
  { id_document: 2, titre: 'Radio thorax', type: { nom_type: 'Radio' }, patient: patients[1], statut: 'archive', date_upload: '2026-05-09' },
  { id_document: 3, titre: 'Ordonnance cardiologie', type: { nom_type: 'Ordonnance' }, patient: patients[2], statut: 'actif', date_upload: '2026-05-08' },
]

export const consultations = [
  { id_consultation: 1, date_consultation: '2026-05-14 10:30', diagnostic: 'Suivi post-operatoire stable', traitement: 'Repos et controle dans 15 jours', patient: patients[0], medecin: { user: { nom_complet: 'Dr. Mehdi Alaoui' } } },
  { id_consultation: 2, date_consultation: '2026-05-11 15:00', diagnostic: 'Hypertension legere', traitement: 'Adaptation du traitement', patient: patients[1], medecin: { user: { nom_complet: 'Dr. Lina Tazi' } } },
]

export const notifications = [
  { id_notification: 1, message: 'Nouveau document ajoute a votre dossier.', lu: false, date_creation: '2026-05-15' },
  { id_notification: 2, message: 'Votre consultation a ete mise a jour.', lu: true, date_creation: '2026-05-13' },
]
