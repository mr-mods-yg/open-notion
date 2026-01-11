export type BlockContent = 
    | { text: string }  // paragraph, heading, code
    | { text: string; task: boolean }  // todo