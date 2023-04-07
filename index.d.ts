declare interface Solution {
    expression: string,
    gameplay: string, // url to the gameplay video on cloudinary,
    level: string,
    charCount: number,
    playURL: string,
    time: number,
    player?: string,
    timestamp: number;
}