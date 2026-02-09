// sync-manager.ts - Manage sync for all role-specific collections
import { ClinicDatabase } from './database';
import { createLaravelReplication, LaravelSyncConfig, SyncCheckpoint } from './sync';
import { RxReplicationState } from 'rxdb/plugins/replication';
import { Subscription } from 'rxjs';

export class SyncManager {
  private replications: Map<string, RxReplicationState<any, SyncCheckpoint>> = new Map();
  private subscriptions: Subscription[] = [];
  
  constructor(
    private db: ClinicDatabase,
    private role: string,
    private baseUrl: string,
    private authToken: string
  ) {
    console.log(`[SyncManager] Initialized for role: ${this.role}`);
  }

  async startSync(context: string = 'dashboard') {
    console.log(`[SyncManager] Starting sync for context: "${context}"...`);

    // Stop existing syncs
    await this.stopAll();

    const collectionsToSync = this.getCollectionsForContext(context);
    console.log(`[SyncManager] Targeting collections:`, collectionsToSync);
    
    for (const collectionName of collectionsToSync) {
      const collection = this.db[collectionName as keyof ClinicDatabase] as any;
      if (!collection) {
        console.warn(`[SyncManager] Collection "${collectionName}" not found in current database role.`);
        continue;
      }

      console.log(`[SyncManager] Spawning replication for: ${collectionName}`);

      const config: LaravelSyncConfig = {
        collection,
        role: this.role,
        context,
        baseUrl: this.baseUrl,
        authToken: this.authToken,
        live: true
      };

      const replicationState = createLaravelReplication(config);
      this.replications.set(collectionName, replicationState);

      // Subscribe to sync status
      const sub = replicationState.error$.subscribe(err => {
        console.error(`[SyncManager: ${collectionName}] REPLICATION ERROR:`, err);
      });

      const activeSub = replicationState.active$.subscribe(active => {
        console.log(`[SyncManager: ${collectionName}] State change -> Active: ${active}`);
      });

      this.subscriptions.push(sub, activeSub);

      // Wait for initial sync batch
      try {
        console.log(`[SyncManager: ${collectionName}] Awaiting initial replication...`);
        await replicationState.awaitInitialReplication();
        console.log(`[SyncManager: ${collectionName}] Initial replication complete.`);
      } catch (e) {
        console.error(`[SyncManager: ${collectionName}] Initial replication failed:`, e);
      }
    }

    console.log(`[SyncManager] Sync cycle started for ${this.replications.size} collections.`);
  }

  async stopAll() {
    if (this.replications.size === 0) return;

    console.log(`[SyncManager] Stopping ${this.replications.size} active replications...`);
    for (const [name, state] of this.replications) {
      console.log(`[SyncManager] Cancelling: ${name}`);
      await state.cancel();
    }
    this.replications.clear();
    
    console.log(`[SyncManager] Unsubscribing from status streams...`);
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  async pauseAll() {
    console.log(`[SyncManager] Pausing all replications.`);
    for (const [name, state] of this.replications) {
      if (!state.isPaused()) {
        await state.pause();
        console.log(`[SyncManager] Paused: ${name}`);
      }
    }
  }

  async resumeAll() {
    console.log(`[SyncManager] Resuming all replications.`);
    for (const [name, state] of this.replications) {
      if (state.isPaused() && !state.isStopped()) {
        await state.start();
        console.log(`[SyncManager] Resumed: ${name}`);
      }
    }
  }

  private getCollectionsForContext(context: string): string[] {
    const roleContexts: Record<string, Record<string, string[]>> = {
      admin: {
        dashboard: ['users', 'departments', 'dashboard_stats'],
        staff: ['users'],
        settings: ['departments', 'supplies', 'beds']
      },
      receptionist: {
        dashboard: ['patients', 'appointments', 'admissions', 'dashboard_stats'],
        patient_search: ['patients'],
        bed_management: ['beds', 'admissions'],
        appointment_booking: ['patients', 'appointments']
      },
      doctor: {
        dashboard: ['appointments', 'patients', 'medications', 'lab_definitions', 'dashboard_stats'],
        consultation: ['medications', 'lab_definitions', 'patients'],
        my_patients: ['patients'],
        schedule: ['appointments']
      },
      'lab-technician': {
        dashboard: ['lab_definitions', 'dashboard_stats'],
        processing: ['lab_definitions'],
        definitions: ['lab_definitions']
      },
      nurse: {
        dashboard: ['admissions', 'beds', 'supplies', 'dashboard_stats'],
        rounds: ['admissions', 'supplies'],
        bed_map: ['beds'],
        supply_usage: ['supplies']
      },
      pharmacist: {
        dashboard: ['medications', 'dashboard_stats', 'supplies'],
        dispensing: ['medications'],
        inventory: ['medications', 'supplies']
      }
    };

    return roleContexts[this.role]?.[context] || ['dashboard_stats'];
  }

  getReplicationState(collectionName: string) {
    return this.replications.get(collectionName);
  }
}