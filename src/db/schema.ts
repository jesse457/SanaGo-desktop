// schemas.ts - RxDB JSON Schemas matching your Laravel backend
import { RxJsonSchema } from "rxdb";

// ==========================================
// BASE SCHEMA FIELDS
// ==========================================

const baseSchema = {
  id: {
    type: "string",
    maxLength: 100, // Required by Dexie storage for primary keys
  },
  updated_at: {
    type: "string",
    format: "date-time",
  },
  _deleted: {
    type: "boolean",
    default: false,
  },
};

// Workflow marker for read-only collections
const workflowFields = {
  isReadOnly: { type: "boolean", default: true },
  isWorkflow: { type: "boolean", default: true },
};

// ==========================================
// USER & STAFF SCHEMAS
// ==========================================

export const userSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    name: { type: "string" },
    email: { type: "string" },
    role: {
      type: "string",
      enum: [
        "admin",
        "doctor",
        "receptionist",
        "lab-technician",
        "nurse",
        "pharmacist",
      ],
    },
    department_id: { type: ["string", "null"] },
    phone: { type: ["string", "null"] },
    avatar: { type: ["string", "null"] },
    is_active: { type: "boolean", default: true },
  },
  required: ["id", "name", "email", "role"],
};

export const shiftSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    user_id: { type: "string" },
    user_name: { type: "string" },
    type: {
      type: "string",
      enum: ["morning", "afternoon", "night", "on_call"],
    },
    date: { type: "string", format: "date" },
    start: { type: "string" },
    end: { type: "string" },
  },
  required: ["id", "user_id", "type", "date"],
};

// ==========================================
// PATIENT SCHEMAS
// ==========================================

export const patientSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    uid: { type: "string" },
    first_name: { type: "string" },
    last_name: { type: "string" },
    phone: { type: ["string", "null"] },
    email: { type: ["string", "null"] },
    gender: {
      type: ["string", "null"],
      enum: ["male", "female", "other", null],
    },
    dob: { type: ["string", "null"], format: "date" },
    blood_type: { type: ["string", "null"] },
    allergies: { type: ["string", "null"] },
    created_at: { type: "string", format: "date-time" },
  },
  required: ["id", "uid", "first_name", "last_name", "created_at"],
};
export const recentPatientSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    uid: { type: "string" },
    first_name: { type: "string" },
    last_name: { type: "string" },
    phone: { type: ["string", "null"] },
    email: { type: ["string", "null"] },
    gender: { type: ["string", "null"] },
    dob: { type: ["string", "null"], format: "date" },
    created_at: { type: "string", format: "date-time" }, // Required for Chart.js logic
  },
  required: ["id", "uid", "first_name", "last_name", "created_at"],
};

// ==========================================
// APPOINTMENT SCHEMAS
// ==========================================

export const appointmentSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    patient_id: { type: "string" },
    patient_name: { type: "string" },
    patient_uid: { type: "string" },
    doctor_id: { type: "string" },
    doctor_name: { type: "string" },
    date: { type: "string", format: "date" },
    time: { type: "string" },
    status: {
      type: "string",
      enum: [
        "pending",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
        "in_consultation",
        "no_show",
      ],
    },
    reason: { type: ["string", "null"] },
    queue_position: { type: "number" },
    notes: { type: ["string", "null"] },
    patient_phone: { type: ["string", "null"] },
    ...workflowFields,
  },
  required: ["id", "patient_id", "doctor_id", "date", "time", "status"],
};

// ==========================================
// ADMISSION & BED SCHEMAS
// ==========================================

export const admissionSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    patient_id: { type: "string" },
    patient_name: { type: "string" },
    doctor_id: { type: "string" },
    doctor_name: { type: "string" },
    bed_id: { type: ["string", "null"] },
    bed_number: { type: "string" },
    ward: { type: "string" },
    admission_date: { type: "string", format: "date-time" },
    discharge_date: { type: ["string", "null"], format: "date-time" },
    status: {
      type: "string",
      enum: ["pending", "admitted", "discharged", "transferred"],
    },
    diagnosis: { type: ["string", "null"] },
    requested_at: { type: ["string", "null"], format: "date-time" },
    admitted_since: { type: ["string", "null"], format: "date-time" },
    age: { type: ["number", "null"] },
    gender: { type: ["string", "null"] },
    blood_type: { type: ["string", "null"] },
    allergies: { type: ["string", "null"] },
    ...workflowFields,
  },
  required: ["id", "patient_id", "status"],
};

export const bedSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    number: { type: "string" },
    ward_id: { type: "string" },
    ward_name: { type: "string" },
    type_id: { type: ["string", "null"] },
    type_name: { type: "string" },
    occupied: { type: "boolean" },
    occupied_by: { type: ["string", "null"] },
    patient_name: { type: ["string", "null"] },
    admission_id: { type: ["string", "null"] },
  },
  required: ["id", "number", "ward_id", "occupied"],
};

export const wardSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    name: { type: "string" },
    number: { type: "string" },
    department_id: { type: "string" },
    department_name: { type: "string" },
    description: { type: ["string", "null"] },
    capacity: { type: "number" },
    occupied_count: { type: "number", default: 0 },
  },
  required: ["id", "name", "department_id"],
};

// ==========================================
// MEDICAL & LAB SCHEMAS
// ==========================================

export const medicationSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    name: { type: "string" },
    generic_name: { type: ["string", "null"] },
    description: { type: ["string", "null"] },
    stock: { type: "number" },
    min_stock: { type: "number" },
    price: { type: "number" },
    in_stock: { type: "boolean" },
    unit: { type: "string" },
    category: { type: ["string", "null"] },
    supplier: { type: ["string", "null"] },
    current: { type: "number" }, // For low_stock_alerts context
    minimum: { type: "number" },
    critical: { type: "boolean" },
  },
  required: ["id", "name"],
};

export const labDefinitionSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    name: { type: "string" },
    code: { type: "string" },
    description: { type: ["string", "null"] },
    price: { type: "number" },
    units: { type: ["string", "null"] },
    normal_range: { type: ["string", "null"] },
    category: { type: ["string", "null"] },
    turnaround_time: { type: ["string", "null"] },
  },
  required: ["id", "name", "code"],
};

export const labRequestSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    patient_id: { type: "string" },
    patient_name: { type: "string" },
    patient_uid: { type: "string" },
    doctor_id: { type: "string" },
    doctor_name: { type: "string" },
    test_id: { type: "string" },
    test_name: { type: "string" },
    test_code: { type: "string" },
    status: {
      type: "string",
      enum: ["pending", "processing", "completed", "cancelled"],
    },
    urgency: {
      type: "string",
      enum: ["routine", "urgent", "stat"],
    },
    requested_at: { type: "string", format: "date-time" },
    completed_at: { type: ["string", "null"], format: "date-time" },
    started_at: { type: ["string", "null"], format: "date-time" },
    results: { type: ["object", "null"] },
    notes: { type: ["string", "null"] },
    ...workflowFields,
  },
  required: ["id", "patient_id", "test_id", "status"],
};

export const prescriptionSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    patient_id: { type: "string" },
    patient_name: { type: "string" },
    doctor_id: { type: "string" },
    doctor_name: { type: "string" },
    date: { type: "string", format: "date-time" },
    status: {
      type: "string",
      enum: ["pending", "partially_dispensed", "dispensed", "cancelled"],
    },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          medication_id: { type: "string" },
          medication: { type: "string" },
          dosage: { type: "string" },
          frequency: { type: "string" },
          duration: { type: "string" },
          prescribed: { type: "number" },
          dispensed: { type: "number" },
          instructions: { type: ["string", "null"] },
        },
      },
    },
    ...workflowFields,
  },
  required: ["id", "patient_id", "doctor_id", "status"],
};

export const medicalRecordSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    patient_id: { type: "string" },
    patient_name: { type: "string" },
    doctor_id: { type: "string" },
    complaint: { type: ["string", "null"] },
    diagnosis: { type: ["string", "null"] },
    treatment: { type: ["string", "null"] },
    finalized: { type: "boolean" },
    created_at: { type: "string", format: "date-time" },
    ...workflowFields,
  },
  required: ["id", "patient_id", "doctor_id"],
};

export const vitalSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    patient_id: { type: "string" },
    patient_name: { type: "string" },
    temperature: { type: ["number", "null"] },
    bp_systolic: { type: ["number", "null"] },
    bp_diastolic: { type: ["number", "null"] },
    heart_rate: { type: ["number", "null"] },
    spo2: { type: ["number", "null"] },
    recorded_at: { type: ["string", "null"], format: "date-time" },
    ...workflowFields,
  },
  required: ["id", "patient_id"],
};

// ==========================================
// INVENTORY & SUPPLY SCHEMAS
// ==========================================

export const supplySchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    name: { type: "string" },
    description: { type: ["string", "null"] },
    unit: { type: "string" },
    stock: { type: "number" },
    min_stock: { type: "number" },
    low_stock: { type: "boolean" },
    category: { type: ["string", "null"] },
    location: { type: ["string", "null"] },
  },
  required: ["id", "name"],
};

export const supplyUsageSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    supply_id: { type: "string" },
    supply_name: { type: "string" },
    patient_id: { type: "string" },
    patient_name: { type: "string" },
    user_name: { type: "string" },
    quantity: { type: "number" },
    used_at: { type: "string", format: "date-time" },
    ...workflowFields,
  },
  required: ["id", "supply_id", "patient_id"],
};

// ==========================================
// ORGANIZATION SCHEMAS
// ==========================================

export const departmentSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    name: { type: "string" },
    description: { type: ["string", "null"] },
    head_id: { type: ["string", "null"] },
    head_name: { type: ["string", "null"] },
  },
  required: ["id", "name"],
};

// ==========================================
// DASHBOARD & ANALYTICS SCHEMAS
// ==========================================

export const dashboardStatsSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    generated_at: { type: "string", format: "date-time" },
    // General stats
    total_patients: { type: "number" },
    today_appointments: { type: "number" },
    pending_admissions: { type: "number" },
    occupied_beds: { type: "number" },
    total_beds: { type: "number" },
    available_beds: { type: "number" },
    low_stock_medications: { type: "number" },
    pending_lab_requests: { type: "number" },
    pending_prescriptions: { type: "number" },
    // Role-specific stats
    my_today_appointments: { type: "number" },
    my_pending_consultations: { type: "number" },
    my_completed_today: { type: "number" },
    dispensed_today: { type: "number" },
    my_pending_tests: { type: "number" },
    completed_today: { type: "number" },
    assigned_patients: { type: "number" },
    // Additional computed fields
    bed_occupancy_rate: { type: "number" },
    avg_consultation_time: { type: "number" },
  },
  required: ["id"],
};

export const bedOccupancySchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    ...baseSchema,
    total: { type: "number" },
    occupied: { type: "number" },
    available: { type: "number" },
    by_ward: {
      type: "array",
      items: {
        type: "object",
        properties: {
          ward_id: { type: "string" },
          ward_name: { type: "string" },
          total: { type: "number" },
          occupied: { type: "number" },
        },
      },
    },
  },
  required: ["id"],
};

// ==========================================
// SCHEMAS MAP FOR DYNAMIC ACCESS
// ==========================================

export const schemas = {
  users: userSchema,
  patients: patientSchema,
  appointments: appointmentSchema,
  admissions: admissionSchema,
  beds: bedSchema,
  recent_patients: recentPatientSchema,
  wards: wardSchema,
  medications: medicationSchema,
  lab_definitions: labDefinitionSchema,
  lab_requests: labRequestSchema,
  prescriptions: prescriptionSchema,
  medical_records: medicalRecordSchema,
  vitals: vitalSchema,
  supplies: supplySchema,
  supply_usages: supplyUsageSchema,
  departments: departmentSchema,
  shifts: shiftSchema,
  dashboard_stats: dashboardStatsSchema,
  bed_occupancy: bedOccupancySchema,
} as const;

export type SchemaName = keyof typeof schemas;
