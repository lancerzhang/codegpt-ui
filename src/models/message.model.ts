export interface Message {
    id?: number;
    conversationId?: number;
    sender: string;
    text: string;
    numTokens?: number;
    isPrompt?: boolean;
    isLoading?: boolean;
    parentId?: number;  // the id of the parent message
    isActive?: boolean; // whether this message is in the currently active branch
    peersIds?: number[];
    activePeerIndex?: number;
    createdAt?: Date;
}
