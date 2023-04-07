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

declare type ScoringResult = Solution;

declare interface VideoDetails {
    uri: string,
    bytes: number,
    createdAt: string,
    publicId: string,
}