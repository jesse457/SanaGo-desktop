// sync.ts - Custom replication matching your Laravel sync endpoints
import { 
  RxCollection, 
  RxReplicationWriteToMasterRow, 
  ReplicationPullOptions, 
  ReplicationPushOptions 
} from 'rxdb/plugins/core';
import { replicateRxCollection, RxReplicationState } from 'rxdb/plugins/replication';
import { Subject } from 'rxjs';

export interface SyncCheckpoint {
  updated_at: string;
  id: number | string;
}

export interface LaravelSyncConfig {
  collection: RxCollection;
  role: string;
  context?: string;
  baseUrl: string;
  authToken: string;
  batchSize?: number;
  live?: boolean;
}

export interface PullResponse {
  checkpoint: SyncCheckpoint;
  documents: Record<string, any[]>;
  hasMore: boolean;
}

export interface PushResponse {
  message: string;
  success: boolean;
  written: string[];
  conflicts: Array<{
    id: string;
    status: string;
    reason: string;
    server_rev: string;
  }>;
}

export function createLaravelReplication<RxDocType>(config: LaravelSyncConfig): RxReplicationState<RxDocType, SyncCheckpoint> {
  const { collection, role, context = 'dashboard', baseUrl, authToken, batchSize = 100, live = true } = config;
  
  const collectionName = collection.name;
  
  const getSyncEndpoint = (action: 'pull' | 'push') => `${baseUrl}/api/sync/${role}/${action}`;

  const getCollectionsForContext = (ctx: string): string[] => {
    const contextMap: Record<string, string[]> = {
      dashboard: [collectionName],
      staff: ['users'],
      settings: ['departments', 'supplies'],
      patient_search: ['patients'],
      bed_management: ['beds'],
      appointment_booking: ['patients', 'appointments'],
      consultation: ['medications', 'lab_definitions'],
      dispensing: ['medications'],
      inventory: ['medications', 'supplies'],
      processing: ['lab_definitions']
    };
    return contextMap[ctx] || [collectionName];
  };

  const pullOptions: ReplicationPullOptions<any, SyncCheckpoint> = {
    handler: async (lastCheckpoint, batchSize) => {
      const checkpoint = lastCheckpoint || { updated_at: '1970-01-01 00:00:00', id: 0 };
      
      console.log(`[RxDB Pull: ${collectionName}] Fetching batch...`, { checkpoint, context });

      try {
        const response = await fetch(getSyncEndpoint('pull'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            checkpoint,
            context,
            collections: getCollectionsForContext(context)
          })
        });

        if (!response.ok) {
          console.error(`[RxDB Pull: ${collectionName}] Server error:`, response.status);
          throw new Error(`Pull failed: ${response.statusText}`);
        }

        const data: PullResponse = await response.json();
        const docs = data.documents[collectionName] || [];
        
        console.log(`[RxDB Pull: ${collectionName}] Success. Received ${docs.length} docs.`, { hasMore: data.hasMore });

        const transformedDocs = docs.map(doc => ({
          ...doc,
          _deleted: false 
        }));

        return {
          documents: transformedDocs,
          checkpoint: data.checkpoint,
          hasMore: data.hasMore
        };
      } catch (error) {
        console.error(`[RxDB Pull: ${collectionName}] Fatal error:`, error);
        throw error;
      }
    },
    batchSize,
    stream$: new Subject()
  };

  const pushOptions: ReplicationPushOptions<any> = {
    handler: async (rows: RxReplicationWriteToMasterRow<any>[]) => {
      const workflowCollections = ['appointments', 'admissions', 'lab_requests', 'prescriptions', 'medical_records', 'vitals', 'dispensations', 'supply_usages'];
      
      if (workflowCollections.includes(collectionName)) {
        console.warn(`[RxDB Push: ${collectionName}] Denied: Collection is read-only (Workflow).`);
        return [];
      }

      console.log(`[RxDB Push: ${collectionName}] Sending ${rows.length} changes to Laravel...`);

      const changes = rows.map(row => {
        const doc = row.newDocumentState;
        return {
          id: doc.id,
          ...doc,
          updated_at: new Date().toISOString(),
          _deleted: doc._deleted || false
        };
      });

      try {
        const response = await fetch(getSyncEndpoint('push'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            collection: collectionName,
            changes
          })
        });

        if (!response.ok) {
          if (response.status === 403) {
            console.warn(`[RxDB Push: ${collectionName}] Forbidden: User cannot push to this collection.`);
            return [];
          }
          throw new Error(`Push failed: ${response.statusText}`);
        }

        const result: PushResponse = await response.json();
        console.log(`[RxDB Push: ${collectionName}] Success. Written IDs:`, result.written);

        if (result.conflicts.length > 0) {
          console.warn(`[RxDB Push: ${collectionName}] Handled ${result.conflicts.length} conflicts.`);
        }

        return result.conflicts.map(conflict => ({
          id: conflict.id,
          status: 'conflict',
          reason: conflict.reason,
          server_rev: conflict.server_rev
        }));
      } catch (error) {
        console.error(`[RxDB Push: ${collectionName}] Fatal error:`, error);
        throw error;
      }
    },
    batchSize: 50,
    modifier: (doc) => {
      const { _rev, _attachments, ...cleanDoc } = doc;
      return cleanDoc;
    }
  };

  console.log(`[RxDB Sync] Initializing replication for "${collectionName}"...`);

  const replicationState = replicateRxCollection({
    collection,
    replicationIdentifier: `laravel-${role}-${collectionName}-${context}`,
    pull: pullOptions,
    push: pushOptions,
    live,
    retryTime: 5000,
    waitForLeadership: true,
    autoStart: true
  });

  return replicationState;
}