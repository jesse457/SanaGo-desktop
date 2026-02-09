import { createRxDatabase, RxDatabase, RxCollection, addRxPlugin } from 'rxdb/plugins/core';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration-schema';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

import {
  userSchema,
  patientSchema,
  recentPatientSchema, // Added this
  medicationSchema,
  appointmentSchema,
  bedSchema,
  admissionSchema,
  labDefinitionSchema,
  departmentSchema,
  supplySchema,
  dashboardStatsSchema
} from './schema';

// Add dev mode plugin in development
if (process.env.NODE_ENV === 'development') {
  addRxPlugin(RxDBDevModePlugin);
}

addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);

// Database types
export type ClinicCollections = {
  users: RxCollection<any>;
  patients: RxCollection<any>;
  recent_patients: RxCollection<any>; // Added this
  medications: RxCollection<any>;
  appointments: RxCollection<any>;
  beds: RxCollection<any>;
  admissions: RxCollection<any>;
  lab_definitions: RxCollection<any>;
  departments: RxCollection<any>;
  supplies: RxCollection<any>;
  dashboard_stats: RxCollection<any>;
};

export type ClinicDatabase = RxDatabase<ClinicCollections>;

// Collection configuration by role
export const roleBasedCollections = {
  // Added 'recent_patients' and 'admissions' to admin so the Overview doesn't crash
  admin: ['users', 'departments', 'supplies', 'dashboard_stats', 'beds', 'recent_patients', 'admissions'],
  receptionist: ['patients', 'recent_patients', 'appointments', 'admissions', 'beds', 'dashboard_stats'],
  doctor: ['patients', 'recent_patients', 'appointments', 'medications', 'lab_definitions', 'dashboard_stats', 'admissions'],
  'lab-technician': ['lab_definitions', 'dashboard_stats'],
  nurse: ['beds', 'admissions', 'supplies', 'dashboard_stats'],
  pharmacist: ['medications', 'supplies', 'dashboard_stats']
};

export async function createDatabase(role: string): Promise<ClinicDatabase> {
  const db = await createRxDatabase<ClinicCollections>({
    name: `clinic_${role}`,
    storage: wrappedValidateAjvStorage({
        storage: getRxStorageDexie()
    }),
    multiInstance: true,
    ignoreDuplicate: true
  });

  // Get list of collections needed for this specific role
  const collections = roleBasedCollections[role as keyof typeof roleBasedCollections] || [];
  
  // Mapping of all possible collection configurations
  const collectionConfigs: Record<string, any> = {
    users: { schema: userSchema },
    patients: { schema: patientSchema },
    recent_patients: { schema: recentPatientSchema }, // Added this
    medications: { schema: medicationSchema },
    appointments: { schema: appointmentSchema },
    beds: { schema: bedSchema },
    admissions: { schema: admissionSchema },
    lab_definitions: { schema: labDefinitionSchema },
    departments: { schema: departmentSchema },
    supplies: { schema: supplySchema },
    dashboard_stats: { schema: dashboardStatsSchema }
  };

  // Only add collections relevant to this role to the database instance
  const collectionsToAdd: Record<string, any> = {};
  collections.forEach(colName => {
    if (collectionConfigs[colName]) {
      collectionsToAdd[colName] = collectionConfigs[colName];
    }
  });

  await db.addCollections(collectionsToAdd);

  return db;
}