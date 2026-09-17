/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/builder_raise.json`.
 */
export type BuilderRaise = {
  "address": "6weAy9KBNBf6MFsiA4csnEj5yJEhLV5nA5fzvnHD6wS2",
  "metadata": {
    "name": "builderRaise",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Inspection-gated share certificates and win-claim vault"
  },
  "instructions": [
    {
      "name": "cancelRaise",
      "discriminator": [
        93,
        123,
        204,
        79,
        107,
        196,
        120,
        217
      ],
      "accounts": [
        {
          "name": "raise",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  105,
                  115,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raise.founder",
                "account": "raise"
              },
              {
                "kind": "account",
                "path": "raise.project_seed",
                "account": "raise"
              }
            ]
          }
        },
        {
          "name": "founder",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "claim",
      "discriminator": [
        62,
        198,
        214,
        193,
        213,
        159,
        108,
        210
      ],
      "accounts": [
        {
          "name": "raise",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  105,
                  115,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raise.founder",
                "account": "raise"
              },
              {
                "kind": "account",
                "path": "raise.project_seed",
                "account": "raise"
              }
            ]
          }
        },
        {
          "name": "certificate",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raise"
              },
              {
                "kind": "account",
                "path": "certificate.serial",
                "account": "shareCertificate"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "raise"
              }
            ]
          }
        },
        {
          "name": "owner",
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
      "name": "closeRaise",
      "discriminator": [
        98,
        161,
        86,
        205,
        151,
        68,
        24,
        43
      ],
      "accounts": [
        {
          "name": "raise",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  105,
                  115,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raise.founder",
                "account": "raise"
              },
              {
                "kind": "account",
                "path": "raise.project_seed",
                "account": "raise"
              }
            ]
          }
        },
        {
          "name": "founder",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "createRaise",
      "discriminator": [
        234,
        185,
        148,
        199,
        102,
        231,
        133,
        210
      ],
      "accounts": [
        {
          "name": "raise",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  105,
                  115,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "founder"
              },
              {
                "kind": "arg",
                "path": "projectSeed"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "raise"
              }
            ]
          }
        },
        {
          "name": "founder",
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
          "name": "projectSeed",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "priceLamports",
          "type": "u64"
        },
        {
          "name": "shareSupply",
          "type": "u32"
        },
        {
          "name": "holderPoolBps",
          "type": "u16"
        },
        {
          "name": "goalLamports",
          "type": "u64"
        },
        {
          "name": "minBuilderScore",
          "type": "u16"
        },
        {
          "name": "applicationHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "depositWin",
      "discriminator": [
        58,
        9,
        124,
        70,
        159,
        18,
        201,
        10
      ],
      "accounts": [
        {
          "name": "raise",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  105,
                  115,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raise.founder",
                "account": "raise"
              },
              {
                "kind": "account",
                "path": "raise.project_seed",
                "account": "raise"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "raise"
              }
            ]
          }
        },
        {
          "name": "founder",
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeConfig",
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  105,
                  115,
                  101,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
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
          "name": "oracle",
          "type": "pubkey"
        },
        {
          "name": "platformFeeBps",
          "type": "u16"
        },
        {
          "name": "platformTreasury",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "mintShare",
      "discriminator": [
        145,
        1,
        122,
        214,
        134,
        106,
        116,
        109
      ],
      "accounts": [
        {
          "name": "raise",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  105,
                  115,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raise.founder",
                "account": "raise"
              },
              {
                "kind": "account",
                "path": "raise.project_seed",
                "account": "raise"
              }
            ]
          }
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  105,
                  115,
                  101,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "certificate",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raise"
              },
              {
                "kind": "arg",
                "path": "serial"
              }
            ]
          }
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "founder",
          "writable": true
        },
        {
          "name": "platformTreasury",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "serial",
          "type": "u32"
        }
      ]
    },
    {
      "name": "openRaise",
      "discriminator": [
        131,
        238,
        79,
        115,
        242,
        135,
        142,
        242
      ],
      "accounts": [
        {
          "name": "raise",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  105,
                  115,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raise.founder",
                "account": "raise"
              },
              {
                "kind": "account",
                "path": "raise.project_seed",
                "account": "raise"
              }
            ]
          }
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  105,
                  115,
                  101,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "oracle",
          "signer": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "raise",
      "discriminator": [
        253,
        96,
        15,
        240,
        65,
        242,
        192,
        103
      ]
    },
    {
      "name": "raiseConfig",
      "discriminator": [
        171,
        194,
        103,
        55,
        249,
        30,
        135,
        56
      ]
    },
    {
      "name": "raiseVault",
      "discriminator": [
        189,
        73,
        88,
        80,
        150,
        174,
        43,
        151
      ]
    },
    {
      "name": "shareCertificate",
      "discriminator": [
        68,
        13,
        89,
        98,
        168,
        171,
        170,
        11
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorizedOracle",
      "msg": "Unauthorized: only the raise oracle can open a raise"
    },
    {
      "code": 6001,
      "name": "unauthorizedFounder",
      "msg": "Unauthorized: only the founder can do this"
    },
    {
      "code": 6002,
      "name": "unauthorizedOwner",
      "msg": "Unauthorized: only the certificate owner can claim"
    },
    {
      "code": 6003,
      "name": "raiseNotLive",
      "msg": "Raise is not live"
    },
    {
      "code": 6004,
      "name": "invalidStatus",
      "msg": "Invalid raise status for this instruction"
    },
    {
      "code": 6005,
      "name": "soldOut",
      "msg": "Share supply is sold out"
    },
    {
      "code": 6006,
      "name": "invalidSerial",
      "msg": "Serial must equal the next minted index"
    },
    {
      "code": 6007,
      "name": "invalidPrice",
      "msg": "Price must be greater than zero"
    },
    {
      "code": 6008,
      "name": "invalidSupply",
      "msg": "Share supply out of bounds"
    },
    {
      "code": 6009,
      "name": "invalidBps",
      "msg": "BPS out of bounds"
    },
    {
      "code": 6010,
      "name": "invalidAmount",
      "msg": "Amount must be greater than zero"
    },
    {
      "code": 6011,
      "name": "noSharesMinted",
      "msg": "Cannot deposit until at least one share is minted"
    },
    {
      "code": 6012,
      "name": "certificateMismatch",
      "msg": "Certificate does not belong to this raise"
    },
    {
      "code": 6013,
      "name": "nothingToClaim",
      "msg": "Nothing to claim"
    },
    {
      "code": 6014,
      "name": "insufficientVault",
      "msg": "Vault has insufficient claimable lamports"
    },
    {
      "code": 6015,
      "name": "sharesOutstanding",
      "msg": "Cannot cancel while shares are outstanding"
    },
    {
      "code": 6016,
      "name": "mathOverflow",
      "msg": "Arithmetic overflow"
    }
  ],
  "types": [
    {
      "name": "raise",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "founder",
            "type": "pubkey"
          },
          {
            "name": "projectSeed",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "raiseStatus"
              }
            }
          },
          {
            "name": "priceLamports",
            "type": "u64"
          },
          {
            "name": "shareSupply",
            "type": "u32"
          },
          {
            "name": "sharesMinted",
            "type": "u32"
          },
          {
            "name": "holderPoolBps",
            "type": "u16"
          },
          {
            "name": "founderRetainedBps",
            "type": "u16"
          },
          {
            "name": "goalLamports",
            "type": "u64"
          },
          {
            "name": "raisedLamports",
            "type": "u64"
          },
          {
            "name": "accPerShare",
            "type": "u128"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          },
          {
            "name": "minBuilderScore",
            "type": "u16"
          },
          {
            "name": "applicationHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "collection",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "raiseConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "oracle",
            "type": "pubkey"
          },
          {
            "name": "platformFeeBps",
            "type": "u16"
          },
          {
            "name": "platformTreasury",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "raiseStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "draft"
          },
          {
            "name": "live"
          },
          {
            "name": "filled"
          },
          {
            "name": "closed"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "raiseVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "shareCertificate",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "raise",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "serial",
            "type": "u32"
          },
          {
            "name": "lastAcc",
            "type": "u128"
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
