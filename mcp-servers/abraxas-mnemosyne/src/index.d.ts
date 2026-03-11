export declare const tools: {
    session_save: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                title: {
                    type: string;
                    description: string;
                };
                content: {
                    type: string;
                    description: string;
                };
                metadata: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    };
    session_load: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                session_id: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    };
    session_list: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                status: {
                    type: string;
                    description: string;
                    enum: string[];
                };
                limit: {
                    type: string;
                    description: string;
                    default: number;
                };
                offset: {
                    type: string;
                    description: string;
                    default: number;
                };
            };
        };
    };
    session_archive: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                session_id: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    };
    session_export: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                session_id: {
                    type: string;
                    description: string;
                };
                format: {
                    type: string;
                    description: string;
                    enum: string[];
                    default: string;
                };
            };
            required: string[];
        };
    };
    index_update: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                operation: {
                    type: string;
                    description: string;
                    enum: string[];
                };
                session_id: {
                    type: string;
                    description: string;
                };
                data: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    };
    session_link_add: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                session_id: {
                    type: string;
                    description: string;
                };
                target_id: {
                    type: string;
                    description: string;
                };
                link_type: {
                    type: string;
                    description: string;
                    enum: string[];
                    default: string;
                };
            };
            required: string[];
        };
    };
    session_link_validate: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                session_id: {
                    type: string;
                    description: string;
                };
                target_id: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    };
    session_links_list: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                session_id: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    };
};
export declare function executeSessionSave(title: string, content: string, metadata?: any): Promise<any>;
export declare function executeSessionLoad(sessionId: string): Promise<any>;
export declare function executeSessionList(status?: string, limit?: number, offset?: number): Promise<any>;
export declare function executeSessionArchive(sessionId: string): Promise<any>;
export declare function executeSessionExport(sessionId: string, format?: string): Promise<any>;
export declare function executeIndexUpdate(operation: string, sessionId: string, data?: any): Promise<any>;
export declare const toolsRegistry: {
    session_save: typeof executeSessionSave;
    session_load: typeof executeSessionLoad;
    session_list: typeof executeSessionList;
    session_archive: typeof executeSessionArchive;
    session_export: typeof executeSessionExport;
    index_update: typeof executeIndexUpdate;
    session_link_add: typeof executeSessionLinkAdd;
    session_link_validate: typeof executeSessionLinkValidate;
    session_links_list: typeof executeSessionLinksList;
};
export declare const serverConfig: {
    name: string;
    version: string;
    description: string;
    features: {
        lazyLoading: boolean;
        skills2: boolean;
    };
};
export declare function executeSessionLinkAdd(sessionId: string, targetId: string, linkType?: string): Promise<any>;
export declare function executeSessionLinkValidate(sessionId: string, targetId: string): Promise<any>;
export declare function executeSessionLinksList(sessionId: string): Promise<any>;
//# sourceMappingURL=index.d.ts.map