import { promises as fs } from 'fs';

export const CONFIG_FILE_NAME = 'wd.config.json';
export const USER_CONFIG_FILE_NAME = 'user.config.json';

export async function fetchConfig(
    configPath: string,
): Promise<Record<string, any>> {
    try {
        const data = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(data);
        return config;
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return empty config
            return {};
        }
        throw error;
    }
}

export async function writeConfig(
    configDir: string,
    configPath: string,
    config: Record<string, any>,
): Promise<void> {
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}