import fs from 'fs';

export default {
  async access(dir: string, mode: number): Promise<void> {
    return new Promise((resolve, reject) =>
      fs.access(dir, mode, (err) => {
        if (err) reject(err);
        else resolve();
      })
    );
  },
  async readdir(dir: string): Promise<string[]> {
    return new Promise((resolve, reject) =>
      fs.readdir(dir, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      })
    );
  },
  async copyFile(src: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) =>
      fs.copyFile(src, dest, (err) => {
        if (err) reject(err);
        else resolve();
      })
    );
  },
};
