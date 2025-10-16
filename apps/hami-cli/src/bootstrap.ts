import { CoreFSPlugin } from '@hami/core-fs';
import { CoreConfigFSPlugin } from '@hami/core-config-fs';
import { CoreTraceFSPlugin } from '@hami/core-trace-fs';
import { HAMIRegistrationManager } from '@hami/core';

export async function bootstrap(): Promise<{ registry: HAMIRegistrationManager }> {
    const registry = new HAMIRegistrationManager();
    await registry.registerPlugin(CoreFSPlugin);
    await registry.registerPlugin(CoreConfigFSPlugin);
    await registry.registerPlugin(CoreTraceFSPlugin);
    return { registry };
}

