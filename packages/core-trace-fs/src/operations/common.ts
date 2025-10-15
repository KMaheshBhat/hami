import { promises as fs } from 'fs';
import { join } from 'path';

export const TRACE_INDEX_FILE_NAME = 'wf.index.json';

export async function fetchTraceIndex(
    hamiDirectory: string,
): Promise<Record<string, any>[]> {
    const indexPath = join(hamiDirectory, TRACE_INDEX_FILE_NAME);
    try {
        const data = await fs.readFile(indexPath, 'utf-8');
        const index = JSON.parse(data);
        return Array.isArray(index) ? index : [];
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return empty index
            return [];
        }
        throw error;
    }
}

export async function writeTraceIndex(
    hamiDirectory: string,
    index: Record<string, any>,
): Promise<void> {
    const indexPath = join(hamiDirectory, TRACE_INDEX_FILE_NAME);
    await fs.mkdir(hamiDirectory, { recursive: true });
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
}