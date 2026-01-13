export declare const IDL: {
    address: string;
    metadata: {
        name: string;
        version: string;
        spec: string;
        description: string;
    };
    instructions: ({
        name: string;
        discriminator: number[];
        accounts: ({
            name: string;
            writable: boolean;
            pda: {
                seeds: ({
                    kind: string;
                    value: number[];
                    path?: undefined;
                } | {
                    kind: string;
                    path: string;
                    value?: undefined;
                })[];
            };
            signer?: undefined;
            address?: undefined;
        } | {
            name: string;
            pda: {
                seeds: ({
                    kind: string;
                    value: number[];
                    path?: undefined;
                } | {
                    kind: string;
                    path: string;
                    value?: undefined;
                })[];
            };
            writable?: undefined;
            signer?: undefined;
            address?: undefined;
        } | {
            name: string;
            writable: boolean;
            signer: boolean;
            pda?: undefined;
            address?: undefined;
        } | {
            name: string;
            address: string;
            writable?: undefined;
            pda?: undefined;
            signer?: undefined;
        })[];
        args: {
            name: string;
            type: string;
        }[];
    } | {
        name: string;
        discriminator: number[];
        accounts: ({
            name: string;
            writable: boolean;
            pda: {
                seeds: ({
                    kind: string;
                    value: number[];
                    path?: undefined;
                } | {
                    kind: string;
                    path: string;
                    value?: undefined;
                })[];
            };
            signer?: undefined;
        } | {
            name: string;
            signer: boolean;
            writable?: undefined;
            pda?: undefined;
        })[];
        args: ({
            name: string;
            type: string;
        } | {
            name: string;
            type: {
                defined: {
                    name: string;
                };
            };
        })[];
    })[];
    accounts: {
        name: string;
        discriminator: number[];
    }[];
    events: {
        name: string;
        discriminator: number[];
    }[];
    errors: {
        code: number;
        name: string;
        msg: string;
    }[];
    types: ({
        name: string;
        type: {
            kind: string;
            fields: ({
                name: string;
                type: string;
            } | {
                name: string;
                type: {
                    defined: {
                        name: string;
                    };
                };
            })[];
            variants?: undefined;
        };
    } | {
        name: string;
        type: {
            kind: string;
            variants: {
                name: string;
            }[];
            fields?: undefined;
        };
    })[];
};
//# sourceMappingURL=solana_test_project.d.ts.map