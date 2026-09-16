/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/builder_passport.json`.
 */
export type BuilderPassport = {
  "address": "7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD",
  "metadata": {
    "name": "builderPassport",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Builder Passport and Score on-chain program"
  },
  "instructions": [
    {
      "name": "close",
      "docs": [
        "Close a Builder Passport PDA (optional)"
      ],
      "discriminator": [
        98,
        165,
        201,
        177,
        108,
        65,
        206,
        96
      ],
      "accounts": [
        {
          "name": "passport",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  105,
                  108,
                  100,
                  101,
                  114,
                  45,
                  112,
                  97,
                  115,
                  115,
                  112,
                  111,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize a new Builder Passport PDA for a wallet"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "passport",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  105,
                  108,
                  100,
                  101,
                  114,
                  45,
                  112,
                  97,
                  115,
                  115,
                  112,
                  111,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
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
      "args": []
    },
    {
      "name": "initializeConfig",
      "docs": [
        "Initialize the global Config PDA (one-time, deployer only)"
      ],
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
        }
      ]
    },
    {
      "name": "updateOracle",
      "docs": [
        "Update the oracle pubkey (config authority only)"
      ],
      "discriminator": [
        112,
        41,
        209,
        18,
        248,
        226,
        252,
        188
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
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newOracle",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "updateScore",
      "docs": [
        "Update the Builder Score (oracle only)"
      ],
      "discriminator": [
        188,
        226,
        238,
        41,
        14,
        241,
        105,
        215
      ],
      "accounts": [
        {
          "name": "passport",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  105,
                  108,
                  100,
                  101,
                  114,
                  45,
                  112,
                  97,
                  115,
                  115,
                  112,
                  111,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "passport.authority",
                "account": "builderPassport"
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
          "docs": [
            "Oracle signer (must match config.oracle)"
          ],
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newScore",
          "type": "u16"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "builderPassport",
      "discriminator": [
        25,
        91,
        195,
        221,
        164,
        8,
        96,
        73
      ]
    },
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorizedUpdate",
      "msg": "Unauthorized: Only oracle can update scores"
    },
    {
      "code": 6001,
      "name": "unauthorizedClose",
      "msg": "Unauthorized: Only passport owner can close"
    },
    {
      "code": 6002,
      "name": "unauthorizedConfigUpdate",
      "msg": "Unauthorized: Only config authority can update oracle"
    }
  ],
  "types": [
    {
      "name": "builderLevel",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "rookie"
          },
          {
            "name": "builder"
          },
          {
            "name": "advanced"
          },
          {
            "name": "expert"
          },
          {
            "name": "genesis"
          }
        ]
      }
    },
    {
      "name": "builderPassport",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "The wallet that owns this passport"
            ],
            "type": "pubkey"
          },
          {
            "name": "score",
            "docs": [
              "Builder Score (0-10000)"
            ],
            "type": "u16"
          },
          {
            "name": "level",
            "docs": [
              "Builder level/tier"
            ],
            "type": {
              "defined": {
                "name": "builderLevel"
              }
            }
          },
          {
            "name": "lastUpdated",
            "docs": [
              "Last update timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Program authority (can update oracle)"
            ],
            "type": "pubkey"
          },
          {
            "name": "oracle",
            "docs": [
              "Oracle pubkey (can update all passport scores)"
            ],
            "type": "pubkey"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ]
};
