/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solana_test_project.json`.
 */
export type SolanaTestProject = {
  "address": "48BYj4BVCp7D3EByu6f9nW8uHaFuuFdwJozB7iLZPxhJ",
  "metadata": {
    "name": "solanaTestProject",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "registerBatch",
      "discriminator": [
        255,
        186,
        59,
        153,
        95,
        233,
        143,
        171
      ],
      "accounts": [
        {
          "name": "batch",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  99,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "manufacturer"
              },
              {
                "kind": "arg",
                "path": "batchHash"
              }
            ]
          }
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  110,
                  117,
                  102,
                  97,
                  99,
                  116,
                  117,
                  114,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "manufacturer"
              }
            ]
          }
        },
        {
          "name": "manufacturer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "batchHash",
          "type": "string"
        },
        {
          "name": "manufacturingDate",
          "type": "i64"
        },
        {
          "name": "expiryDate",
          "type": "i64"
        },
        {
          "name": "quantity",
          "type": "u64"
        },
        {
          "name": "mrp",
          "type": "u64"
        },
        {
          "name": "metadataHash",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "registerManufacturer",
      "discriminator": [
        209,
        17,
        71,
        213,
        190,
        230,
        125,
        136
      ],
      "accounts": [
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  110,
                  117,
                  102,
                  97,
                  99,
                  116,
                  117,
                  114,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "manufacturer"
              }
            ]
          }
        },
        {
          "name": "manufacturer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "updateBatchStatus",
      "discriminator": [
        71,
        201,
        175,
        178,
        12,
        50,
        51,
        175
      ],
      "accounts": [
        {
          "name": "batch",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  99,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "manufacturer"
              },
              {
                "kind": "arg",
                "path": "batchHash"
              }
            ]
          }
        },
        {
          "name": "manufacturer",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "batchHash",
          "type": "string"
        },
        {
          "name": "newStatus",
          "type": {
            "defined": {
              "name": "batchStatus"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "batch",
      "discriminator": [
        156,
        194,
        70,
        44,
        22,
        88,
        137,
        44
      ]
    },
    {
      "name": "manufacturerRegistry",
      "discriminator": [
        139,
        110,
        77,
        210,
        164,
        119,
        201,
        104
      ]
    }
  ],
  "events": [
    {
      "name": "batchRegistered",
      "discriminator": [
        125,
        239,
        216,
        76,
        8,
        32,
        199,
        204
      ]
    },
    {
      "name": "batchStatusUpdated",
      "discriminator": [
        68,
        227,
        137,
        197,
        172,
        152,
        59,
        35
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "emptyBatchId",
      "msg": "Batch ID cannot be empty"
    },
    {
      "code": 6001,
      "name": "batchIdTooLong",
      "msg": "Batch ID exceeds maximum length (64 chars)"
    },
    {
      "code": 6002,
      "name": "metadataHashTooLong",
      "msg": "Metadata hash exceeds maximum length (64 chars)"
    },
    {
      "code": 6003,
      "name": "invalidDateRange",
      "msg": "Expiry date must be after manufacturing date"
    },
    {
      "code": 6004,
      "name": "expiredMedicine",
      "msg": "Expired medicine cannot be registered"
    },
    {
      "code": 6005,
      "name": "invalidQuantity",
      "msg": "Quantity must be greater than zero"
    },
    {
      "code": 6006,
      "name": "invalidMrp",
      "msg": "MRP must be greater than zero"
    },
    {
      "code": 6007,
      "name": "unauthorizedManufacturer",
      "msg": "Only the manufacturer can perform this action"
    },
    {
      "code": 6008,
      "name": "invalidBatchStatus",
      "msg": "Invalid batch status transition"
    },
    {
      "code": 6009,
      "name": "manufacturerNotVerified",
      "msg": "Manufacturer is not verified in the registry"
    },
    {
      "code": 6010,
      "name": "batchAlreadyRecalled",
      "msg": "Cannot modify a recalled batch"
    }
  ],
  "types": [
    {
      "name": "batch",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "batchHash",
            "type": "string"
          },
          {
            "name": "manufacturerWallet",
            "type": "pubkey"
          },
          {
            "name": "metadataHash",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "manufacturingDate",
            "type": "i64"
          },
          {
            "name": "expiryDate",
            "type": "i64"
          },
          {
            "name": "quantity",
            "type": "u64"
          },
          {
            "name": "mrp",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "batchStatus"
              }
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "batchRegistered",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "batchHash",
            "type": "string"
          },
          {
            "name": "batchPda",
            "type": "pubkey"
          },
          {
            "name": "manufacturerWallet",
            "type": "pubkey"
          },
          {
            "name": "metadataHash",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "manufacturingDate",
            "type": "i64"
          },
          {
            "name": "expiryDate",
            "type": "i64"
          },
          {
            "name": "quantity",
            "type": "u64"
          },
          {
            "name": "mrp",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "batchStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "valid"
          },
          {
            "name": "suspended"
          },
          {
            "name": "recalled"
          }
        ]
      }
    },
    {
      "name": "batchStatusUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "batchHash",
            "type": "string"
          },
          {
            "name": "batchPda",
            "type": "pubkey"
          },
          {
            "name": "oldStatus",
            "type": {
              "defined": {
                "name": "batchStatus"
              }
            }
          },
          {
            "name": "newStatus",
            "type": {
              "defined": {
                "name": "batchStatus"
              }
            }
          },
          {
            "name": "updatedBy",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "manufacturerRegistry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "manufacturer",
            "type": "pubkey"
          },
          {
            "name": "isVerified",
            "type": "bool"
          },
          {
            "name": "registeredAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
