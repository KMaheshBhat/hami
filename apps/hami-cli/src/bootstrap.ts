import { CoreFSPlugin } from '@hami-frameworx/core-fs';
import { CoreConfigFSPlugin } from '@hami-frameworx/core-config-fs';
import { CoreTraceFSPlugin } from '@hami-frameworx/core-trace-fs';
import { HAMIRegistrationManager, CorePlugin } from '@hami-frameworx/core';

export async function bootstrap(): Promise<{ registry: HAMIRegistrationManager }> {
    const registry = new HAMIRegistrationManager();
    await registry.registerPlugin(CorePlugin);
    await registry.registerPlugin(CoreFSPlugin);
    await registry.registerPlugin(CoreConfigFSPlugin);
    await registry.registerPlugin(CoreTraceFSPlugin);
    return { registry };
}

