import * as fs from 'fs';

export function readJSON (filePath: string): Promise<any> {
    return new Promise<void>((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(JSON.parse(data));
            }                    
        });
    });
}

export function writeJSON (filePath: string, obj: any) {
    return new Promise<void>((resolve, reject) => {
        const json = JSON.stringify(obj, null, 4);
        fs.writeFile(filePath, json, err => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
